using System.Net;
using HotelBooking.Application.Bookings;
using HotelBooking.Application.Operations;
using HotelBooking.Application.Rooms;
using HotelBooking.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace HotelBooking.Tests.Integration;

[Collection("Api")]
[Trait("Category", "Integration")]
public class ExpiryAndReportTests(ApiFactory api)
{
    [Fact]
    public async Task LapsedPendingBooking_IsExpiredByBackgroundJob_AndReleasesTheRoom()
    {
        var inventory = await api.CreateInventoryAsync(rooms: 1);
        var guest = await api.NewGuestAsync();
        var checkIn = TestClock.Today.AddDays(50);
        var checkOut = checkIn.AddDays(2);

        var booking = await guest.Client.BookOkAsync(inventory.RoomTypeId, checkIn, checkOut);
        Assert.Equal(0, await guest.Client.AvailableRoomsAsync(inventory.RoomTypeId, checkIn, checkOut));

        // Majukan waktu: batas bayar dibuat sudah lewat satu menit yang lalu.
        await api.WithDbAsync(db => db.Bookings
            .Where(b => b.Id == booking.Id)
            .ExecuteUpdateAsync(s => s.SetProperty(b => b.ExpiresAt, (DateTime?)DateTime.UtcNow.AddMinutes(-1))));

        // Job berjalan tiap 1 detik di test. Tunggu paling lama 20 detik.
        BookingStatus? status = null;
        var deadline = DateTime.UtcNow.AddSeconds(20);

        while (DateTime.UtcNow < deadline)
        {
            status = (await guest.Client.GetJsonAsync<BookingDto>($"/api/bookings/{booking.Id}")).Status;
            if (status == BookingStatus.Expired)
                break;

            await Task.Delay(500);
        }

        Assert.Equal(BookingStatus.Expired, status);

        // Booking yang sudah Expired tidak bisa dibayar atau dibatalkan, dan kamarnya kembali tersedia.
        await (await guest.Client.PayAsync(booking.Id)).ShouldBeAsync(HttpStatusCode.Conflict);
        await (await guest.Client.PostJsonAsync($"/api/bookings/{booking.Id}/cancel"))
            .ShouldBeAsync(HttpStatusCode.Conflict);

        Assert.Equal(1, await guest.Client.AvailableRoomsAsync(inventory.RoomTypeId, checkIn, checkOut));
    }

    [Fact]
    public async Task OccupancyReport_CountsOnlyPaidStays_AndMatchesHandCalculation()
    {
        var admin = await api.AdminAsync();
        var guest = await api.NewGuestAsync();
        var inventory = await api.CreateInventoryAsync(rooms: 3, price: 500_000m);

        // Jendela tahun depan: tidak bersinggungan dengan test lain.
        var start = TestClock.Today.AddDays(365);

        await guest.Client.BookAndPayAsync(inventory.RoomTypeId, start, start.AddDays(2));                  // malam +0, +1
        await guest.Client.BookAndPayAsync(inventory.RoomTypeId, start.AddDays(1), start.AddDays(4));       // malam +1, +2, +3
        await guest.Client.BookOkAsync(inventory.RoomTypeId, start, start.AddDays(4));                      // Pending: tidak dihitung

        var to = start.AddDays(3);   // batas akhir laporan bersifat inklusif
        var report = await admin.GetJsonAsync<OccupancyReportDto>(
            $"/api/admin/reports/occupancy?from={start.Iso()}&to={to.Iso()}");

        Assert.Equal(4, report.Days.Count);
        Assert.Equal(new[] { 1, 2, 1, 1 }, report.Days.Select(d => d.RoomsSold));
        Assert.Equal(5, report.RoomNightsSold);
        Assert.Equal(2_500_000m, report.Revenue);

        // Total kamar di laporan sama dengan jumlah kamar di database test.
        var allRooms = await admin.GetJsonAsync<List<RoomDto>>("/api/admin/rooms");
        Assert.Equal(allRooms.Count, report.TotalRooms);
        Assert.Equal(report.TotalRooms * 4, report.RoomNightsAvailable);
    }
}