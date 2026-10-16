import { Coffee, Flame, Gamepad2, Tv, Wifi, type LucideIcon } from "lucide-react";

export type AmenityKey = "tv" | "wifi" | "breakfast" | "fireplace" | "console";

export const amenityInfo: Record<AmenityKey, { label: string; Icon: LucideIcon }> = {
  tv: { label: "Television", Icon: Tv },
  wifi: { label: "Wifi", Icon: Wifi },
  breakfast: { label: "Breakfast", Icon: Coffee },
  fireplace: { label: "Fireplace", Icon: Flame },
  console: { label: "Game console", Icon: Gamepad2 },
};

type RoomMedia = {
  image?: string;
  amenities: AmenityKey[];
};

const mediaBySlug: Record<string, RoomMedia> = {
  standard: {
    // image: "/images/rooms/standard.jpg",   // aktifkan kalau fotonya sudah ada
    amenities: ["tv", "wifi", "breakfast"],
  },
  deluxe: {
    image: "/images/rooms/deluxe.jpg",
    amenities: ["tv", "wifi", "breakfast", "fireplace"],
  },
  suite: {
    image: "/images/rooms/suite.jpg",
    amenities: ["tv", "wifi", "breakfast", "fireplace", "console"],
  },
};

const fallback: RoomMedia = { amenities: ["tv", "wifi"] };

export function getRoomMedia(slug: string): RoomMedia {
  return mediaBySlug[slug] ?? fallback;
}