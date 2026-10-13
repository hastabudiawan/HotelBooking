using System.Net;
using HotelBooking.Application.Rooms;
using Xunit;

namespace HotelBooking.Tests.Integration;

[Collection("Api")]
[Trait("Category", "Integration")]
public class AccessControlTests(ApiFactory api)
{
    private static string ReportUrl()
    {
        var today = TestClock.Today.Iso();
        return $"/api/admin/reports/occupancy?from={today}&to={today}";
    }

    // Endpoint yang boleh diakses Admin dan Receptionist.
    private static readonly string[] StaffUrls = ["/api/admin/bookings", "/api/admin/rooms"];

    private static async Task AssertStatusAsync(HttpClient client, string url, HttpStatusCode expected)
    {
        var response = await client.GetAsync(url);
        Assert.True(response.StatusCode == expected,
            $"GET {url} seharusnya {(int)expected} tetapi {(int)response.StatusCode}.");
    }

    [Fact]
    public async Task Anonymous_CanReadPublicEndpoints_ButNotProtectedOnes()
    {
        var client = api.CreateClient();

        await AssertStatusAsync(client, "/api/room-types", HttpStatusCode.OK);

        string[] protectedUrls = [.. StaffUrls, ReportUrl(), "/api/bookings/my"];

        foreach (var url in protectedUrls)
            await AssertStatusAsync(client, url, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Guest_CannotUseStaffEndpoints()
    {
        var guest = await api.NewGuestAsync();

        string[] staffOnlyUrls = [.. StaffUrls, ReportUrl()];

        foreach (var url in staffOnlyUrls)
            await AssertStatusAsync(guest.Client, url, HttpStatusCode.Forbidden);

        // Tetapi tamu boleh melihat riwayat bookingnya sendiri.
        await AssertStatusAsync(guest.Client, "/api/bookings/my", HttpStatusCode.OK);
    }

    [Fact]
    public async Task Receptionist_CanOperate_ButNotSeeReportsOrManageRoomTypes()
    {
        var staff = await api.NewReceptionistAsync();

        foreach (var url in StaffUrls)
            await AssertStatusAsync(staff.Client, url, HttpStatusCode.OK);

        await AssertStatusAsync(staff.Client, ReportUrl(), HttpStatusCode.Forbidden);

        var create = await staff.Client.PostJsonAsync("/api/room-types",
            new { name = "Tidak Boleh", basePrice = 100000, capacity = 2 });
        await create.ShouldBeAsync(HttpStatusCode.Forbidden);

        var addRoom = await staff.Client.PostJsonAsync("/api/admin/rooms",
            new CreateRoomRequest { RoomNumber = "X-1", RoomTypeId = 1 });
        await addRoom.ShouldBeAsync(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task StaffAndAdmin_CannotCreateBookings()
    {
        var inventory = await api.CreateInventoryAsync(rooms: 1);
        var staff = await api.NewReceptionistAsync();
        var admin = await api.AdminAsync();
        var today = TestClock.Today;

        var asStaff = await staff.Client.BookAsync(inventory.RoomTypeId, today.AddDays(3), today.AddDays(4));
        await asStaff.ShouldBeAsync(HttpStatusCode.Forbidden);

        var asAdmin = await admin.BookAsync(inventory.RoomTypeId, today.AddDays(3), today.AddDays(4));
        await asAdmin.ShouldBeAsync(HttpStatusCode.Forbidden);
    }
}