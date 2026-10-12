using HotelBooking.Application.Common;
using Xunit;

namespace HotelBooking.Tests;

public class SlugHelperTests
{
    [Theory]
    [InlineData("Family Room", "family-room")]
    [InlineData("  Deluxe   Ocean View ", "deluxe-ocean-view")]
    [InlineData("Suite & Spa!", "suite-spa")]
    [InlineData("Kamar Ekonomi Café", "kamar-ekonomi-cafe")]
    [InlineData("!!!", "")]
    public void Generate_ReturnsExpectedSlug(string input, string expected)
    {
        Assert.Equal(expected, SlugHelper.Generate(input));
    }
}