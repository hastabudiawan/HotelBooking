import "server-only";

import { ApiError, apiGet, apiPost, apiRequest } from "./client";
import type { AdminRoomDto, RoomTypeDto, UserProfileDto } from "./types";

export type RoomTypeBody = {
  name: string;
  slug?: string;
  description: string;
  basePrice: number;
  capacity: number;
  imageUrl: string | null;
};

// Data segar untuk halaman admin (tanpa cache).
export function getRoomTypesFresh() {
  return apiGet<RoomTypeDto[]>("/api/room-types");
}

export function createRoomType(token: string, body: RoomTypeBody) {
  return apiPost<RoomTypeDto>("/api/room-types", body, { token });
}

export function updateRoomType(token: string, id: number, body: RoomTypeBody) {
  return apiRequest<RoomTypeDto>(`/api/room-types/${id}`, { method: "PUT", body, token });
}

export function deleteRoomType(token: string, id: number) {
  return apiRequest<void>(`/api/room-types/${id}`, { method: "DELETE", token });
}

export type RoomBody = { roomNumber: string; roomTypeId: number };

// Null kalau kamar tidak ditemukan.
export async function getAdminRoom(token: string, id: number) {
  try {
    return await apiGet<AdminRoomDto>(`/api/admin/rooms/${id}`, { token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function createRoom(token: string, body: RoomBody) {
  return apiPost<AdminRoomDto>("/api/admin/rooms", body, { token });
}

export function updateRoom(token: string, id: number, body: RoomBody) {
  return apiRequest<AdminRoomDto>(`/api/admin/rooms/${id}`, { method: "PUT", body, token });
}

export function deleteRoom(token: string, id: number) {
  return apiRequest<void>(`/api/admin/rooms/${id}`, { method: "DELETE", token });
}

export function createStaff(
  token: string,
  body: { fullName: string; email: string; password: string },
) {
  return apiPost<UserProfileDto>("/api/admin/staff", body, { token });
}