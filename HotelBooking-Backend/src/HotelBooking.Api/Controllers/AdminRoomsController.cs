using HotelBooking.Application.Rooms;
using HotelBooking.Domain.Constants;
using HotelBooking.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/admin/rooms")]
[Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Receptionist}")]
public class AdminRoomsController : ApiControllerBase
{
    private readonly IRoomService _service;

    public AdminRoomsController(IRoomService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<RoomDto>>> GetAll(
        [FromQuery] int? roomTypeId,
        [FromQuery] RoomStatus? status,
        CancellationToken ct)
    {
        return Ok(await _service.GetAllAsync(roomTypeId, status, ct));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RoomDto>> GetById(int id, CancellationToken ct)
    {
        return ToActionResult(await _service.GetByIdAsync(id, ct));
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpPost]
    public async Task<ActionResult<RoomDto>> Create(CreateRoomRequest request, CancellationToken ct)
    {
        var result = await _service.CreateAsync(request, ct);
        if (!result.Succeeded)
            return ToActionResult(result);

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<RoomDto>> Update(int id, UpdateRoomRequest request, CancellationToken ct)
    {
        return ToActionResult(await _service.UpdateAsync(id, request, ct));
    }

    // Admin dan Receptionist boleh mengubah status (mengikuti atribut di level class).
    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<RoomDto>> UpdateStatus(int id, UpdateRoomStatusRequest request, CancellationToken ct)
    {
        return ToActionResult(await _service.UpdateStatusAsync(id, request, ct));
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        return ToNoContent(await _service.DeleteAsync(id, ct));
    }
}