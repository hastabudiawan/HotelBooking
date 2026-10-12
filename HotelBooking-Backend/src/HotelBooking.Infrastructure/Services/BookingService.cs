using System.Security.Cryptography;
using HotelBooking.Application.Bookings;
using HotelBooking.Application.Common;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using HotelBooking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Services;

public class BookingService : IBookingService
{
    private readonly AppDbContext _db;
    private readonly TimeProvider _time;

    public BookingService(AppDbContext db, TimeProvider time)
    {
        _db = db;
        _time = time;
    }

    public async Task<ServiceResult<BookingDto>> CreateAsync(
        int userId, CreateBookingRequest request, CancellationToken ct = default)
    {
        var error = BookingRules.ValidateStay(request.CheckIn, request.CheckOut, BookingRules.Today(_time));
        if (error is not null)
            return ServiceResult<BookingDto>.Fail(error);

        var type = await _db.RoomTypes.AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == request.RoomTypeId, ct);

        if (type is null)
            return ServiceResult<BookingDto>.Fail("Tipe kamar tidak ditemukan.");

        if (request.GuestCount > type.Capacity)
            return ServiceResult<BookingDto>.Fail(
                $"Tipe {type.Name} hanya muat maksimal {type.Capacity} tamu.");

        var nights = request.CheckOut.DayNumber - request.CheckIn.DayNumber;

        // Transaksi dengan isolasi bawaan (Read Committed). Perlindungan dari double booking
        // datang dari penguncian baris kamar di bawah, bukan dari level isolasi.
        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        var candidateRoomIds = await _db.Rooms.AsNoTracking()
            .Where(r => r.RoomTypeId == type.Id && r.Status != RoomStatus.Maintenance)
            .OrderBy(r => r.RoomNumber)
            .Select(r => r.Id)
            .ToListAsync(ct);

        foreach (var roomId in candidateRoomIds)
        {
            // Kunci baris kamar sampai transaksi selesai. Permintaan lain untuk kamar yang sama
            // menunggu di sini, lalu membaca hasil yang sudah ter-commit.
            await _db.Database.ExecuteSqlInterpolatedAsync(
                $"SELECT 1 FROM Rooms WITH (UPDLOCK, ROWLOCK) WHERE Id = {roomId}", ct);

            var nowUtc = _time.GetUtcNow().UtcDateTime;

            var taken = await _db.Bookings
                .Where(b => b.RoomId == roomId)
                .Overlapping(request.CheckIn, request.CheckOut, nowUtc)
                .AnyAsync(ct);

            if (taken)
                continue;

            var booking = new Booking
            {
                BookingCode = await NewUniqueCodeAsync(nowUtc, ct),
                UserId = userId,
                RoomId = roomId,
                CheckIn = request.CheckIn,
                CheckOut = request.CheckOut,
                GuestCount = request.GuestCount,
                TotalPrice = nights * type.BasePrice,
                Status = BookingStatus.Pending,
                ExpiresAt = nowUtc.AddMinutes(BookingRules.HoldMinutes),
                CreatedAt = nowUtc
            };

            _db.Bookings.Add(booking);
            await _db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);

            return await GetByIdAsync(userId, booking.Id, ct);
        }

        // Tidak ada kamar kosong. Transaksi dibatalkan otomatis saat keluar dari blok (dispose).
        return ServiceResult<BookingDto>.Conflict(
            $"Tidak ada kamar {type.Name} yang tersedia pada tanggal tersebut.");
    }

    public async Task<IReadOnlyList<BookingDto>> GetMyAsync(int userId, CancellationToken ct = default)
    {
        var bookings = await BookingsWithRoom()
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync(ct);

        return bookings.Select(ToDto).ToList();
    }

    public async Task<ServiceResult<BookingDto>> GetByIdAsync(
        int userId, int bookingId, CancellationToken ct = default)
    {
        var booking = await BookingsWithRoom()
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId, ct);

        return booking is null
            ? ServiceResult<BookingDto>.NotFound("Booking tidak ditemukan.")
            : ServiceResult<BookingDto>.Ok(ToDto(booking));
    }

    public async Task<ServiceResult<BookingDto>> CancelAsync(
        int userId, int bookingId, CancellationToken ct = default)
    {
        var booking = await _db.Bookings
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId, ct);

        if (booking is null)
            return ServiceResult<BookingDto>.NotFound("Booking tidak ditemukan.");

        if (booking.Status is not (BookingStatus.Pending or BookingStatus.Confirmed))
            return ServiceResult<BookingDto>.Conflict(
                $"Booking dengan status {booking.Status} tidak bisa dibatalkan.");

        // Kebijakan sederhana: booking yang sudah dibayar hanya bisa dibatalkan sebelum hari check-in.
        // Pengembalian dana simulasi ditambahkan di Panduan 05.
        if (booking.Status == BookingStatus.Confirmed && booking.CheckIn <= BookingRules.Today(_time))
            return ServiceResult<BookingDto>.Conflict(
                "Booking yang sudah dibayar tidak bisa dibatalkan pada atau setelah tanggal check-in.");

        booking.Status = BookingStatus.Cancelled;
        booking.ExpiresAt = null;

        try
        {
            await _db.SaveChangesAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            // RowVersion berubah: booking diubah proses lain (misalnya pembayaran) saat kita membacanya.
            return ServiceResult<BookingDto>.Conflict(
                "Booking baru saja berubah. Muat ulang lalu coba lagi.");
        }

        return await GetByIdAsync(userId, bookingId, ct);
    }

    private IQueryable<Booking> BookingsWithRoom() =>
        _db.Bookings.AsNoTracking()
            .Include(b => b.Room)
            .ThenInclude(r => r.RoomType);

    // Waktu dari database tidak membawa informasi zona. SpecifyKind menandainya UTC
    // sehingga JSON berakhiran "Z" dan frontend tidak salah menafsirkannya sebagai waktu lokal.
    private static BookingDto ToDto(Booking b) => new(
        b.Id,
        b.BookingCode,
        b.RoomId,
        b.Room.RoomNumber,
        b.Room.RoomType.Name,
        b.Room.RoomType.Slug,
        b.CheckIn,
        b.CheckOut,
        b.GuestCount,
        b.TotalPrice,
        b.Status,
        b.ExpiresAt is { } expires ? DateTime.SpecifyKind(expires, DateTimeKind.Utc) : null,
        DateTime.SpecifyKind(b.CreatedAt, DateTimeKind.Utc));

    // Contoh hasil: HB261112-K7M2P. Huruf yang mirip angka (0, O, 1, I) sengaja dibuang.
    private async Task<string> NewUniqueCodeAsync(DateTime nowUtc, CancellationToken ct)
    {
        const string alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

        while (true)
        {
            var suffix = string.Create(5, alphabet, (span, chars) =>
            {
                for (var i = 0; i < span.Length; i++)
                    span[i] = chars[RandomNumberGenerator.GetInt32(chars.Length)];
            });

            var code = $"HB{nowUtc:yyMMdd}-{suffix}";

            if (!await _db.Bookings.AnyAsync(b => b.BookingCode == code, ct))
                return code;
        }
    }
}