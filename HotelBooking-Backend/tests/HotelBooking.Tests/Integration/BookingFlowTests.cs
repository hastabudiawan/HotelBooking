using System.Net;
using HotelBooking.Application.Bookings;
using HotelBooking.Application.Operations;
using HotelBooking.Application.Payments;
using HotelBooking.Application.Rooms;
using HotelBooking.Domain.Enums;
using Xunit;

namespace HotelBooking.Tests.Integration;

[Collection("Api")]
[Trait("Category", "Integration")]
public class BookingFlowTests(ApiFactory api)
{
    [Fact]
    public async Task FullStay_PendingToConfirmedToCheckedOut_UpdatesRoomStatus()
    {
        var inventory = await api.CreateInventoryAsync(rooms: 1);
        var guest = await api.NewGuestAsync();
        var staff = await api.NewReceptionistAsync();
        var today = TestClock.Today;

        // 1. Tamu memesan
        var booking = await guest.Client.BookOkAsync(inventory.RoomTypeId, today, today.AddDays(1));
        Assert.Equal(BookingStatus.Pending, booking.Status);
        Assert.Equal(inventory.Price, booking.TotalPrice);
        Assert.NotNull(booking.ExpiresAt);
        Assert.Equal(inventory.Rooms[0].RoomNumber, booking.RoomNumber);

        // 2. Belum dibayar: check-in ditolak
        var tooEarly = await staff.Client.PostJsonAsync($"/api/admin/bookings/{booking.Id}/check-in");
        await tooEarly.ShouldBeAsync(HttpStatusCode.Conflict);

        // 3. Tamu membayar
        var payResponse = await guest.Client.PayAsync(booking.Id);
        await payResponse.ShouldBeAsync(HttpStatusCode.OK);
        var paid = await payResponse.ReadJsonAsync<PaymentResultDto>();
        Assert.Equal(PaymentStatus.Paid, paid.Payment.Status);
        Assert.Equal(booking.TotalPrice, paid.Payment.Amount);
        Assert.Equal(BookingStatus.Confirmed, paid.Booking.Status);
        Assert.Null(paid.Booking.ExpiresAt);

        // 4. Check-in oleh resepsionis
        var checkIn = await staff.Client.PostJsonAsync($"/api/admin/bookings/{booking.Id}/check-in");
        await checkIn.ShouldBeAsync(HttpStatusCode.OK);
        Assert.Equal(BookingStatus.CheckedIn, (await checkIn.ReadJsonAsync<StaffBookingDto>()).Status);

        var occupied = await staff.Client.GetJsonAsync<RoomDto>($"/api/admin/rooms/{booking.RoomId}");
        Assert.Equal(RoomStatus.Occupied, occupied.Status);

        // 5. Check-out membuat kamar Cleaning
        var checkOut = await staff.Client.PostJsonAsync($"/api/admin/bookings/{booking.Id}/check-out");
        await checkOut.ShouldBeAsync(HttpStatusCode.OK);
        Assert.Equal(BookingStatus.CheckedOut, (await checkOut.ReadJsonAsync<StaffBookingDto>()).Status);

        var cleaning = await staff.Client.GetJsonAsync<RoomDto>($"/api/admin/rooms/{booking.RoomId}");
        Assert.Equal(RoomStatus.Cleaning, cleaning.Status);

        // 6. Housekeeping selesai
        var ready = await staff.Client.PatchJsonAsync($"/api/admin/rooms/{booking.RoomId}/status",
            new UpdateRoomStatusRequest { Status = RoomStatus.Available });
        await ready.ShouldBeAsync(HttpStatusCode.OK);

        // 7. Riwayat tamu mencatat booking yang sudah selesai
        var mine = await guest.Client.GetJsonAsync<List<BookingDto>>("/api/bookings/my");
        Assert.Equal(BookingStatus.CheckedOut, Assert.Single(mine).Status);
    }

    [Fact]
    public async Task Stays_AreHalfOpen_BackToBackBookingsAreAllowedButOverlapsAreNot()
    {
        var inventory = await api.CreateInventoryAsync(rooms: 1);
        var guest = await api.NewGuestAsync();
        var d = TestClock.Today.AddDays(10);

        await guest.Client.BookOkAsync(inventory.RoomTypeId, d, d.AddDays(2));                 // malam d dan d+1
        await guest.Client.BookOkAsync(inventory.RoomTypeId, d.AddDays(2), d.AddDays(4));      // check-in tepat di hari check-out
        await guest.Client.BookOkAsync(inventory.RoomTypeId, d.AddDays(-1), d);                // check-out tepat di hari check-in

        var overlap = await guest.Client.BookAsync(inventory.RoomTypeId, d.AddDays(1), d.AddDays(3));
        await overlap.ShouldBeAsync(HttpStatusCode.Conflict);

        var contained = await guest.Client.BookAsync(inventory.RoomTypeId, d, d.AddDays(1));
        await contained.ShouldBeAsync(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Booking_WithInvalidInput_IsRejected()
    {
        var inventory = await api.CreateInventoryAsync(rooms: 1, capacity: 2);
        var guest = await api.NewGuestAsync();
        var today = TestClock.Today;
        var d = today.AddDays(8);

        // Check-in di masa lalu
        await (await guest.Client.BookAsync(inventory.RoomTypeId, today.AddDays(-1), today.AddDays(1)))
            .ShouldBeAsync(HttpStatusCode.BadRequest);

        // Check-out sama dengan check-in
        await (await guest.Client.BookAsync(inventory.RoomTypeId, d, d))
            .ShouldBeAsync(HttpStatusCode.BadRequest);

        // Lebih dari 30 malam
        await (await guest.Client.BookAsync(inventory.RoomTypeId, d, d.AddDays(31)))
            .ShouldBeAsync(HttpStatusCode.BadRequest);

        // Melebihi kapasitas
        await (await guest.Client.BookAsync(inventory.RoomTypeId, d, d.AddDays(1), guests: 3))
            .ShouldBeAsync(HttpStatusCode.BadRequest);

        // Tipe kamar tidak ada
        await (await guest.Client.BookAsync(999_999, d, d.AddDays(1)))
            .ShouldBeAsync(HttpStatusCode.BadRequest);

        // Tanpa login
        await (await api.CreateClient().BookAsync(inventory.RoomTypeId, d, d.AddDays(1)))
            .ShouldBeAsync(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Guest_CannotSeePayOrCancelSomeoneElsesBooking()
    {
        var inventory = await api.CreateInventoryAsync(rooms: 1);
        var owner = await api.NewGuestAsync();
        var stranger = await api.NewGuestAsync();
        var d = TestClock.Today.AddDays(9);

        var booking = await owner.Client.BookOkAsync(inventory.RoomTypeId, d, d.AddDays(1));

        var get = await stranger.Client.GetAsync($"/api/bookings/{booking.Id}");
        await get.ShouldBeAsync(HttpStatusCode.NotFound);

        var pay = await stranger.Client.PayAsync(booking.Id);
        await pay.ShouldBeAsync(HttpStatusCode.NotFound);

        var cancel = await stranger.Client.PostJsonAsync($"/api/bookings/{booking.Id}/cancel");
        await cancel.ShouldBeAsync(HttpStatusCode.NotFound);

        var payments = await stranger.Client.GetAsync($"/api/bookings/{booking.Id}/payments");
        await payments.ShouldBeAsync(HttpStatusCode.NotFound);

        // Booking pemilik tidak terpengaruh.
        var still = await owner.Client.GetJsonAsync<BookingDto>($"/api/bookings/{booking.Id}");
        Assert.Equal(BookingStatus.Pending, still.Status);
    }

    [Fact]
    public async Task CancellingPaidBooking_RefundsPaymentAndReleasesRoom()
    {
        var inventory = await api.CreateInventoryAsync(rooms: 1);
        var guest = await api.NewGuestAsync();
        var checkIn = TestClock.Today.AddDays(5);
        var checkOut = checkIn.AddDays(2);

        var booking = await guest.Client.BookAndPayAsync(inventory.RoomTypeId, checkIn, checkOut);
        Assert.Equal(0, await guest.Client.AvailableRoomsAsync(inventory.RoomTypeId, checkIn, checkOut));

        var cancel = await guest.Client.PostJsonAsync($"/api/bookings/{booking.Id}/cancel");
        await cancel.ShouldBeAsync(HttpStatusCode.OK);
        Assert.Equal(BookingStatus.Cancelled, (await cancel.ReadJsonAsync<BookingDto>()).Status);

        var payments = await guest.Client.GetJsonAsync<List<PaymentDto>>($"/api/bookings/{booking.Id}/payments");
        Assert.Equal(PaymentStatus.Refunded, Assert.Single(payments).Status);

        Assert.Equal(1, await guest.Client.AvailableRoomsAsync(inventory.RoomTypeId, checkIn, checkOut));

        var again = await guest.Client.PostJsonAsync($"/api/bookings/{booking.Id}/cancel");
        await again.ShouldBeAsync(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task FailedPayment_KeepsBookingPending_AndRetryCanSucceed()
    {
        var inventory = await api.CreateInventoryAsync(rooms: 1);
        var guest = await api.NewGuestAsync();
        var d = TestClock.Today.AddDays(6);

        var booking = await guest.Client.BookOkAsync(inventory.RoomTypeId, d, d.AddDays(1));

        var failed = await guest.Client.PayAsync(booking.Id, simulateFailure: true);
        await failed.ShouldBeAsync(HttpStatusCode.OK);
        var failedResult = await failed.ReadJsonAsync<PaymentResultDto>();
        Assert.Equal(PaymentStatus.Failed, failedResult.Payment.Status);
        Assert.Equal(BookingStatus.Pending, failedResult.Booking.Status);

        var retry = await guest.Client.PayAsync(booking.Id);
        await retry.ShouldBeAsync(HttpStatusCode.OK);
        var retryResult = await retry.ReadJsonAsync<PaymentResultDto>();
        Assert.Equal(PaymentStatus.Paid, retryResult.Payment.Status);
        Assert.Equal(BookingStatus.Confirmed, retryResult.Booking.Status);

        var payments = await guest.Client.GetJsonAsync<List<PaymentDto>>($"/api/bookings/{booking.Id}/payments");
        Assert.Equal(new[] { PaymentStatus.Failed, PaymentStatus.Paid }, payments.Select(p => p.Status));
    }
}