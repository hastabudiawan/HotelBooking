namespace HotelBooking.Domain.Enums;

public enum BookingStatus
{
    Pending,
    Confirmed,
    CheckedIn,
    CheckedOut,
    Expired,
    Cancelled,
    NoShow
}

public enum RoomStatus
{
    Available,
    Occupied,
    Cleaning,
    Maintenance
}

public enum PaymentStatus
{
    Pending,
    Paid,
    Failed,
    Refunded
}