using Xunit;

namespace HotelBooking.Tests.Integration;

// Semua test berlabel [Collection("Api")] memakai satu ApiFactory dan berjalan berurutan.
[CollectionDefinition("Api")]
public class ApiCollection : ICollectionFixture<ApiFactory>;