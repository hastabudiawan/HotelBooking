namespace HotelBooking.Domain.Entities;

public class RoomType
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string Slug { get; set; } = default!;          // untuk URL ramah SEO
    public string Description { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }                // harga per malam
    public int Capacity { get; set; }
    public string? ImageUrl { get; set; }

    public ICollection<Room> Rooms { get; set; } = new List<Room>();
}