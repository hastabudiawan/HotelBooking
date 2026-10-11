using System.Security.Claims;
using HotelBooking.Application.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelBooking.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var result = await _auth.RegisterGuestAsync(request);
        if (!result.Succeeded)
            return Problem(title: "Registrasi gagal", detail: string.Join(" ", result.Errors), statusCode: 400);

        return Ok(result.Data);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var result = await _auth.LoginAsync(request);
        if (!result.Succeeded)
            return Problem(title: "Login gagal", detail: string.Join(" ", result.Errors), statusCode: 401);

        return Ok(result.Data);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserProfileDto>> Me()
    {
        var sub = User.FindFirstValue("sub");
        if (!int.TryParse(sub, out var userId))
            return Unauthorized();

        var profile = await _auth.GetProfileAsync(userId);
        return profile is null ? Unauthorized() : Ok(profile);
    }
}