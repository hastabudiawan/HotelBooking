using System.Net;
using HotelBooking.Application.Bookings;
using HotelBooking.Application.Payments;
using HotelBooking.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Xunit;
using Xunit.Sdk;

namespace HotelBooking.Tests.Integration;

[Collection("Api")]
[Trait("Category", "Integration")]
public class ConcurrencyTests(ApiFactory api)
{
    private static readonly HttpStatusCode[] OkOrConflict = [HttpStatusCode.OK, HttpStatusCode.Conflict];

    [Theory]
    [InlineData(1)]
    [InlineData(3)]
    public async Task ParallelBookings_NeverExceedTheNumberOfRooms(int rooms)
    {
        const int contenders = 10;

        var guests = new List<TestUser>();
        for (var i = 0; i < contenders; i++)
            guests.Add(await api.NewGuestAsync());

        // Beberapa putaran dengan inventaris baru supaya peluang menangkap race condition lebih besar.
        for (var round = 0; round < 3; round++)
        {
            var inventory = await api.CreateInventoryAsync(rooms);
            var checkIn = TestClock.Today.AddDays(20 + round);
            var checkOut = checkIn.AddDays(2);

            var responses = await Task.WhenAll(
                guests.Select(g => g.Client.BookAsync(inventory.RoomTypeId, checkIn, checkOut)));

            var statuses = responses.Select(r => r.StatusCode).ToList();

            Assert.DoesNotContain(statuses, s => (int)s >= 500);
            Assert.Equal(rooms, statuses.Count(s => s == HttpStatusCode.Created));
            Assert.Equal(contenders - rooms, statuses.Count(s => s == HttpStatusCode.Conflict));

            // Pemeriksaan langsung di database: tiap kamar dipegang paling banyak satu booking.
            var roomIds = inventory.Rooms.Select(r => r.Id).ToList();

            var perRoom = await api.WithDbAsync(db => db.Bookings
                .Where(b => roomIds.Contains(b.RoomId) && b.Status == BookingStatus.Pending)
                .GroupBy(b => b.RoomId)
                .Select(g => g.Count())
                .ToListAsync());

            Assert.Equal(rooms, perRoom.Count);
            Assert.All(perRoom, count => Assert.Equal(1, count));
        }
    }

    [Fact]
    public async Task ParallelPayments_ForTheSameBooking_OnlyOneSucceeds()
    {
        var inventory = await api.CreateInventoryAsync(rooms: 1);
        var guest = await api.NewGuestAsync();
        var checkIn = TestClock.Today.AddDays(30);

        var booking = await guest.Client.BookOkAsync(inventory.RoomTypeId, checkIn, checkIn.AddDays(2));

        var responses = await Task.WhenAll(
            Enumerable.Range(0, 8).Select(_ => guest.Client.PayAsync(booking.Id)));

        var statuses = responses.Select(r => r.StatusCode).ToList();

        Assert.DoesNotContain(statuses, s => (int)s >= 500);
        Assert.Equal(1, statuses.Count(s => s == HttpStatusCode.OK));
        Assert.Equal(7, statuses.Count(s => s == HttpStatusCode.Conflict));

        // Tidak ada pembayaran ganda: pembayaran yang kalah tidak meninggalkan baris apa pun.
        var payments = await guest.Client.GetJsonAsync<List<PaymentDto>>($"/api/bookings/{booking.Id}/payments");
        Assert.Equal(PaymentStatus.Paid, Assert.Single(payments).Status);

        var final = await guest.Client.GetJsonAsync<BookingDto>($"/api/bookings/{booking.Id}");
        Assert.Equal(BookingStatus.Confirmed, final.Status);
    }

    [Fact]
    public async Task PayAndCancel_AtTheSameTime_NeverLeaveAnInconsistentState()
    {
        var inventory = await api.CreateInventoryAsync(rooms: 5);
        var guest = await api.NewGuestAsync();

        for (var i = 0; i < 5; i++)
        {
            var checkIn = TestClock.Today.AddDays(40 + i * 3);
            var booking = await guest.Client.BookOkAsync(inventory.RoomTypeId, checkIn, checkIn.AddDays(1));

            var results = await Task.WhenAll(
                guest.Client.PayAsync(booking.Id),
                guest.Client.PostJsonAsync($"/api/bookings/{booking.Id}/cancel"));

            var payResult = results[0];
            var cancelResult = results[1];

            Assert.Contains(payResult.StatusCode, OkOrConflict);
            Assert.Contains(cancelResult.StatusCode, OkOrConflict);

            var final = await guest.Client.GetJsonAsync<BookingDto>($"/api/bookings/{booking.Id}");
            var payments = await guest.Client.GetJsonAsync<List<PaymentDto>>($"/api/bookings/{booking.Id}/payments");
            var paidCount = payments.Count(p => p.Status == PaymentStatus.Paid);

            switch (final.Status)
            {
                case BookingStatus.Confirmed:
                    // Pembayaran menang. Pembatalan harus ditolak, dan uang tercatat tepat satu kali.
                    Assert.Equal(1, paidCount);
                    Assert.Equal(HttpStatusCode.Conflict, cancelResult.StatusCode);
                    break;

                case BookingStatus.Cancelled:
                    // Pembatalan menang. Tidak boleh ada uang yang "menggantung" berstatus Paid.
                    Assert.Equal(0, paidCount);
                    break;

                default:
                    throw new XunitException(
                        $"Status akhir {final.Status} tidak mungkin terjadi setelah bayar dan batal bersamaan.");
            }
        }
    }
}