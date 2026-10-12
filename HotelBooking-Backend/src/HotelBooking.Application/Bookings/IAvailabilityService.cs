using HotelBooking.Application.Common;

namespace HotelBooking.Application.Bookings;

public interface IAvailabilityService
{
    Task<ServiceResult<IReadOnlyList<AvailableRoomTypeDto>>> SearchAsync(
        DateOnly checkIn, DateOnly checkOut, int guests, CancellationToken ct = default);
}