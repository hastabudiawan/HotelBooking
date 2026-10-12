using HotelBooking.Application.Common;

namespace HotelBooking.Application.Payments;

public interface IPaymentService
{
    Task<ServiceResult<PaymentResultDto>> PayAsync(
        int userId, int bookingId, PayBookingRequest request, CancellationToken ct = default);

    Task<ServiceResult<IReadOnlyList<PaymentDto>>> GetByBookingAsync(
        int userId, int bookingId, CancellationToken ct = default);
}