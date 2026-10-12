using HotelBooking.Application.Bookings;
using HotelBooking.Application.Common;
using HotelBooking.Application.Operations;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using HotelBooking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Services;

public class StaffBookingService : IStaffBookingService
{
    private const int MaxResults = 200;

    private readonly AppDbContext _db;
    private readonly TimeProvider _time;

    public StaffBookingService(AppDbContext db, TimeProvider time)
    {
        _db = db;
        _time = time;
    }

    public async Task<IReadOnlyList<StaffBookingDto>> SearchAsync(
        BookingStatus? status, DateOnly? checkIn, DateOnly? checkOut, string? code, CancellationToken ct = default)
    {
        var query = _db.Bookings.AsNoTracking();

        if (status.HasValue)
            query = query.Where(b => b.Status == status.Value);

        if (checkIn.HasValue)
            query = query.Where(b => b.CheckIn == checkIn.Value);

        if (checkOut.HasValue)
            query = query.Where(b => b.CheckOut == checkOut.Value);

        if (!string.IsNullOrWhiteSpace(code))
        {
            var term = code.Trim();
            query = query.Where(b => b.BookingCode.Contains(term));
        }

        return await ProjectAsync(query, MaxResults, ct);
    }

    public async Task<ServiceResult<StaffBookingDto>> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var rows = await ProjectAsync(_db.Bookings.AsNoTracking().Where(b => b.Id == id), 1, ct);

        return rows.Count == 0
            ? ServiceResult<StaffBookingDto>.NotFound("Booking tidak ditemukan.")
            : ServiceResult<StaffBookingDto>.Ok(rows[0]);
    }

    public async Task<ServiceResult<StaffBookingDto>> CheckInAsync(int id, CancellationToken ct = default)
    {
        var booking = await _db.Bookings.Include(b => b.Room).FirstOrDefaultAsync(b => b.Id == id, ct);

        if (booking is null)
            return ServiceResult<StaffBookingDto>.NotFound("Booking tidak ditemukan.");

        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        // Kunci kamar, lalu muat ulang statusnya: staf lain mungkin baru saja mengubahnya
        // selagi kita menunggu kunci.
        await _db.LockRoomAsync(booking.RoomId, ct);
        await _db.Entry(booking.Room).ReloadAsync(ct);

        var error = FrontDeskRules.ValidateCheckIn(
            booking.Status, booking.Room.Status, BookingRules.Today(_time), booking.CheckIn, booking.CheckOut);

        if (error is not null)
            return ServiceResult<StaffBookingDto>.Conflict(error);

        booking.Status = BookingStatus.CheckedIn;
        booking.Room.Status = RoomStatus.Occupied;

        try
        {
            await _db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            return ServiceResult<StaffBookingDto>.Conflict(
                "Booking baru saja berubah (dibatalkan atau diproses staf lain). Muat ulang lalu coba lagi.");
        }

        return await GetByIdAsync(id, ct);
    }

    public async Task<ServiceResult<StaffBookingDto>> CheckOutAsync(int id, CancellationToken ct = default)
    {
        var booking = await _db.Bookings.Include(b => b.Room).FirstOrDefaultAsync(b => b.Id == id, ct);

        if (booking is null)
            return ServiceResult<StaffBookingDto>.NotFound("Booking tidak ditemukan.");

        var error = FrontDeskRules.ValidateCheckOut(booking.Status);
        if (error is not null)
            return ServiceResult<StaffBookingDto>.Conflict(error);

        booking.Status = BookingStatus.CheckedOut;
        booking.Room.Status = RoomStatus.Cleaning;   // menunggu housekeeping

        if (!await TrySaveAsync(ct))
            return ServiceResult<StaffBookingDto>.Conflict(
                "Booking baru saja berubah. Muat ulang lalu coba lagi.");

        return await GetByIdAsync(id, ct);
    }

    public async Task<ServiceResult<StaffBookingDto>> MarkNoShowAsync(int id, CancellationToken ct = default)
    {
        var booking = await _db.Bookings.FirstOrDefaultAsync(b => b.Id == id, ct);

        if (booking is null)
            return ServiceResult<StaffBookingDto>.NotFound("Booking tidak ditemukan.");

        var error = FrontDeskRules.ValidateNoShow(booking.Status, BookingRules.Today(_time), booking.CheckIn);
        if (error is not null)
            return ServiceResult<StaffBookingDto>.Conflict(error);

        booking.Status = BookingStatus.NoShow;

        if (!await TrySaveAsync(ct))
            return ServiceResult<StaffBookingDto>.Conflict(
                "Booking baru saja berubah. Muat ulang lalu coba lagi.");

        return await GetByIdAsync(id, ct);
    }

    private async Task<bool> TrySaveAsync(CancellationToken ct)
    {
        try
        {
            await _db.SaveChangesAsync(ct);
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            return false;
        }
    }

    // Filter diterapkan pada entity Booking lebih dulu, baru digabung dengan tabel pengguna
    // untuk nama dan email tamu. Pemetaan ke DTO dilakukan di memori.
    private async Task<List<StaffBookingDto>> ProjectAsync(
        IQueryable<Booking> bookings, int take, CancellationToken ct)
    {
        var rows = await (
            from b in bookings
            join u in _db.Users.AsNoTracking() on b.UserId equals u.Id
            orderby b.CheckIn, b.Id
            select new
            {
                b.Id,
                b.BookingCode,
                GuestName = u.FullName,
                GuestEmail = u.Email,
                b.RoomId,
                RoomNumber = b.Room.RoomNumber,
                RoomTypeName = b.Room.RoomType.Name,
                b.CheckIn,
                b.CheckOut,
                b.GuestCount,
                b.TotalPrice,
                b.Status,
                IsPaid = b.Payments.Any(p => p.Status == PaymentStatus.Paid),
                b.ExpiresAt,
                b.CreatedAt
            })
            .Take(take)
            .ToListAsync(ct);

        return rows.Select(r => new StaffBookingDto(
                r.Id,
                r.BookingCode,
                r.GuestName,
                r.GuestEmail ?? string.Empty,
                r.RoomId,
                r.RoomNumber,
                r.RoomTypeName,
                r.CheckIn,
                r.CheckOut,
                r.GuestCount,
                r.TotalPrice,
                r.Status,
                r.IsPaid,
                r.ExpiresAt is { } expires ? DateTime.SpecifyKind(expires, DateTimeKind.Utc) : null,
                DateTime.SpecifyKind(r.CreatedAt, DateTimeKind.Utc)))
            .ToList();
    }
}