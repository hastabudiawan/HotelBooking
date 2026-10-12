using HotelBooking.Application.Operations;
using HotelBooking.Domain.Constants;
using HotelBooking.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/admin/bookings")]
[Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Receptionist}")]
public class AdminBookingsController : ApiControllerBase
{
    private readonly IStaffBookingService _service;

    public AdminBookingsController(IStaffBookingService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<StaffBookingDto>>> Search(
        [FromQuery] BookingStatus? status,
        [FromQuery] DateOnly? checkIn,
        [FromQuery] DateOnly? checkOut,
        [FromQuery] string? code,
        CancellationToken ct)
    {
        return Ok(await _service.SearchAsync(status, checkIn, checkOut, code, ct));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<StaffBookingDto>> GetById(int id, CancellationToken ct)
    {
        return ToActionResult(await _service.GetByIdAsync(id, ct));
    }

    [HttpPost("{id:int}/check-in")]
    public async Task<ActionResult<StaffBookingDto>> CheckIn(int id, CancellationToken ct)
    {
        return ToActionResult(await _service.CheckInAsync(id, ct));
    }

    [HttpPost("{id:int}/check-out")]
    public async Task<ActionResult<StaffBookingDto>> CheckOut(int id, CancellationToken ct)
    {
        return ToActionResult(await _service.CheckOutAsync(id, ct));
    }

    [HttpPost("{id:int}/no-show")]
    public async Task<ActionResult<StaffBookingDto>> NoShow(int id, CancellationToken ct)
    {
        return ToActionResult(await _service.MarkNoShowAsync(id, ct));
    }
}