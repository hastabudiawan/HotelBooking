using System.Linq.Expressions;
using HotelBooking.Application.Common;
using HotelBooking.Application.Rooms;
using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using HotelBooking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Services;

public class RoomService : IRoomService
{
    private static readonly Expression<Func<Room, RoomDto>> Projection =
        r => new RoomDto(r.Id, r.RoomNumber, r.RoomTypeId, r.RoomType.Name, r.Status);

    private readonly AppDbContext _db;

    public RoomService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<RoomDto>> GetAllAsync(int? roomTypeId, RoomStatus? status, CancellationToken ct = default)
    {
        var query = _db.Rooms.AsNoTracking();

        if (roomTypeId.HasValue)
            query = query.Where(r => r.RoomTypeId == roomTypeId.Value);

        if (status.HasValue)
            query = query.Where(r => r.Status == status.Value);

        return await query
            .OrderBy(r => r.RoomNumber)
            .Select(Projection)
            .ToListAsync(ct);
    }

    public async Task<ServiceResult<RoomDto>> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var dto = await _db.Rooms
            .AsNoTracking()
            .Where(r => r.Id == id)
            .Select(Projection)
            .FirstOrDefaultAsync(ct);

        return dto is null
            ? ServiceResult<RoomDto>.NotFound("Kamar tidak ditemukan.")
            : ServiceResult<RoomDto>.Ok(dto);
    }

    public async Task<ServiceResult<RoomDto>> CreateAsync(CreateRoomRequest request, CancellationToken ct = default)
    {
        var number = request.RoomNumber.Trim();

        if (!await _db.RoomTypes.AnyAsync(t => t.Id == request.RoomTypeId, ct))
            return ServiceResult<RoomDto>.Fail("Tipe kamar tidak ditemukan.");

        if (await _db.Rooms.AnyAsync(r => r.RoomNumber == number, ct))
            return ServiceResult<RoomDto>.Conflict($"Nomor kamar '{number}' sudah dipakai.");

        var room = new Room
        {
            RoomNumber = number,
            RoomTypeId = request.RoomTypeId,
            Status = RoomStatus.Available
        };

        _db.Rooms.Add(room);
        await _db.SaveChangesAsync(ct);

        return await GetByIdAsync(room.Id, ct);
    }

    public async Task<ServiceResult<RoomDto>> UpdateAsync(int id, UpdateRoomRequest request, CancellationToken ct = default)
    {
        var room = await _db.Rooms.FirstOrDefaultAsync(r => r.Id == id, ct);
        if (room is null)
            return ServiceResult<RoomDto>.NotFound("Kamar tidak ditemukan.");

        var number = request.RoomNumber.Trim();
        if (await _db.Rooms.AnyAsync(r => r.RoomNumber == number && r.Id != id, ct))
            return ServiceResult<RoomDto>.Conflict($"Nomor kamar '{number}' sudah dipakai.");

        if (room.RoomTypeId != request.RoomTypeId)
        {
            if (!await _db.RoomTypes.AnyAsync(t => t.Id == request.RoomTypeId, ct))
                return ServiceResult<RoomDto>.Fail("Tipe kamar tidak ditemukan.");

            var hasActiveBooking = await _db.Bookings.AnyAsync(b =>
                b.RoomId == id &&
                (b.Status == BookingStatus.Pending ||
                 b.Status == BookingStatus.Confirmed ||
                 b.Status == BookingStatus.CheckedIn), ct);

            if (hasActiveBooking)
                return ServiceResult<RoomDto>.Conflict("Kamar memiliki booking aktif, tipe kamar tidak bisa diubah.");
        }

        room.RoomNumber = number;
        room.RoomTypeId = request.RoomTypeId;
        await _db.SaveChangesAsync(ct);

        return await GetByIdAsync(id, ct);
    }

    public async Task<ServiceResult<RoomDto>> UpdateStatusAsync(int id, UpdateRoomStatusRequest request, CancellationToken ct = default)
    {
        var room = await _db.Rooms.FirstOrDefaultAsync(r => r.Id == id, ct);
        if (room is null)
            return ServiceResult<RoomDto>.NotFound("Kamar tidak ditemukan.");

        var newStatus = request.Status!.Value;

        if (newStatus == RoomStatus.Occupied)
            return ServiceResult<RoomDto>.Fail("Status Occupied diatur otomatis saat check-in.");

        if (room.Status == RoomStatus.Occupied)
            return ServiceResult<RoomDto>.Conflict("Kamar sedang terisi. Selesaikan check-out terlebih dahulu.");

        room.Status = newStatus;
        await _db.SaveChangesAsync(ct);

        return await GetByIdAsync(id, ct);
    }

    public async Task<ServiceResult> DeleteAsync(int id, CancellationToken ct = default)
    {
        var room = await _db.Rooms.FirstOrDefaultAsync(r => r.Id == id, ct);
        if (room is null)
            return ServiceResult.NotFound("Kamar tidak ditemukan.");

        if (await _db.Bookings.AnyAsync(b => b.RoomId == id, ct))
            return ServiceResult.Conflict("Kamar memiliki riwayat booking dan tidak bisa dihapus. Ubah statusnya menjadi Maintenance.");

        _db.Rooms.Remove(room);
        await _db.SaveChangesAsync(ct);

        return ServiceResult.Ok();
    }
}