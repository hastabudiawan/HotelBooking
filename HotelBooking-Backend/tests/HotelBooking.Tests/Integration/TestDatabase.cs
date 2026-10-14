using HotelBooking.Infrastructure.Persistence;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Testcontainers.MsSql;

namespace HotelBooking.Tests.Integration;

internal static class TestDatabase
{
    private const string DatabaseName = "HotelBookingTests";

    private static readonly Lazy<Task<string>> Connection = new(StartAsync);

    // Dipanggil dari banyak tempat, tetapi inisialisasinya hanya berjalan sekali.
    public static string GetConnectionString() => Connection.Value.GetAwaiter().GetResult();

    private static async Task<string> StartAsync()
    {
        var external = Environment.GetEnvironmentVariable("TEST_DB_CONNECTION");
        var usesExternalServer = !string.IsNullOrWhiteSpace(external);

        string connectionString;

        if (usesExternalServer)
        {
            var builder = new SqlConnectionStringBuilder(external);

            // Penjaga keamanan: database ini akan dihapus dan dibuat ulang di setiap run.
            if (!builder.InitialCatalog.Contains("test", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException(
                    $"TEST_DB_CONNECTION menunjuk database '{builder.InitialCatalog}'. " +
                    "Nama database test harus mengandung kata 'test' (misalnya HotelBookingTests) " +
                    "supaya database pengembangan tidak ikut terhapus.");

            connectionString = builder.ConnectionString;
        }
        else
        {
            var container = new MsSqlBuilder("mcr.microsoft.com/mssql/server:2022-latest")
                .Build();

            await container.StartAsync();

            // Cadangan: Ryuk (bawaan Testcontainers) juga menghapus container kalau proses mati mendadak.
            AppDomain.CurrentDomain.ProcessExit += (_, _) =>
                container.DisposeAsync().AsTask().GetAwaiter().GetResult();

            var builder = new SqlConnectionStringBuilder(container.GetConnectionString())
            {
                InitialCatalog = DatabaseName,
                TrustServerCertificate = true
            };

            connectionString = builder.ConnectionString;
        }

        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlServer(connectionString).Options;

        await using var db = new AppDbContext(options);

        if (usesExternalServer)
            await db.Database.EnsureDeletedAsync();   // mulai dari kosong di setiap run

        // Skema dibuat dari migration yang sama dengan produksi.
        // Harus selesai SEBELUM API start, karena API langsung membuat role dan akun admin.
        await db.Database.MigrateAsync();

        return connectionString;
    }
}