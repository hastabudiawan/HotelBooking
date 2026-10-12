namespace HotelBooking.Application.Operations;

public static class OccupancyCalculator
{
    public static OccupancyReportDto Calculate(
        IReadOnlyCollection<StayRange> stays, DateOnly fromDate, DateOnly toDate, int totalRooms)
    {
        var days = new List<OccupancyDayDto>();

        for (var date = fromDate; date <= toDate; date = date.AddDays(1))
        {
            var sold = 0;
            var revenue = 0m;

            foreach (var stay in stays)
            {
                // Rentang setengah terbuka: tanggal check-out bukan malam menginap.
                if (stay.CheckIn <= date && date < stay.CheckOut)
                {
                    sold++;
                    var nights = Math.Max(1, stay.CheckOut.DayNumber - stay.CheckIn.DayNumber);
                    revenue += stay.TotalPrice / nights;
                }
            }

            days.Add(new OccupancyDayDto(date, sold, totalRooms, Rate(sold, totalRooms), Math.Round(revenue, 2)));
        }

        var totalSold = days.Sum(d => d.RoomsSold);
        var available = totalRooms * days.Count;

        return new OccupancyReportDto(
            fromDate,
            toDate,
            totalRooms,
            totalSold,
            available,
            Rate(totalSold, available),
            Math.Round(days.Sum(d => d.Revenue), 2),
            days);
    }

    private static decimal Rate(int sold, int available) =>
        available <= 0 ? 0m : Math.Round((decimal)sold / available * 100m, 1);
}