namespace HotelBooking.Application.Payments;

public static class PaymentRules
{
    public static readonly string[] Methods = ["Transfer", "QRIS", "Kartu"];

    // Mengembalikan nama metode baku (huruf besar kecil dirapikan), atau null jika tidak dikenal.
    public static string? Normalize(string? method) =>
        Methods.FirstOrDefault(m => string.Equals(m, method?.Trim(), StringComparison.OrdinalIgnoreCase));
}