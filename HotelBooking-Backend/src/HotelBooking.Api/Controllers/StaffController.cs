using HotelBooking.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/staff")]
[Authorize(Roles = $"{AppRoles.Admin},{AppRoles.Receptionist}")]
public class StaffController : ControllerBase
{
    // Endpoint uji untuk memastikan pembatasan role bekerja.
    // Boleh dihapus setelah Panduan 04.
    [HttpGet("ping")]
    public IActionResult Ping() => Ok(new { message = "Halo staf hotel." });
}