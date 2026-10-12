using HotelBooking.Application.RoomTypes;
using HotelBooking.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/room-types")]
public class RoomTypesController : ApiControllerBase
{
    private readonly IRoomTypeService _service;

    public RoomTypesController(IRoomTypeService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<RoomTypeDto>>> GetAll(CancellationToken ct)
    {
        return Ok(await _service.GetAllAsync(ct));
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<RoomTypeDto>> GetBySlug(string slug, CancellationToken ct)
    {
        return ToActionResult(await _service.GetBySlugAsync(slug, ct));
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpPost]
    public async Task<ActionResult<RoomTypeDto>> Create(CreateRoomTypeRequest request, CancellationToken ct)
    {
        var result = await _service.CreateAsync(request, ct);
        if (!result.Succeeded)
            return ToActionResult(result);

        return CreatedAtAction(nameof(GetBySlug), new { slug = result.Data!.Slug }, result.Data);
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<RoomTypeDto>> Update(int id, UpdateRoomTypeRequest request, CancellationToken ct)
    {
        return ToActionResult(await _service.UpdateAsync(id, request, ct));
    }

    [Authorize(Roles = AppRoles.Admin)]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        return ToNoContent(await _service.DeleteAsync(id, ct));
    }
}