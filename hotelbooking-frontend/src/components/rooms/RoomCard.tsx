import { BedDouble } from "lucide-react";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { formatRupiah, plural } from "@/lib/format";
import { amenityInfo, getRoomMedia } from "@/lib/room-media";

export type RoomCardData = {
  slug: string;
  name: string;
  capacity: number;
  pricePerNight: number;
  // Hanya terisi pada hasil pencarian:
  availableRooms?: number;
  nights?: number;
  totalPrice?: number;
};

export function RoomCard({
  room,
  query,
}: {
  room: RoomCardData;
  // Query tanggal ikut dibawa ke halaman detail, misalnya "checkIn=...&checkOut=...&guests=2"
  query?: string;
}) {
  const media = getRoomMedia(room.slug);
  const href = `/rooms/${room.slug}${query ? `?${query}` : ""}`;
  const isSearchResult = room.availableRooms !== undefined;

  return (
    <article className="flex flex-col overflow-hidden rounded-lg bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <div className="relative aspect-[3/2] bg-surface">
        {media.image ? (
          <Image
            src={media.image}
            alt={`${room.name} room`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-line">
            <BedDouble size={56} aria-hidden />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-semibold text-brand-dark">{room.name}</h2>
          <p className="shrink-0 pt-1 text-xs text-brand">
            {isSearchResult
              ? `${plural(room.availableRooms ?? 0, "room")} available`
              : `Up to ${plural(room.capacity, "guest")}`}
          </p>
        </div>

        <p className="mt-2 text-lg font-semibold">
          {formatRupiah(room.pricePerNight)}{" "}
          <span className="text-sm font-normal text-muted">/ night</span>
        </p>

        {isSearchResult && room.totalPrice !== undefined && room.nights !== undefined && (
          <p className="mt-1 text-sm text-muted">
            {formatRupiah(room.totalPrice)} for {plural(room.nights, "night")}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
          <ul className="flex gap-2" aria-label="Amenities">
            {media.amenities.map((key) => {
              const { label, Icon } = amenityInfo[key];
              return (
                <li
                  key={key}
                  title={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-muted"
                >
                  <Icon size={16} aria-hidden />
                  <span className="sr-only">{label}</span>
                </li>
              );
            })}
          </ul>
          <ButtonLink href={href} className="px-5 py-2.5">
            Book now
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}