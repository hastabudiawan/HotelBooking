using System.ComponentModel.DataAnnotations;
using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.Bookings;

public record AvailableRoomTypeDto(
    int RoomTypeId,
    string Name,
    string Slug,
    string Description,
    decimal PricePerNight,
    int Capacity,
    string? ImageUrl,
    int AvailableRooms,
    int Nights,
    decimal TotalPrice);

public record BookingDto(
    int Id,
    string BookingCode,
    int RoomId,
    string RoomNumber,
    string RoomTypeName,
    string RoomTypeSlug,
    DateOnly CheckIn,
    DateOnly CheckOut,
    int GuestCount,
    decimal TotalPrice,
    BookingStatus Status,
    DateTime? ExpiresAt,
    DateTime CreatedAt)
{
    public int Nights => CheckOut.DayNumber - CheckIn.DayNumber;
}

public class CreateBookingRequest
{
    [Range(1, int.MaxValue)]
    public int RoomTypeId { get; set; }

    public DateOnly CheckIn { get; set; }

    public DateOnly CheckOut { get; set; }

    [Range(1, 10)]
    public int GuestCount { get; set; }
}