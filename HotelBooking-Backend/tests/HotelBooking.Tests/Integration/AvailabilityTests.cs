using System.Net;
using HotelBooking.Application.Bookings;
using HotelBooking.Application.Rooms;
using HotelBooking.Domain.Enums;
using Xunit;

namespace HotelBooking.Tests.Integration;

[Collection("Api")]
[Trait("Category", "Integration")]
public class AvailabilityTests(ApiFactory api)
{
    [Fact]
    public async Task Search_ShowsRemainingRoomsAndTotalPrice_AndIsPublic()
    {
        var inventory = await api.CreateInventoryAsync(rooms: 2, capacity: 2, price: 500_000m);
        var guest = await api.NewGuestAsync();
        var anonymous = api.CreateClient();

        var checkIn = TestClock.Today.AddDays(10);
        var checkOut = checkIn.AddDays(3);

        var list = await anonymous.GetJsonAsync<List<AvailableRoomTypeDto>>(
            HttpExtensions.SearchUrl(checkIn, checkOut, guests: 2));

        var entry = Assert.Single(list, t => t.RoomTypeId == inventory.RoomTypeId);
        Assert.Equal(2, entry.AvailableRooms);
        Assert.Equal(3, entry.Nights);
        Assert.Equal(500_000m, entry.PricePerNight);
        Assert.Equal(1_500_000m, entry.TotalPrice);

        // Tipe berkapasitas 2 tidak muncul untuk 3 tamu.
        var tooMany = await anonymous.GetJsonAsync<List<AvailableRoomTypeDto>>(
            HttpExtensions.SearchUrl(checkIn, checkOut, guests: 3));
        Assert.DoesNotContain(tooMany, t => t.RoomTypeId == inventory.RoomTypeId);

        // Setiap booking mengurangi stok. Setelah habis, tipenya hilang dari hasil.
        var first = await guest.Client.BookOkAsync(inventory.RoomTypeId, checkIn, checkOut);
        Assert.Equal(1, await anonymous.AvailableRoomsAsync(inventory.RoomTypeId, checkIn, checkOut));

        await guest.Client.BookOkAsync(inventory.RoomTypeId, checkIn, checkOut);
        Assert.Equal(0, await anonymous.AvailableRoomsAsync(inventory.RoomTypeId, checkIn, checkOut));

        // Pembatalan mengembalikan stok.
        var cancel = await guest.Client.PostJsonAsync($"/api/bookings/{first.Id}/cancel");
        await cancel.ShouldBeAsync(HttpStatusCode.OK);
        Assert.Equal(1, await anonymous.AvailableRoomsAsync(inventory.RoomTypeId, checkIn, checkOut));
    }

    [Fact]
    public async Task Search_ExcludesRoomsUnderMaintenance()
    {
        var inventory = await api.CreateInventoryAsync(rooms: 1);
        var staff = await api.NewReceptionistAsync();
        var anonymous = api.CreateClient();

        var checkIn = TestClock.Today.AddDays(12);
        var checkOut = checkIn.AddDays(1);
        var roomId = inventory.Rooms[0].Id;

        var toMaintenance = await staff.Client.PatchJsonAsync($"/api/admin/rooms/{roomId}/status",
            new UpdateRoomStatusRequest { Status = RoomStatus.Maintenance });
        await toMaintenance.ShouldBeAsync(HttpStatusCode.OK);

        Assert.Equal(0, await anonymous.AvailableRoomsAsync(inventory.RoomTypeId, checkIn, checkOut));

        var backToAvailable = await staff.Client.PatchJsonAsync($"/api/admin/rooms/{roomId}/status",
            new UpdateRoomStatusRequest { Status = RoomStatus.Available });
        await backToAvailable.ShouldBeAsync(HttpStatusCode.OK);

        Assert.Equal(1, await anonymous.AvailableRoomsAsync(inventory.RoomTypeId, checkIn, checkOut));
    }

    [Theory]
    [InlineData(-1, 1, 1)]   // check-in kemarin
    [InlineData(5, 5, 1)]    // check-out sama dengan check-in
    [InlineData(5, 7, 0)]    // jumlah tamu 0
    public async Task Search_InvalidInput_ReturnsBadRequest(int checkInOffset, int checkOutOffset, int guests)
    {
        var today = TestClock.Today;
        var url = HttpExtensions.SearchUrl(today.AddDays(checkInOffset), today.AddDays(checkOutOffset), guests);

        var response = await api.CreateClient().GetAsync(url);

        await response.ShouldBeAsync(HttpStatusCode.BadRequest);
    }
}