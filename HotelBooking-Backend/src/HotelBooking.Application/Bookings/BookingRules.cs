namespace HotelBooking.Application.Bookings;

public static class BookingRules
{
    // Lama kamar ditahan sambil menunggu pembayaran.
    public const int HoldMinutes = 15;

    public const int MaxNights = 30;

    // Hotel berada di WIB (UTC+7). Offset tetap dipakai agar tidak bergantung
    // pada database zona waktu di server atau container.
    public static readonly TimeSpan HotelUtcOffset = TimeSpan.FromHours(7);

    // "Hari ini" menurut jam hotel, bukan jam UTC.
    public static DateOnly Today(TimeProvider time) =>
        DateOnly.FromDateTime(time.GetUtcNow().ToOffset(HotelUtcOffset).DateTime);

    // Mengembalikan pesan error, atau null jika rentang tanggal valid.
    public static string? ValidateStay(DateOnly checkIn, DateOnly checkOut, DateOnly today)
    {
        if (checkIn < today)
            return "Tanggal check-in tidak boleh sebelum hari ini.";

        if (checkOut <= checkIn)
            return "Tanggal check-out harus setelah tanggal check-in.";

        if (checkOut.DayNumber - checkIn.DayNumber > MaxNights)
            return $"Maksimal menginap {MaxNights} malam.";

        return null;
    }
}