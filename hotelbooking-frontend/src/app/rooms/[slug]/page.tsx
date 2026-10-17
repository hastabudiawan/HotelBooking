import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BedDouble } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { BookingPanel } from "@/components/rooms/BookingPanel";
import { checkRoomAvailability, getRoomTypeBySlug } from "@/lib/api/rooms";
import { isIsoDate } from "@/lib/format";
import { RoomImage } from "@/components/rooms/RoomImage";
import { amenityInfo, getRoomMedia, resolveRoomImage } from "@/lib/room-media";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const room = await getRoomTypeBySlug(slug);
  if (!room) return { title: "Room not found" };

  return {
    title: room.name,
    description: room.description.slice(0, 160),
  };
}

export default async function RoomDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const room = await getRoomTypeBySlug(slug);
  if (!room) notFound();

  const guests = Math.min(
    10,
    Math.max(1, Number.parseInt(query.guests ?? "2", 10) || 2),
  );

  const search =
    isIsoDate(query.checkIn) && isIsoDate(query.checkOut)
      ? { checkIn: query.checkIn, checkOut: query.checkOut, guests }
      : null;

  const availability = search
    ? await checkRoomAvailability(slug, search)
    : null;

  const media = getRoomMedia(slug);

  const image = resolveRoomImage(slug, room.imageUrl);

  // Kembali ke daftar dengan pencarian yang sama.
  const backHref = search
    ? `/rooms?${new URLSearchParams({
        checkIn: search.checkIn,
        checkOut: search.checkOut,
        guests: String(search.guests),
      })}`
    : "/rooms";

  return (
    <Container className="py-8 md:py-12">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
      >
        <ChevronLeft size={18} aria-hidden />
        Back to rooms
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
        <div>
          <div className="relative aspect-16/10 overflow-hidden rounded-lg bg-surface">
            {image ? (
              <RoomImage
                src={image}
                alt={`${room.name} room`}
                priority
                sizes="(min-width: 1024px) 760px, 100vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-line">
                <BedDouble size={72} aria-hidden />
              </div>
            )}
          </div>

          <h1 className="mt-8 text-3xl font-bold md:text-4xl">{room.name}</h1>
          <p className="mt-4 leading-relaxed text-muted">{room.description}</p>

          <h2 className="mt-10 text-xl font-semibold">Amenities</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {media.amenities.map((key) => {
              const { label, Icon } = amenityInfo[key];
              return (
                <li key={key} className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <Icon size={18} aria-hidden />
                  </span>
                  <span className="text-sm">{label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <BookingPanel
          slug={room.slug}
          pricePerNight={room.basePrice}
          capacity={room.capacity}
          search={search}
          availability={availability}
        />
      </div>
    </Container>
  );
}
