using HotelBooking.Domain.Enums;
using HotelBooking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace HotelBooking.Infrastructure.BackgroundJobs;

// Mengubah booking Pending yang lewat batas bayar menjadi Expired.
// Pencarian ketersediaan sudah mengabaikan booking seperti itu, jadi job ini merapikan status
// supaya riwayat tamu dan laporan akurat.
public class BookingExpiryService : BackgroundService
{
    private readonly IServiceScopeFactory _scopes;
    private readonly TimeProvider _time;
    private readonly ILogger<BookingExpiryService> _logger;
    private readonly TimeSpan _interval;

    public BookingExpiryService(
        IServiceScopeFactory scopes,
        TimeProvider time,
        IConfiguration config,
        ILogger<BookingExpiryService> logger)
    {
        _scopes = scopes;
        _time = time;
        _logger = logger;

        var seconds = int.TryParse(config["Booking:ExpiryCheckSeconds"], out var s) && s > 0 ? s : 60;
        _interval = TimeSpan.FromSeconds(seconds);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("BookingExpiryService berjalan, interval {Seconds} detik.", _interval.TotalSeconds);

        using var timer = new PeriodicTimer(_interval);

        try
        {
            // Jalan sekali saat start (menangkap booking yang kedaluwarsa selagi aplikasi mati),
            // lalu setiap interval.
            do
            {
                await ExpireOnceAsync(stoppingToken);
            }
            while (await timer.WaitForNextTickAsync(stoppingToken));
        }
        catch (OperationCanceledException)
        {
            // Aplikasi sedang berhenti. Bukan error.
        }
    }

    private async Task ExpireOnceAsync(CancellationToken ct)
    {
        try
        {
            // DbContext bersifat scoped, sedangkan job ini singleton. Setiap putaran membuat scope sendiri.
            using var scope = _scopes.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var now = _time.GetUtcNow().UtcDateTime;

            // Satu perintah UPDATE dengan kondisi di WHERE. Atomik di database: booking yang baru saja
            // dibayar sudah berstatus Confirmed sehingga tidak ikut terpilih.
            var count = await db.Bookings
                .Where(b => b.Status == BookingStatus.Pending && b.ExpiresAt != null && b.ExpiresAt <= now)
                .ExecuteUpdateAsync(s => s.SetProperty(b => b.Status, BookingStatus.Expired), ct);

            if (count > 0)
                _logger.LogInformation("{Count} booking Pending kedaluwarsa dan diubah menjadi Expired.", count);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            // Error sementara (misalnya database belum siap) tidak boleh mematikan aplikasi.
            // Putaran berikutnya mencoba lagi.
            _logger.LogError(ex, "Gagal memproses booking kedaluwarsa.");
        }
    }
}