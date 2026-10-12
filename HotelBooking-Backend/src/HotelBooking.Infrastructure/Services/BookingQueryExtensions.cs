using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;

namespace HotelBooking.Infrastructure.Services;

internal static class BookingQueryExtensions
{
    // Booking yang menahan kamar pada rentang [checkIn, checkOut):
    // Confirmed, CheckedIn, dan Pending yang belum melewati batas bayar.
    public static IQueryable<Booking> Overlapping(
        this IQueryable<Booking> query, DateOnly checkIn, DateOnly checkOut, DateTime nowUtc)
    {
        return query.Where(b =>
            b.CheckIn < checkOut &&
            b.CheckOut > checkIn &&
            (b.Status == BookingStatus.Confirmed ||
             b.Status == BookingStatus.CheckedIn ||
             (b.Status == BookingStatus.Pending && b.ExpiresAt > nowUtc)));
    }
}