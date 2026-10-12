using System.ComponentModel.DataAnnotations;
using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.Rooms;

public record RoomDto(
    int Id,
    string RoomNumber,
    int RoomTypeId,
    string RoomTypeName,
    RoomStatus Status);

public class CreateRoomRequest
{
    [Required, MaxLength(10)]
    public string RoomNumber { get; set; } = default!;

    [Range(1, int.MaxValue)]
    public int RoomTypeId { get; set; }
}

public class UpdateRoomRequest : CreateRoomRequest
{
}

public class UpdateRoomStatusRequest
{
    // Nullable agar body yang tidak menyertakan status ditolak,
    // bukan diam-diam dianggap nilai enum pertama (Available).
    [Required]
    [EnumDataType(typeof(RoomStatus))]
    public RoomStatus? Status { get; set; }
}