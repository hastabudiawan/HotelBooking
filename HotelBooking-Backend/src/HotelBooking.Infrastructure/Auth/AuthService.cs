using HotelBooking.Application.Auth;
using HotelBooking.Application.Common;
using HotelBooking.Domain.Constants;
using HotelBooking.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;

namespace HotelBooking.Infrastructure.Auth;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly JwtTokenGenerator _jwt;

    public AuthService(UserManager<ApplicationUser> userManager, JwtTokenGenerator jwt)
    {
        _userManager = userManager;
        _jwt = jwt;
    }

    public async Task<ServiceResult<AuthResponse>> RegisterGuestAsync(RegisterRequest request)
    {
        var (user, errors) = await CreateUserAsync(request, AppRoles.Guest);
        if (user is null)
            return ServiceResult<AuthResponse>.Fail(errors);

        return ServiceResult<AuthResponse>.Ok(await BuildResponseAsync(user));
    }

    public async Task<ServiceResult<AuthResponse>> LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null || !await _userManager.CheckPasswordAsync(user, request.Password))
            return ServiceResult<AuthResponse>.Fail("Email atau password salah.");

        return ServiceResult<AuthResponse>.Ok(await BuildResponseAsync(user));
    }

    public async Task<UserProfileDto?> GetProfileAsync(int userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user is null) return null;

        var roles = await _userManager.GetRolesAsync(user);
        return new UserProfileDto(user.Id, user.FullName, user.Email!, roles.ToList());
    }

    public async Task<ServiceResult<UserProfileDto>> CreateStaffAsync(CreateStaffRequest request)
    {
        var (user, errors) = await CreateUserAsync(request, AppRoles.Receptionist);
        if (user is null)
            return ServiceResult<UserProfileDto>.Fail(errors);

        var roles = await _userManager.GetRolesAsync(user);
        return ServiceResult<UserProfileDto>.Ok(
            new UserProfileDto(user.Id, user.FullName, user.Email!, roles.ToList()));
    }

    private async Task<(ApplicationUser? User, string[] Errors)> CreateUserAsync(RegisterRequest request, string role)
    {
        if (await _userManager.FindByEmailAsync(request.Email) is not null)
            return (null, ["Email sudah terdaftar."]);

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName
        };

        var create = await _userManager.CreateAsync(user, request.Password);
        if (!create.Succeeded)
            return (null, create.Errors.Select(e => e.Description).ToArray());

        var addRole = await _userManager.AddToRoleAsync(user, role);
        if (!addRole.Succeeded)
            return (null, addRole.Errors.Select(e => e.Description).ToArray());

        return (user, []);
    }

    private async Task<AuthResponse> BuildResponseAsync(ApplicationUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var (token, expires) = _jwt.Generate(user, roles);
        return new AuthResponse(token, expires, user.Id, user.FullName, user.Email!, roles.ToList());
    }
}