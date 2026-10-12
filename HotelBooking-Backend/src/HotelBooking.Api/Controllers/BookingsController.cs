using System.Security.Claims;
using HotelBooking.Application.Bookings;
using HotelBooking.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/bookings")]
[Authorize(Roles = AppRoles.Guest)]
public class BookingsController : ApiControllerBase
{
    private readonly IBookingService _service;

    public BookingsController(IBookingService service)
    {
        _service = service;
    }

    // Id pengguna diambil dari claim "sub" di token (lihat Panduan 02), bukan dari body request,
    // sehingga tamu tidak bisa membuat atau melihat booking atas nama orang lain.
    private int CurrentUserId =>
        int.TryParse(User.FindFirstValue("sub"), out var id) ? id : 0;

    [HttpPost]
    public async Task<ActionResult<BookingDto>> Create(CreateBookingRequest request, CancellationToken ct)
    {
        var result = await _service.CreateAsync(CurrentUserId, request, ct);
        if (!result.Succeeded)
            return ToActionResult(result);

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result.Data);
    }

    [HttpGet("my")]
    public async Task<ActionResult<IReadOnlyList<BookingDto>>> My(CancellationToken ct)
    {
        return Ok(await _service.GetMyAsync(CurrentUserId, ct));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BookingDto>> GetById(int id, CancellationToken ct)
    {
        return ToActionResult(await _service.GetByIdAsync(CurrentUserId, id, ct));
    }

    [HttpPost("{id:int}/cancel")]
    public async Task<ActionResult<BookingDto>> Cancel(int id, CancellationToken ct)
    {
        return ToActionResult(await _service.CancelAsync(CurrentUserId, id, ct));
    }
}