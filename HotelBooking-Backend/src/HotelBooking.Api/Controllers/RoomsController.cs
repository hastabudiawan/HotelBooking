using HotelBooking.Application.Bookings;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/rooms")]
public class RoomsController : ApiControllerBase
{
    private readonly IAvailabilityService _availability;

    public RoomsController(IAvailabilityService availability)
    {
        _availability = availability;
    }

    // Publik: dipakai halaman pencarian di frontend.
    [HttpGet("available")]
    public async Task<ActionResult<IReadOnlyList<AvailableRoomTypeDto>>> Available(
        [FromQuery] DateOnly checkIn,
        [FromQuery] DateOnly checkOut,
        [FromQuery] int guests = 1,
        CancellationToken ct = default)
    {
        return ToActionResult(await _availability.SearchAsync(checkIn, checkOut, guests, ct));
    }
}