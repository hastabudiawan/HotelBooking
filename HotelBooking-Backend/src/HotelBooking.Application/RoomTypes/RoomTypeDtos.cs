using System.ComponentModel.DataAnnotations;

namespace HotelBooking.Application.RoomTypes;

public record RoomTypeDto(
    int Id,
    string Name,
    string Slug,
    string Description,
    decimal BasePrice,
    int Capacity,
    string? ImageUrl);

public class CreateRoomTypeRequest
{
    [Required, MaxLength(100)]
    public string Name { get; set; } = default!;

    [MaxLength(120)]
    [RegularExpression("^[a-z0-9]+(?:-[a-z0-9]+)*$",
        ErrorMessage = "Slug hanya boleh huruf kecil, angka, dan tanda hubung.")]
    public string? Slug { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    [Range(typeof(decimal), "1", "100000000")]
    public decimal BasePrice { get; set; }

    [Range(1, 10)]
    public int Capacity { get; set; }

    [Url, MaxLength(500)]
    public string? ImageUrl { get; set; }
}

public class UpdateRoomTypeRequest : CreateRoomTypeRequest
{
}