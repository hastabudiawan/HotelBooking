using HotelBooking.Application.Operations;
using Xunit;

namespace HotelBooking.Tests;

public class OccupancyCalculatorTests
{
    private static readonly DateOnly D = new(2026, 11, 20);

    [Fact]
    public void Calculate_SingleStay_CountsOnlyNightsInStay()
    {
        var stays = new[] { new StayRange(D, D.AddDays(2), 1_000_000m) };

        var report = OccupancyCalculator.Calculate(stays, D, D.AddDays(2), totalRooms: 5);

        Assert.Equal(1, report.Days[0].RoomsSold);
        Assert.Equal(20.0m, report.Days[0].OccupancyRate);
        Assert.Equal(500_000m, report.Days[0].Revenue);
        Assert.Equal(1, report.Days[1].RoomsSold);
        Assert.Equal(0, report.Days[2].RoomsSold);   // hari check-out bukan malam menginap

        Assert.Equal(2, report.RoomNightsSold);
        Assert.Equal(15, report.RoomNightsAvailable);
        Assert.Equal(13.3m, report.OccupancyRate);
        Assert.Equal(1_000_000m, report.Revenue);
    }

    [Fact]
    public void Calculate_CheckOutDay_IsNotCounted()
    {
        var stays = new[] { new StayRange(D, D.AddDays(1), 750_000m) };

        var report = OccupancyCalculator.Calculate(stays, D.AddDays(1), D.AddDays(1), totalRooms: 5);

        Assert.Equal(0, report.Days[0].RoomsSold);
        Assert.Equal(0m, report.Revenue);
    }

    [Fact]
    public void Calculate_StayStartsBeforeRange_CountsOnlyNightsInRange()
    {
        // 3 malam (D-2, D-1, D) dengan total 300. Laporan hanya untuk hari D.
        var stays = new[] { new StayRange(D.AddDays(-2), D.AddDays(1), 300m) };

        var report = OccupancyCalculator.Calculate(stays, D, D, totalRooms: 5);

        Assert.Equal(1, report.Days[0].RoomsSold);
        Assert.Equal(100m, report.Days[0].Revenue);
    }

    [Fact]
    public void Calculate_OverlappingStays_AddUp()
    {
        var stays = new[]
        {
            new StayRange(D, D.AddDays(1), 450_000m),
            new StayRange(D, D.AddDays(1), 750_000m)
        };

        var report = OccupancyCalculator.Calculate(stays, D, D, totalRooms: 4);

        Assert.Equal(2, report.Days[0].RoomsSold);
        Assert.Equal(50.0m, report.Days[0].OccupancyRate);
        Assert.Equal(1_200_000m, report.Days[0].Revenue);
    }

    [Fact]
    public void Calculate_NoRooms_RateIsZeroWithoutError()
    {
        var report = OccupancyCalculator.Calculate([], D, D, totalRooms: 0);

        Assert.Single(report.Days);
        Assert.Equal(0m, report.OccupancyRate);
        Assert.Equal(0m, report.Days[0].OccupancyRate);
    }
}