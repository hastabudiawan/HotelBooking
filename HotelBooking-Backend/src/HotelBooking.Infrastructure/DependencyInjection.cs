using HotelBooking.Application.Auth;
using HotelBooking.Application.Rooms;
using HotelBooking.Application.RoomTypes;
using HotelBooking.Infrastructure.Auth;
using HotelBooking.Infrastructure.Identity;
using HotelBooking.Infrastructure.Persistence;
using HotelBooking.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using HotelBooking.Application.Bookings;

namespace HotelBooking.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(config.GetConnectionString("DefaultConnection")));

        services.AddIdentityCore<ApplicationUser>(options =>
            {
                options.Password.RequiredLength = 8;
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = false;
                options.User.RequireUniqueEmail = true;
            })
            .AddRoles<IdentityRole<int>>()
            .AddEntityFrameworkStores<AppDbContext>();

        services.Configure<JwtSettings>(config.GetSection(JwtSettings.SectionName));
        services.AddScoped<JwtTokenGenerator>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IRoomTypeService, RoomTypeService>();
        services.AddScoped<IRoomService, RoomService>();
                services.AddSingleton(TimeProvider.System);
        services.AddScoped<IAvailabilityService, AvailabilityService>();
        services.AddScoped<IBookingService, BookingService>();
        return services;
    }
}