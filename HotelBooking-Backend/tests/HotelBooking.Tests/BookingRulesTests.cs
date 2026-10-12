using HotelBooking.Application.Bookings;
using Xunit;

namespace HotelBooking.Tests;

public class BookingRulesTests
{
    private static readonly DateOnly Today = new(2026, 11, 10);

    [Fact]
    public void ValidateStay_ValidRange_ReturnsNull()
    {
        var error = BookingRules.ValidateStay(Today, Today.AddDays(2), Today);
        Assert.Null(error);
    }

    [Fact]
    public void ValidateStay_CheckInToday_IsAllowed()
    {
        var error = BookingRules.ValidateStay(Today, Today.AddDays(1), Today);
        Assert.Null(error);
    }

    [Fact]
    public void ValidateStay_CheckInInThePast_ReturnsError()
    {
        var error = BookingRules.ValidateStay(Today.AddDays(-1), Today.AddDays(1), Today);
        Assert.NotNull(error);
    }

    [Theory]
    [InlineData(0)]   // check-out sama dengan check-in
    [InlineData(-1)]  // check-out sebelum check-in
    public void ValidateStay_CheckOutNotAfterCheckIn_ReturnsError(int offsetDays)
    {
        var checkIn = Today.AddDays(5);
        var error = BookingRules.ValidateStay(checkIn, checkIn.AddDays(offsetDays), Today);
        Assert.NotNull(error);
    }

    [Fact]
    public void ValidateStay_ExactlyMaxNights_IsAllowed()
    {
        var error = BookingRules.ValidateStay(Today, Today.AddDays(BookingRules.MaxNights), Today);
        Assert.Null(error);
    }

    [Fact]
    public void ValidateStay_MoreThanMaxNights_ReturnsError()
    {
        var error = BookingRules.ValidateStay(Today, Today.AddDays(BookingRules.MaxNights + 1), Today);
        Assert.NotNull(error);
    }

    [Fact]
    public void Today_UsesHotelTimeZone_NotUtc()
    {
        // 18:00 UTC tanggal 12 = 01:00 WIB tanggal 13.
        var time = new FixedTimeProvider(new DateTimeOffset(2026, 10, 12, 18, 0, 0, TimeSpan.Zero));

        Assert.Equal(new DateOnly(2026, 10, 13), BookingRules.Today(time));
    }

    private sealed class FixedTimeProvider(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }
}