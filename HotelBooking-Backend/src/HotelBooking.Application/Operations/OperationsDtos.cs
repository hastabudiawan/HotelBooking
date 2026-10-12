using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.Operations;

public record StaffBookingDto(
    int Id,
    string BookingCode,
    string GuestName,
    string GuestEmail,
    int RoomId,
    string RoomNumber,
    string RoomTypeName,
    DateOnly CheckIn,
    DateOnly CheckOut,
    int GuestCount,
    decimal TotalPrice,
    BookingStatus Status,
    bool IsPaid,
    DateTime? ExpiresAt,
    DateTime CreatedAt)
{
    public int Nights => CheckOut.DayNumber - CheckIn.DayNumber;
}