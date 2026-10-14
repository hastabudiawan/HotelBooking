# ---------- Tahap 1: build ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source

# Salin file project dulu supaya lapisan restore bisa di-cache
COPY src/HotelBooking.Domain/HotelBooking.Domain.csproj               src/HotelBooking.Domain/
COPY src/HotelBooking.Application/HotelBooking.Application.csproj     src/HotelBooking.Application/
COPY src/HotelBooking.Infrastructure/HotelBooking.Infrastructure.csproj src/HotelBooking.Infrastructure/
COPY src/HotelBooking.Api/HotelBooking.Api.csproj                     src/HotelBooking.Api/
RUN dotnet restore src/HotelBooking.Api/HotelBooking.Api.csproj

COPY src/ src/
RUN dotnet publish src/HotelBooking.Api/HotelBooking.Api.csproj \
    -c Release -o /app/publish --no-restore

# ---------- Tahap 2: runtime ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Jalan sebagai user biasa, bukan root
USER $APP_UID

# Image ASP.NET Core mendengarkan di port 8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "HotelBooking.Api.dll"]