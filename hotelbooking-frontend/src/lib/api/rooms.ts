import "server-only";

import { ApiError, apiGet } from "./client";
import type { AvailableRoomTypeDto, RoomTypeDto } from "./types";

export function getRoomTypes() {
  return apiGet<RoomTypeDto[]>("/api/room-types", { revalidate: 60 });
}

// Mengembalikan null kalau slug tidak ada (dipakai halaman detail di part 4).
export async function getRoomTypeBySlug(slug: string) {
  try {
    return await apiGet<RoomTypeDto>(
      `/api/room-types/${encodeURIComponent(slug)}`,
      { revalidate: 60 },
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export type AvailabilityQuery = {
  checkIn: string;
  checkOut: string;
  guests: number;
};

export function searchAvailableRoomTypes({
  checkIn,
  checkOut,
  guests,
}: AvailabilityQuery) {
  const query = new URLSearchParams({
    checkIn,
    checkOut,
    guests: String(guests),
  });
  return apiGet<AvailableRoomTypeDto[]>(`/api/rooms/available?${query}`);
}