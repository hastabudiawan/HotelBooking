using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using HotelBooking.Application.Auth;
using HotelBooking.Application.Bookings;
using HotelBooking.Application.Payments;
using HotelBooking.Application.RoomTypes;
using HotelBooking.Application.Rooms;
using Xunit.Sdk;

namespace HotelBooking.Tests.Integration;

public static class TestClock
{
    // "Hari ini" menurut jam hotel, sama persis dengan yang dipakai aplikasi.
    public static DateOnly Today => BookingRules.Today(TimeProvider.System);

    public static string Iso(this DateOnly date) => date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
}

public static class HttpExtensions
{
    // Sama dengan pengaturan API: camelCase dan enum sebagai teks.
    public static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    public static Task<HttpResponseMessage> PostJsonAsync(this HttpClient client, string url, object? body = null) =>
        client.PostAsJsonAsync(url, body ?? new { }, JsonOptions);

    public static Task<HttpResponseMessage> PatchJsonAsync(this HttpClient client, string url, object body)
    {
        var request = new HttpRequestMessage(HttpMethod.Patch, url)
        {
            Content = JsonContent.Create(body, options: JsonOptions)
        };

        return client.SendAsync(request);
    }

    // Gagal dengan pesan yang menyertakan isi respons, jauh lebih mudah dilacak daripada "Expected 200 but was 400".
    public static async Task ShouldBeAsync(this HttpResponseMessage response, HttpStatusCode expected)
    {
        if (response.StatusCode == expected)
            return;

        var body = await response.Content.ReadAsStringAsync();
        throw new XunitException(
            $"Diharapkan HTTP {(int)expected} tetapi menerima {(int)response.StatusCode}. Isi respons: {body}");
    }

    public static async Task<T> ReadJsonAsync<T>(this HttpResponseMessage response)
    {
        var body = await response.Content.ReadAsStringAsync();

        try
        {
            return JsonSerializer.Deserialize<T>(body, JsonOptions)
                   ?? throw new InvalidOperationException("Respons kosong.");
        }
        catch (JsonException ex)
        {
            throw new InvalidOperationException(
                $"Respons {(int)response.StatusCode} tidak bisa dibaca sebagai {typeof(T).Name}: {body}", ex);
        }
    }

    public static async Task<T> GetJsonAsync<T>(this HttpClient client, string url)
    {
        var response = await client.GetAsync(url);
        await response.ShouldBeAsync(HttpStatusCode.OK);
        return await response.ReadJsonAsync<T>();
    }

    // ----- Booking dan pembayaran -----

    public static Task<HttpResponseMessage> BookAsync(
        this HttpClient guest, int roomTypeId, DateOnly checkIn, DateOnly checkOut, int guests = 1) =>
        guest.PostJsonAsync("/api/bookings", new CreateBookingRequest
        {
            RoomTypeId = roomTypeId,
            CheckIn = checkIn,
            CheckOut = checkOut,
            GuestCount = guests
        });

    public static async Task<BookingDto> BookOkAsync(
        this HttpClient guest, int roomTypeId, DateOnly checkIn, DateOnly checkOut, int guests = 1)
    {
        var response = await guest.BookAsync(roomTypeId, checkIn, checkOut, guests);
        await response.ShouldBeAsync(HttpStatusCode.Created);
        return await response.ReadJsonAsync<BookingDto>();
    }

    public static Task<HttpResponseMessage> PayAsync(
        this HttpClient guest, int bookingId, bool simulateFailure = false) =>
        guest.PostJsonAsync($"/api/bookings/{bookingId}/pay",
            new PayBookingRequest { Method = "QRIS", SimulateFailure = simulateFailure });

    public static async Task<BookingDto> BookAndPayAsync(
        this HttpClient guest, int roomTypeId, DateOnly checkIn, DateOnly checkOut)
    {
        var booking = await guest.BookOkAsync(roomTypeId, checkIn, checkOut);

        var pay = await guest.PayAsync(booking.Id);
        await pay.ShouldBeAsync(HttpStatusCode.OK);

        return booking;
    }

    // ----- Ketersediaan -----

    public static string SearchUrl(DateOnly checkIn, DateOnly checkOut, int guests = 1) =>
        $"/api/rooms/available?checkIn={checkIn.Iso()}&checkOut={checkOut.Iso()}&guests={guests}";

    // Jumlah kamar kosong untuk satu tipe. 0 jika tipenya tidak muncul di hasil pencarian.
    public static async Task<int> AvailableRoomsAsync(
        this HttpClient client, int roomTypeId, DateOnly checkIn, DateOnly checkOut)
    {
        var list = await client.GetJsonAsync<List<AvailableRoomTypeDto>>(SearchUrl(checkIn, checkOut));
        return list.FirstOrDefault(t => t.RoomTypeId == roomTypeId)?.AvailableRooms ?? 0;
    }
}

public sealed record Inventory(int RoomTypeId, IReadOnlyList<RoomDto> Rooms, decimal Price);

public static class ApiFactoryExtensions
{
    private static int _inventorySeq;

    public static async Task<TestUser> NewGuestAsync(this ApiFactory api)
    {
        var email = $"tamu-{Guid.NewGuid():N}@test.local";
        var client = api.CreateClient();

        var response = await client.PostJsonAsync("/api/auth/register",
            new RegisterRequest { FullName = "Tamu Uji", Email = email, Password = "Tamu12345" });
        await response.ShouldBeAsync(HttpStatusCode.OK);

        var auth = await response.ReadJsonAsync<AuthResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth.Token);

        return new TestUser(client, auth.UserId, email);
    }

    public static async Task<TestUser> NewReceptionistAsync(this ApiFactory api)
    {
        var admin = await api.AdminAsync();
        var email = $"resepsionis-{Guid.NewGuid():N}@test.local";

        var response = await admin.PostJsonAsync("/api/admin/staff",
            new CreateStaffRequest { FullName = "Resepsionis Uji", Email = email, Password = "Staff12345" });
        await response.ShouldBeAsync(HttpStatusCode.OK);

        return await api.LoginAsync(email, "Staff12345");
    }

    // Membuat satu tipe kamar baru beserta kamarnya. Dengan inventaris sendiri,
    // tiap test tidak pernah berebut kamar dengan test lain.
    public static async Task<Inventory> CreateInventoryAsync(
        this ApiFactory api, int rooms, int capacity = 2, decimal price = 500_000m)
    {
        var admin = await api.AdminAsync();
        var n = Interlocked.Increment(ref _inventorySeq);

        var typeResponse = await admin.PostJsonAsync("/api/room-types", new CreateRoomTypeRequest
        {
            Name = $"Tipe Uji {n}",
            BasePrice = price,
            Capacity = capacity
        });
        await typeResponse.ShouldBeAsync(HttpStatusCode.Created);
        var type = await typeResponse.ReadJsonAsync<RoomTypeDto>();

        var created = new List<RoomDto>();
        for (var i = 0; i < rooms; i++)
        {
            var roomResponse = await admin.PostJsonAsync("/api/admin/rooms", new CreateRoomRequest
            {
                RoomNumber = $"T{n:D3}-{i}",
                RoomTypeId = type.Id
            });
            await roomResponse.ShouldBeAsync(HttpStatusCode.Created);
            created.Add(await roomResponse.ReadJsonAsync<RoomDto>());
        }

        return new Inventory(type.Id, created, price);
    }
}