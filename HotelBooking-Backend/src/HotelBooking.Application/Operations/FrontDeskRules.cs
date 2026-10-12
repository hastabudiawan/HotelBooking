using HotelBooking.Domain.Enums;

namespace HotelBooking.Application.Operations;

public static class FrontDeskRules
{
    public static string? ValidateCheckIn(
        BookingStatus status, RoomStatus roomStatus, DateOnly today, DateOnly checkIn, DateOnly checkOut)
    {
        if (status == BookingStatus.Pending)
            return "Booking belum dibayar. Check-in hanya untuk booking yang sudah dikonfirmasi.";

        if (status != BookingStatus.Confirmed)
            return $"Booking berstatus {status}, tidak bisa check-in.";

        if (today < checkIn)
            return $"Check-in baru bisa dilakukan mulai {checkIn:yyyy-MM-dd}.";

        if (today >= checkOut)
            return "Tanggal menginap booking ini sudah lewat.";

        return roomStatus switch
        {
            RoomStatus.Available => null,
            RoomStatus.Occupied => "Kamar masih ditempati. Lakukan check-out tamu sebelumnya terlebih dahulu.",
            RoomStatus.Cleaning => "Kamar masih dibersihkan. Ubah status kamar menjadi Available setelah siap.",
            RoomStatus.Maintenance => "Kamar sedang maintenance. Booking ini perlu dipindahkan ke kamar lain.",
            _ => "Status kamar tidak dikenal."
        };
    }

    public static string? ValidateCheckOut(BookingStatus status)
    {
        return status == BookingStatus.CheckedIn
            ? null
            : $"Booking berstatus {status}. Check-out hanya untuk tamu yang sedang menginap (CheckedIn).";
    }

    public static string? ValidateNoShow(BookingStatus status, DateOnly today, DateOnly checkIn)
    {
        if (status != BookingStatus.Confirmed)
            return $"Booking berstatus {status}. No-show hanya untuk booking Confirmed.";

        if (today <= checkIn)
            return "No-show baru bisa ditandai setelah tanggal check-in lewat.";

        return null;
    }
}