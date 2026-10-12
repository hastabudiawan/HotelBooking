using HotelBooking.Application.Common;

namespace HotelBooking.Application.RoomTypes;

public interface IRoomTypeService
{
    Task<IReadOnlyList<RoomTypeDto>> GetAllAsync(CancellationToken ct = default);
    Task<ServiceResult<RoomTypeDto>> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<ServiceResult<RoomTypeDto>> CreateAsync(CreateRoomTypeRequest request, CancellationToken ct = default);
    Task<ServiceResult<RoomTypeDto>> UpdateAsync(int id, UpdateRoomTypeRequest request, CancellationToken ct = default);
    Task<ServiceResult> DeleteAsync(int id, CancellationToken ct = default);
}