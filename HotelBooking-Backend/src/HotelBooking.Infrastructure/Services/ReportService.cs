using HotelBooking.Application.Common;
using HotelBooking.Application.Operations;
using HotelBooking.Domain.Enums;
using HotelBooking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Services;

public class ReportService : IReportService
{
    private const int MaxDays = 92;

    private readonly AppDbContext _db;

    public ReportService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ServiceResult<OccupancyReportDto>> GetOccupancyAsync(
        DateOnly fromDate, DateOnly toDate, CancellationToken ct = default)
    {
        if (toDate < fromDate)
            return ServiceResult<OccupancyReportDto>.Fail("Tanggal akhir tidak boleh sebelum tanggal awal.");

        var days = toDate.DayNumber - fromDate.DayNumber + 1;
        if (days > MaxDays)
            return ServiceResult<OccupancyReportDto>.Fail($"Rentang laporan maksimal {MaxDays} hari.");

        var totalRooms = await _db.Rooms.CountAsync(ct);

        var endExclusive = toDate.AddDays(1);

        var stays = await _db.Bookings.AsNoTracking()
            .Where(b => b.CheckIn < endExclusive && b.CheckOut > fromDate &&
                        (b.Status == BookingStatus.Confirmed ||
                         b.Status == BookingStatus.CheckedIn ||
                         b.Status == BookingStatus.CheckedOut))
            .Select(b => new StayRange(b.CheckIn, b.CheckOut, b.TotalPrice))
            .ToListAsync(ct);

        return ServiceResult<OccupancyReportDto>.Ok(
            OccupancyCalculator.Calculate(stays, fromDate, toDate, totalRooms));
    }
}