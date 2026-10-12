using HotelBooking.Application.Common;

namespace HotelBooking.Application.Operations;

public interface IReportService
{
    Task<ServiceResult<OccupancyReportDto>> GetOccupancyAsync(
        DateOnly fromDate, DateOnly toDate, CancellationToken ct = default);
}