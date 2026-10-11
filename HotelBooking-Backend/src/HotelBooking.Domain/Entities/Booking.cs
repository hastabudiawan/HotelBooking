using HotelBooking.Domain.Enums;

namespace HotelBooking.Domain.Entities;

public class Booking
{
    public int Id { get; set; }
    public string BookingCode { get; set; } = default!;
    public int UserId { get; set; }
    public int RoomId { get; set; }
    public Room Room { get; set; } = default!;

    public DateOnly CheckIn { get; set; }
    public DateOnly CheckOut { get; set; }
    public int GuestCount { get; set; }
    public decimal TotalPrice { get; set; }                // harga disimpan saat booking dibuat
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public DateTime? ExpiresAt { get; set; }               // batas waktu bayar untuk status Pending
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public byte[] RowVersion { get; set; } = default!;     // concurrency token

    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}