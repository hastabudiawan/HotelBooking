using HotelBooking.Application.Common;

namespace HotelBooking.Application.Bookings;

public interface IBookingService
{
    Task<ServiceResult<BookingDto>> CreateAsync(int userId, CreateBookingRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<BookingDto>> GetMyAsync(int userId, CancellationToken ct = default);
    Task<ServiceResult<BookingDto>> GetByIdAsync(int userId, int bookingId, CancellationToken ct = default);
    Task<ServiceResult<BookingDto>> CancelAsync(int userId, int bookingId, CancellationToken ct = default);
}