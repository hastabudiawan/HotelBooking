using HotelBooking.Application.Common;

namespace HotelBooking.Application.Auth;

public interface IAuthService
{
    Task<ServiceResult<AuthResponse>> RegisterGuestAsync(RegisterRequest request);
    Task<ServiceResult<AuthResponse>> LoginAsync(LoginRequest request);
    Task<UserProfileDto?> GetProfileAsync(int userId);
    Task<ServiceResult<UserProfileDto>> CreateStaffAsync(CreateStaffRequest request);
}