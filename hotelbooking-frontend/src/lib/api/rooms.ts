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

export type RoomAvailability =
  | { status: "available"; item: AvailableRoomTypeDto }
  | { status: "unavailable" }
  | { status: "invalid"; message: string };

// Cek satu tipe kamar. Error 400 dari backend (tanggal salah) menjadi status "invalid".
// Error lain (backend mati, 500) dilempar ke error.tsx.
export async function checkRoomAvailability(
  slug: string,
  query: AvailabilityQuery,
): Promise<RoomAvailability> {
  try {
    const results = await searchAvailableRoomTypes(query);
    const item = results.find((result) => result.slug === slug);
    return item ? { status: "available", item } : { status: "unavailable" };
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return { status: "invalid", message: error.message };
    }
    throw error;
  }
}