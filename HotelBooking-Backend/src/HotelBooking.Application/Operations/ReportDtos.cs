namespace HotelBooking.Application.Operations;

// Satu masa menginap yang dihitung di laporan.
public record StayRange(DateOnly CheckIn, DateOnly CheckOut, decimal TotalPrice);

public record OccupancyDayDto(
    DateOnly Date,
    int RoomsSold,
    int TotalRooms,
    decimal OccupancyRate,
    decimal Revenue);

public record OccupancyReportDto(
    DateOnly From,
    DateOnly To,
    int TotalRooms,
    int RoomNightsSold,
    int RoomNightsAvailable,
    decimal OccupancyRate,
    decimal Revenue,
    IReadOnlyList<OccupancyDayDto> Days);