using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace HotelBooking.Application.Common;

public static class SlugHelper
{
    // "Deluxe Ocean View" -> "deluxe-ocean-view"
    public static string Generate(string text)
    {
        var normalized = text.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);

        var builder = new StringBuilder();
        foreach (var c in normalized)
        {
            // buang tanda aksen, misalnya é menjadi e
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                builder.Append(c);
        }

        return Regex.Replace(builder.ToString(), "[^a-z0-9]+", "-").Trim('-');
    }
}