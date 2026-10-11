using System.ComponentModel.DataAnnotations;

namespace HotelBooking.Application.Auth;

public class RegisterRequest
{
    [Required, MaxLength(100)]
    public string FullName { get; set; } = default!;

    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; set; } = default!;

    [Required, MinLength(8), MaxLength(100)]
    public string Password { get; set; } = default!;
}

public class CreateStaffRequest : RegisterRequest
{
}

public class LoginRequest
{
    [Required, EmailAddress]
    public string Email { get; set; } = default!;

    [Required]
    public string Password { get; set; } = default!;
}

public record AuthResponse(
    string Token,
    DateTime ExpiresAtUtc,
    int UserId,
    string FullName,
    string Email,
    IReadOnlyList<string> Roles);

public record UserProfileDto(
    int Id,
    string FullName,
    string Email,
    IReadOnlyList<string> Roles);