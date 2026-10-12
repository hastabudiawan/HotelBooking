using HotelBooking.Application.Payments;
using Xunit;

namespace HotelBooking.Tests;

public class PaymentRulesTests
{
    [Theory]
    [InlineData("qris", "QRIS")]
    [InlineData("Transfer", "Transfer")]
    [InlineData("  kartu ", "Kartu")]
    public void Normalize_KnownMethod_ReturnsCanonicalName(string input, string expected)
    {
        Assert.Equal(expected, PaymentRules.Normalize(input));
    }

    [Theory]
    [InlineData("bitcoin")]
    [InlineData("")]
    [InlineData(null)]
    public void Normalize_UnknownOrEmpty_ReturnsNull(string? input)
    {
        Assert.Null(PaymentRules.Normalize(input));
    }
}