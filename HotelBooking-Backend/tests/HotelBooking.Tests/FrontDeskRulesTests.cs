using HotelBooking.Application.Operations;
using HotelBooking.Domain.Enums;
using Xunit;

namespace HotelBooking.Tests;

public class FrontDeskRulesTests
{
    private static readonly DateOnly Today = new(2026, 11, 20);

    [Fact]
    public void ValidateCheckIn_AllConditionsMet_ReturnsNull()
    {
        var error = FrontDeskRules.ValidateCheckIn(
            BookingStatus.Confirmed, RoomStatus.Available, Today, Today, Today.AddDays(2));

        Assert.Null(error);
    }

    [Theory]
    [InlineData(BookingStatus.Pending)]
    [InlineData(BookingStatus.Cancelled)]
    [InlineData(BookingStatus.CheckedIn)]
    [InlineData(BookingStatus.Expired)]
    public void ValidateCheckIn_BookingNotConfirmed_ReturnsError(BookingStatus status)
    {
        var error = FrontDeskRules.ValidateCheckIn(
            status, RoomStatus.Available, Today, Today, Today.AddDays(2));

        Assert.NotNull(error);
    }

    [Fact]
    public void ValidateCheckIn_BeforeCheckInDate_ReturnsError()
    {
        var error = FrontDeskRules.ValidateCheckIn(
            BookingStatus.Confirmed, RoomStatus.Available, Today, Today.AddDays(1), Today.AddDays(3));

        Assert.NotNull(error);
    }

    [Fact]
    public void ValidateCheckIn_OnOrAfterCheckOutDate_ReturnsError()
    {
        var error = FrontDeskRules.ValidateCheckIn(
            BookingStatus.Confirmed, RoomStatus.Available, Today, Today.AddDays(-2), Today);

        Assert.NotNull(error);
    }

    [Theory]
    [InlineData(RoomStatus.Occupied)]
    [InlineData(RoomStatus.Cleaning)]
    [InlineData(RoomStatus.Maintenance)]
    public void ValidateCheckIn_RoomNotReady_ReturnsError(RoomStatus roomStatus)
    {
        var error = FrontDeskRules.ValidateCheckIn(
            BookingStatus.Confirmed, roomStatus, Today, Today, Today.AddDays(2));

        Assert.NotNull(error);
    }

    [Fact]
    public void ValidateCheckOut_CheckedIn_ReturnsNull()
    {
        Assert.Null(FrontDeskRules.ValidateCheckOut(BookingStatus.CheckedIn));
    }

    [Theory]
    [InlineData(BookingStatus.Confirmed)]
    [InlineData(BookingStatus.CheckedOut)]
    public void ValidateCheckOut_NotCheckedIn_ReturnsError(BookingStatus status)
    {
        Assert.NotNull(FrontDeskRules.ValidateCheckOut(status));
    }

    [Fact]
    public void ValidateNoShow_DayAfterCheckIn_ReturnsNull()
    {
        var error = FrontDeskRules.ValidateNoShow(BookingStatus.Confirmed, Today, Today.AddDays(-1));

        Assert.Null(error);
    }

    [Fact]
    public void ValidateNoShow_OnCheckInDay_ReturnsError()
    {
        var error = FrontDeskRules.ValidateNoShow(BookingStatus.Confirmed, Today, Today);

        Assert.NotNull(error);
    }

    [Fact]
    public void ValidateNoShow_NotConfirmed_ReturnsError()
    {
        var error = FrontDeskRules.ValidateNoShow(BookingStatus.CheckedIn, Today, Today.AddDays(-1));

        Assert.NotNull(error);
    }
}