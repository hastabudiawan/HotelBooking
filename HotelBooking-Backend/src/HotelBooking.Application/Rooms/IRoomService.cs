using HotelBooking.Application.Common;
using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.Rooms;

public interface IRoomService
{
    Task<IReadOnlyList<RoomDto>> GetAllAsync(int? roomTypeId, RoomStatus? status, CancellationToken ct = default);
    Task<ServiceResult<RoomDto>> GetByIdAsync(int id, CancellationToken ct = default);
    Task<ServiceResult<RoomDto>> CreateAsync(CreateRoomRequest request, CancellationToken ct = default);
    Task<ServiceResult<RoomDto>> UpdateAsync(int id, UpdateRoomRequest request, CancellationToken ct = default);
    Task<ServiceResult<RoomDto>> UpdateStatusAsync(int id, UpdateRoomStatusRequest request, CancellationToken ct = default);
    Task<ServiceResult> DeleteAsync(int id, CancellationToken ct = default);
}