namespace HotelBooking.Api.Dtos;

public record RoomTypeDto(
    int Id,
    string Name,
    string Slug,
    string Description,
    decimal BasePrice,
    int Capacity,
    string? ImageUrl);