using HotelBooking.Application.Bookings;
using HotelBooking.Application.Common;
using HotelBooking.Domain.Enums;
using HotelBooking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Services;

public class AvailabilityService : IAvailabilityService
{
    private readonly AppDbContext _db;
    private readonly TimeProvider _time;

    public AvailabilityService(AppDbContext db, TimeProvider time)
    {
        _db = db;
        _time = time;
    }

    public async Task<ServiceResult<IReadOnlyList<AvailableRoomTypeDto>>> SearchAsync(
        DateOnly checkIn, DateOnly checkOut, int guests, CancellationToken ct = default)
    {
        if (guests < 1)
            return ServiceResult<IReadOnlyList<AvailableRoomTypeDto>>.Fail("Jumlah tamu minimal 1.");

        var error = BookingRules.ValidateStay(checkIn, checkOut, BookingRules.Today(_time));
        if (error is not null)
            return ServiceResult<IReadOnlyList<AvailableRoomTypeDto>>.Fail(error);

        var nowUtc = _time.GetUtcNow().UtcDateTime;
        var nights = checkOut.DayNumber - checkIn.DayNumber;

        // 1. Kamar yang sudah ditahan booking lain pada rentang ini.
        var busyRoomIds = await _db.Bookings.AsNoTracking()
            .Overlapping(checkIn, checkOut, nowUtc)
            .Select(b => b.RoomId)
            .Distinct()
            .ToListAsync(ct);

        // 2. Jumlah kamar kosong per tipe (kamar Maintenance tidak dihitung).
        var freeCounts = await _db.Rooms.AsNoTracking()
            .Where(r => r.Status != RoomStatus.Maintenance && !busyRoomIds.Contains(r.Id))
            .GroupBy(r => r.RoomTypeId)
            .Select(g => new { RoomTypeId = g.Key, Count = g.Count() })
            .ToListAsync(ct);

        var typeIds = freeCounts.Select(x => x.RoomTypeId).ToList();

        // 3. Tipe yang muat untuk jumlah tamu, dari yang termurah.
        var types = await _db.RoomTypes.AsNoTracking()
            .Where(t => t.Capacity >= guests && typeIds.Contains(t.Id))
            .OrderBy(t => t.BasePrice)
            .ToListAsync(ct);

        var result = types
            .Select(t => new AvailableRoomTypeDto(
                t.Id, t.Name, t.Slug, t.Description, t.BasePrice, t.Capacity, t.ImageUrl,
                freeCounts.First(x => x.RoomTypeId == t.Id).Count,
                nights,
                nights * t.BasePrice))
            .ToList();

        return ServiceResult<IReadOnlyList<AvailableRoomTypeDto>>.Ok(result);
    }
}