using HotelBooking.Application.Auth;
using HotelBooking.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = AppRoles.Admin)]
public class AdminController : ControllerBase
{
    private readonly IAuthService _auth;

    public AdminController(IAuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("staff")]
    public async Task<ActionResult<UserProfileDto>> CreateStaff(CreateStaffRequest request)
    {
        var result = await _auth.CreateStaffAsync(request);
        if (!result.Succeeded)
            return Problem(title: "Gagal membuat staf", detail: string.Join(" ", result.Errors), statusCode: 400);

        return Ok(result.Data);
    }
}