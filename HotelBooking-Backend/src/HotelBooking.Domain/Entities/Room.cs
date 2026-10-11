using HotelBooking.Domain.Enums;

namespace HotelBooking.Domain.Entities;

public class Room
{
    public int Id { get; set; }
    public int RoomTypeId { get; set; }
    public RoomType RoomType { get; set; } = default!;
    public string RoomNumber { get; set; } = default!;
    public RoomStatus Status { get; set; } = RoomStatus.Available;
}