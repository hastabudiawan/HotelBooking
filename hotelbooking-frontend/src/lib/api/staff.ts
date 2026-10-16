import "server-only";

import { apiGet, apiPost, apiRequest } from "./client";
import type { AdminRoomDto, RoomStatus, StaffBookingDto } from "./types";

export type StaffBookingFilter = {
  status?: string;
  checkIn?: string;
  checkOut?: string;
  code?: string;
};

export function searchStaffBookings(token: string, filter: StaffBookingFilter = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value) query.set(key, value);
  }
  const suffix = query.size > 0 ? `?${query}` : "";
  return apiGet<StaffBookingDto[]>(`/api/admin/bookings${suffix}`, { token });
}

export function checkInBooking(token: string, id: number) {
  return apiPost<StaffBookingDto>(`/api/admin/bookings/${id}/check-in`, undefined, { token });
}

export function checkOutBooking(token: string, id: number) {
  return apiPost<StaffBookingDto>(`/api/admin/bookings/${id}/check-out`, undefined, { token });
}

export function markNoShow(token: string, id: number) {
  return apiPost<StaffBookingDto>(`/api/admin/bookings/${id}/no-show`, undefined, { token });
}

export function getAdminRooms(token: string) {
  return apiGet<AdminRoomDto[]>("/api/admin/rooms", { token });
}

export function updateRoomStatus(token: string, id: number, status: RoomStatus) {
  return apiRequest<AdminRoomDto>(`/api/admin/rooms/${id}/status`, {
    method: "PATCH",
    body: { status },
    token,
  });
}