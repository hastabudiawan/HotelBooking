using HotelBooking.Application.Common;
using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.Operations;

public interface IStaffBookingService
{
    Task<IReadOnlyList<StaffBookingDto>> SearchAsync(
        BookingStatus? status, DateOnly? checkIn, DateOnly? checkOut, string? code, CancellationToken ct = default);

    Task<ServiceResult<StaffBookingDto>> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ServiceResult<StaffBookingDto>> CheckInAsync(int id, CancellationToken ct = default);
    Task<ServiceResult<StaffBookingDto>> CheckOutAsync(int id, CancellationToken ct = default);
    Task<ServiceResult<StaffBookingDto>> MarkNoShowAsync(int id, CancellationToken ct = default);
}