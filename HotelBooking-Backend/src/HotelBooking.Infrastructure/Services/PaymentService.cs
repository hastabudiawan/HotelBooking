using HotelBooking.Application.Bookings;
using HotelBooking.Application.Common;
using HotelBooking.Application.Payments;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using HotelBooking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Services;

public class PaymentService : IPaymentService
{
    private readonly AppDbContext _db;
    private readonly TimeProvider _time;
    private readonly IBookingService _bookings;

    public PaymentService(AppDbContext db, TimeProvider time, IBookingService bookings)
    {
        _db = db;
        _time = time;
        _bookings = bookings;
    }

    public async Task<ServiceResult<PaymentResultDto>> PayAsync(
        int userId, int bookingId, PayBookingRequest request, CancellationToken ct = default)
    {
        var method = PaymentRules.Normalize(request.Method);
        if (method is null)
            return ServiceResult<PaymentResultDto>.Fail(
                $"Metode pembayaran tidak dikenal. Pilihan: {string.Join(", ", PaymentRules.Methods)}.");

        var booking = await _db.Bookings
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId, ct);

        if (booking is null)
            return ServiceResult<PaymentResultDto>.NotFound("Booking tidak ditemukan.");

        if (booking.Status != BookingStatus.Pending)
            return ServiceResult<PaymentResultDto>.Conflict(
                $"Booking berstatus {booking.Status}, tidak bisa dibayar.");

        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        // Kunci kamar dulu, baru menilai waktu. Urutannya penting (lihat bagian 3 panduan).
        await _db.LockRoomAsync(booking.RoomId, ct);

        var now = _time.GetUtcNow().UtcDateTime;

        if (booking.ExpiresAt is null || booking.ExpiresAt <= now)
            return ServiceResult<PaymentResultDto>.Conflict(
                "Batas waktu pembayaran sudah lewat. Silakan buat booking baru.");

        var succeeded = !request.SimulateFailure;

        var payment = new Payment
        {
            BookingId = booking.Id,
            Amount = booking.TotalPrice,
            Method = method,
            Status = succeeded ? PaymentStatus.Paid : PaymentStatus.Failed,
            PaidAt = succeeded ? now : null
        };

        _db.Payments.Add(payment);

        if (succeeded)
        {
            booking.Status = BookingStatus.Confirmed;
            booking.ExpiresAt = null;
        }

        try
        {
            await _db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            // Booking berubah (dibatalkan, dibayar permintaan lain, atau di-expire) sejak kita membacanya.
            // Tidak ada yang tersimpan: SaveChanges gagal dan transaksi dibatalkan saat keluar dari blok.
            return ServiceResult<PaymentResultDto>.Conflict(
                "Booking baru saja berubah (dibatalkan, sudah dibayar, atau kedaluwarsa). Muat ulang lalu coba lagi.");
        }

        var bookingResult = await _bookings.GetByIdAsync(userId, bookingId, ct);

        return ServiceResult<PaymentResultDto>.Ok(new PaymentResultDto(ToDto(payment), bookingResult.Data!));
    }

    public async Task<ServiceResult<IReadOnlyList<PaymentDto>>> GetByBookingAsync(
        int userId, int bookingId, CancellationToken ct = default)
    {
        var owns = await _db.Bookings.AsNoTracking()
            .AnyAsync(b => b.Id == bookingId && b.UserId == userId, ct);

        if (!owns)
            return ServiceResult<IReadOnlyList<PaymentDto>>.NotFound("Booking tidak ditemukan.");

        var payments = await _db.Payments.AsNoTracking()
            .Where(p => p.BookingId == bookingId)
            .OrderBy(p => p.Id)
            .ToListAsync(ct);

        return ServiceResult<IReadOnlyList<PaymentDto>>.Ok(payments.Select(ToDto).ToList());
    }

    private static PaymentDto ToDto(Payment p) => new(
        p.Id,
        p.BookingId,
        p.Amount,
        p.Method,
        p.Status,
        p.PaidAt is { } paidAt ? DateTime.SpecifyKind(paidAt, DateTimeKind.Utc) : null);
}