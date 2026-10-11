namespace HotelBooking.Domain.Constants;

public static class AppRoles
{
    public const string Guest = "Guest";
    public const string Receptionist = "Receptionist";
    public const string Admin = "Admin";

    public static readonly string[] All = [Guest, Receptionist, Admin];
}