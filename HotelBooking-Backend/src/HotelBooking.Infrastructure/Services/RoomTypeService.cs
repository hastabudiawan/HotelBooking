using System.Linq.Expressions;
using HotelBooking.Application.Common;
using HotelBooking.Application.RoomTypes;
using HotelBooking.Domain.Entities;
using HotelBooking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Services;

public class RoomTypeService : IRoomTypeService
{
    // Dipakai di query agar EF hanya mengambil kolom yang dibutuhkan.
    private static readonly Expression<Func<RoomType, RoomTypeDto>> Projection =
        x => new RoomTypeDto(x.Id, x.Name, x.Slug, x.Description, x.BasePrice, x.Capacity, x.ImageUrl);

    // Versi biasa dari proyeksi yang sama, untuk entity yang sudah ada di memori.
    private static readonly Func<RoomType, RoomTypeDto> ToDto = Projection.Compile();

    private readonly AppDbContext _db;

    public RoomTypeService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<RoomTypeDto>> GetAllAsync(CancellationToken ct = default)
    {
        return await _db.RoomTypes
            .AsNoTracking()
            .OrderBy(x => x.BasePrice)
            .Select(Projection)
            .ToListAsync(ct);
    }

    public async Task<ServiceResult<RoomTypeDto>> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        var dto = await _db.RoomTypes
            .AsNoTracking()
            .Where(x => x.Slug == slug)
            .Select(Projection)
            .FirstOrDefaultAsync(ct);

        return dto is null
            ? ServiceResult<RoomTypeDto>.NotFound("Tipe kamar tidak ditemukan.")
            : ServiceResult<RoomTypeDto>.Ok(dto);
    }

    public async Task<ServiceResult<RoomTypeDto>> CreateAsync(CreateRoomTypeRequest request, CancellationToken ct = default)
    {
        var name = request.Name.Trim();
        var slug = string.IsNullOrWhiteSpace(request.Slug)
            ? SlugHelper.Generate(name)
            : request.Slug.Trim();

        if (slug.Length == 0)
            return ServiceResult<RoomTypeDto>.Fail("Nama tidak dapat dijadikan slug. Isi slug secara manual.");

        if (await _db.RoomTypes.AnyAsync(x => x.Slug == slug, ct))
            return ServiceResult<RoomTypeDto>.Conflict($"Slug '{slug}' sudah dipakai.");

        if (await _db.RoomTypes.AnyAsync(x => x.Name == name, ct))
            return ServiceResult<RoomTypeDto>.Conflict($"Tipe kamar '{name}' sudah ada.");

        var entity = new RoomType
        {
            Name = name,
            Slug = slug,
            Description = request.Description?.Trim() ?? string.Empty,
            BasePrice = request.BasePrice,
            Capacity = request.Capacity,
            ImageUrl = request.ImageUrl?.Trim()
        };

        _db.RoomTypes.Add(entity);
        await _db.SaveChangesAsync(ct);

        return ServiceResult<RoomTypeDto>.Ok(ToDto(entity));
    }

    public async Task<ServiceResult<RoomTypeDto>> UpdateAsync(int id, UpdateRoomTypeRequest request, CancellationToken ct = default)
    {
        var entity = await _db.RoomTypes.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
            return ServiceResult<RoomTypeDto>.NotFound("Tipe kamar tidak ditemukan.");

        var name = request.Name.Trim();
        // Slug yang kosong berarti: pertahankan slug lama (URL tidak berubah).
        var slug = string.IsNullOrWhiteSpace(request.Slug) ? entity.Slug : request.Slug.Trim();

        if (slug != entity.Slug && await _db.RoomTypes.AnyAsync(x => x.Slug == slug && x.Id != id, ct))
            return ServiceResult<RoomTypeDto>.Conflict($"Slug '{slug}' sudah dipakai.");

        if (await _db.RoomTypes.AnyAsync(x => x.Name == name && x.Id != id, ct))
            return ServiceResult<RoomTypeDto>.Conflict($"Tipe kamar '{name}' sudah ada.");

        entity.Name = name;
        entity.Slug = slug;
        entity.Description = request.Description?.Trim() ?? string.Empty;
        entity.BasePrice = request.BasePrice;
        entity.Capacity = request.Capacity;
        entity.ImageUrl = request.ImageUrl?.Trim();

        await _db.SaveChangesAsync(ct);

        return ServiceResult<RoomTypeDto>.Ok(ToDto(entity));
    }

    public async Task<ServiceResult> DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _db.RoomTypes.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (entity is null)
            return ServiceResult.NotFound("Tipe kamar tidak ditemukan.");

        if (await _db.Rooms.AnyAsync(r => r.RoomTypeId == id, ct))
            return ServiceResult.Conflict("Tipe kamar masih memiliki kamar. Hapus atau pindahkan kamarnya terlebih dahulu.");

        _db.RoomTypes.Remove(entity);
        await _db.SaveChangesAsync(ct);

        return ServiceResult.Ok();
    }
}