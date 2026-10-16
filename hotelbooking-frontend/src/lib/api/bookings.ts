import "server-only";

import { ApiError, apiGet, apiPost } from "./client";
import type { BookingDto, PaymentDto, PaymentResultDto } from "./types";

export function createBooking(
  token: string,
  body: { roomTypeId: number; checkIn: string; checkOut: string; guestCount: number },
) {
  return apiPost<BookingDto>("/api/bookings", body, { token });
}

// Null kalau booking tidak ada atau bukan milik pengguna (backend menjawab 404).
export async function getBooking(token: string, id: number) {
  try {
    return await apiGet<BookingDto>(`/api/bookings/${id}`, { token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function getPayments(token: string, id: number) {
  return apiGet<PaymentDto[]>(`/api/bookings/${id}/payments`, { token });
}

export function payBooking(
  token: string,
  id: number,
  body: { method: string; simulateFailure: boolean },
) {
  return apiPost<PaymentResultDto>(`/api/bookings/${id}/pay`, body, { token });
}

export function cancelBooking(token: string, id: number) {
  return apiPost<BookingDto>(`/api/bookings/${id}/cancel`, undefined, { token });
}