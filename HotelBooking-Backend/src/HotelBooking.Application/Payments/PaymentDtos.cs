using System.ComponentModel.DataAnnotations;
using HotelBooking.Application.Bookings;
using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.Payments;

public record PaymentDto(
    int Id,
    int BookingId,
    decimal Amount,
    string Method,
    PaymentStatus Status,
    DateTime? PaidAt);

public record PaymentResultDto(PaymentDto Payment, BookingDto Booking);

public class PayBookingRequest
{
    [Required, MaxLength(30)]
    public string Method { get; set; } = default!;

    // Hanya untuk simulasi: memaksa pembayaran ditolak.
    public bool SimulateFailure { get; set; }
}