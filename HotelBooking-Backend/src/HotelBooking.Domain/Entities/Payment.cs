using HotelBooking.Domain.Enums;

namespace HotelBooking.Domain.Entities;

public class Payment
{
    public int Id { get; set; }
    public int BookingId { get; set; }
    public Booking Booking { get; set; } = default!;
    public decimal Amount { get; set; }
    public string Method { get; set; } = "Simulasi";
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public DateTime? PaidAt { get; set; }
}