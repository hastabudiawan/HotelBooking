using HotelBooking.Api.Dtos;
using HotelBooking.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/room-types")]
public class RoomTypesController : ControllerBase
{
    private readonly AppDbContext _db;

    public RoomTypesController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<RoomTypeDto>>> GetAll(CancellationToken ct)
    {
        var items = await _db.RoomTypes
            .AsNoTracking()
            .OrderBy(x => x.BasePrice)
            .Select(x => new RoomTypeDto(x.Id, x.Name, x.Slug, x.Description, x.BasePrice, x.Capacity, x.ImageUrl))
            .ToListAsync(ct);

        return Ok(items);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<RoomTypeDto>> GetBySlug(string slug, CancellationToken ct)
    {
        var item = await _db.RoomTypes
            .AsNoTracking()
            .Where(x => x.Slug == slug)
            .Select(x => new RoomTypeDto(x.Id, x.Name, x.Slug, x.Description, x.BasePrice, x.Capacity, x.ImageUrl))
            .FirstOrDefaultAsync(ct);

        return item is null ? NotFound() : Ok(item);
    }
}