using HotelBooking.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HotelBooking.Infrastructure.Services;

internal static class RoomLockExtensions
{
    // Mengunci baris kamar sampai transaksi yang sedang berjalan selesai (commit atau rollback).
    // Harus dipanggil di dalam transaksi. Semua operasi yang menentukan siapa pemilik kamar
    // pada suatu tanggal memakai kunci yang sama sehingga berjalan satu per satu.
    public static Task<int> LockRoomAsync(this AppDbContext db, int roomId, CancellationToken ct) =>
        db.Database.ExecuteSqlInterpolatedAsync(
            $"SELECT 1 FROM Rooms WITH (UPDLOCK, ROWLOCK) WHERE Id = {roomId}", ct);
}