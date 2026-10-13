using System.Net;
using System.Net.Http.Headers;
using HotelBooking.Application.Auth;
using HotelBooking.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace HotelBooking.Tests.Integration;

public sealed record TestUser(HttpClient Client, int UserId, string Email);

public sealed class ApiFactory : WebApplicationFactory<Program>
{
    public const string AdminEmail = "admin@test.local";
    public const string AdminPassword = "AdminTest123";

    private TestUser? _admin;

    public ApiFactory()
    {
        // Variabel lingkungan dipasang SEBELUM host dibuat. Nilainya menang atas appsettings dan user-secrets.
        Environment.SetEnvironmentVariable("ConnectionStrings__DefaultConnection", TestDatabase.GetConnectionString());
        Environment.SetEnvironmentVariable("Jwt__Key", "ini-kunci-khusus-integration-test-1234567890");
        Environment.SetEnvironmentVariable("SeedAdmin__Email", AdminEmail);
        Environment.SetEnvironmentVariable("SeedAdmin__Password", AdminPassword);

        // Job expiry memeriksa tiap 1 detik, bukan 60 detik.
        Environment.SetEnvironmentVariable("Booking__ExpiryCheckSeconds", "1");

        // Kurangi kebisingan log selama test.
        Environment.SetEnvironmentVariable("Logging__LogLevel__Default", "Warning");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Bukan Development: user-secrets milikmu tidak ikut terbaca.
        builder.UseEnvironment("Testing");
    }

    public async Task<TestUser> LoginAsync(string email, string password)
    {
        var client = CreateClient();

        var response = await client.PostJsonAsync("/api/auth/login",
            new LoginRequest { Email = email, Password = password });
        await response.ShouldBeAsync(HttpStatusCode.OK);

        var auth = await response.ReadJsonAsync<AuthResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.Token);

        return new TestUser(client, auth.UserId, email);
    }

    public async Task<HttpClient> AdminAsync()
    {
        _admin ??= await LoginAsync(AdminEmail, AdminPassword);
        return _admin.Client;
    }

    // Akses langsung ke database untuk menyiapkan atau memeriksa keadaan.
    public async Task<T> WithDbAsync<T>(Func<AppDbContext, Task<T>> action)
    {
        using var scope = Services.CreateScope();
        return await action(scope.ServiceProvider.GetRequiredService<AppDbContext>());
    }
}