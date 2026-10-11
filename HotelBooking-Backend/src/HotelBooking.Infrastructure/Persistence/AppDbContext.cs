using HotelBooking.Domain.Entities;
using HotelBooking.Domain.Enums;
using HotelBooking.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole<int>, int>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<RoomType> RoomTypes => Set<RoomType>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Payment> Payments => Set<Payment>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<RoomType>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(100).IsRequired();
            e.Property(x => x.Slug).HasMaxLength(120).IsRequired();
            e.HasIndex(x => x.Slug).IsUnique();
            e.Property(x => x.Description).HasMaxLength(2000);
            e.Property(x => x.ImageUrl).HasMaxLength(500);
            e.Property(x => x.BasePrice).HasPrecision(18, 2);
        });

        builder.Entity<Room>(e =>
        {
            e.Property(x => x.RoomNumber).HasMaxLength(10).IsRequired();
            e.HasIndex(x => x.RoomNumber).IsUnique();
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            e.HasOne(x => x.RoomType).WithMany(t => t.Rooms)
                .HasForeignKey(x => x.RoomTypeId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Booking>(e =>
        {
            e.Property(x => x.BookingCode).HasMaxLength(20).IsRequired();
            e.HasIndex(x => x.BookingCode).IsUnique();
            e.Property(x => x.TotalPrice).HasPrecision(18, 2);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.HasIndex(x => new { x.RoomId, x.CheckIn, x.CheckOut });  // mempercepat cek ketersediaan
            e.HasOne(x => x.Room).WithMany()
                .HasForeignKey(x => x.RoomId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne<ApplicationUser>().WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Payment>(e =>
        {
            e.Property(x => x.Amount).HasPrecision(18, 2);
            e.Property(x => x.Method).HasMaxLength(30);
            e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            e.HasOne(x => x.Booking).WithMany(b => b.Payments)
                .HasForeignKey(x => x.BookingId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Data awal
        builder.Entity<RoomType>().HasData(
            new RoomType { Id = 1, Name = "Standard", Slug = "standard", BasePrice = 450000m, Capacity = 2,
                Description = "Kamar nyaman untuk satu atau dua tamu." },
            new RoomType { Id = 2, Name = "Deluxe", Slug = "deluxe", BasePrice = 750000m, Capacity = 3,
                Description = "Kamar lebih luas dengan fasilitas tambahan." },
            new RoomType { Id = 3, Name = "Suite", Slug = "suite", BasePrice = 1500000m, Capacity = 4,
                Description = "Suite dengan ruang tamu terpisah." }
        );

        builder.Entity<Room>().HasData(
            new Room { Id = 1, RoomTypeId = 1, RoomNumber = "101", Status = RoomStatus.Available },
            new Room { Id = 2, RoomTypeId = 1, RoomNumber = "102", Status = RoomStatus.Available },
            new Room { Id = 3, RoomTypeId = 2, RoomNumber = "201", Status = RoomStatus.Available },
            new Room { Id = 4, RoomTypeId = 2, RoomNumber = "202", Status = RoomStatus.Available },
            new Room { Id = 5, RoomTypeId = 3, RoomNumber = "301", Status = RoomStatus.Available }
        );
    }
}