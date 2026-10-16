import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHero } from "@/components/layout/PageHero";
import { RoomCard, type RoomCardData } from "@/components/rooms/RoomCard";
import { SearchSummary } from "@/components/rooms/SearchSummary";
import { ApiError } from "@/lib/api/client";
import {
  getRoomTypes,
  searchAvailableRoomTypes,
  type AvailabilityQuery,
} from "@/lib/api/rooms";
import { isIsoDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Rooms and Suites",
  description:
    "Browse the rooms and suites at Paradise View and check availability for your dates.",
};

type PageProps = {
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
};

type SearchOutcome =
  | { ok: true; rooms: RoomCardData[] }
  | { ok: false; message: string };

// Tanggal yang ditolak backend (400) diubah menjadi pesan. Error lain dilempar ke error.tsx.
async function runSearch(query: AvailabilityQuery): Promise<SearchOutcome> {
  try {
    const results = await searchAvailableRoomTypes(query);
    return {
      ok: true,
      rooms: results.map((item) => ({
        slug: item.slug,
        name: item.name,
        capacity: item.capacity,
        pricePerNight: item.pricePerNight,
        availableRooms: item.availableRooms,
        nights: item.nights,
        totalPrice: item.totalPrice,
      })),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return { ok: false, message: error.message };
    }
    throw error;
  }
}

export default async function RoomsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const guests = Math.min(
    10,
    Math.max(1, Number.parseInt(params.guests ?? "1", 10) || 1),
  );

  const search =
    isIsoDate(params.checkIn) && isIsoDate(params.checkOut)
      ? { checkIn: params.checkIn, checkOut: params.checkOut, guests }
      : null;

  const outcome = search ? await runSearch(search) : null;

  const rooms: RoomCardData[] =
    outcome === null
      ? (await getRoomTypes()).map((item) => ({
          slug: item.slug,
          name: item.name,
          capacity: item.capacity,
          pricePerNight: item.basePrice,
        }))
      : outcome.ok
        ? outcome.rooms
        : [];

  const query = search
    ? new URLSearchParams({
        checkIn: search.checkIn,
        checkOut: search.checkOut,
        guests: String(search.guests),
      }).toString()
    : undefined;

  return (
    <>
      <PageHero
        title="Rooms and Suites"
        subtitle="Choose the room that fits your stay."
      />

      <Container className="py-12 md:py-16">
        {search && (
          <SearchSummary
            checkIn={search.checkIn}
            checkOut={search.checkOut}
            guests={search.guests}
          />
        )}

        {outcome && !outcome.ok && (
          <p role="alert" className="rounded-lg bg-surface px-5 py-4 text-sm">
            {outcome.message}
          </p>
        )}

        {outcome?.ok && rooms.length === 0 && (
          <p className="rounded-lg bg-surface px-5 py-8 text-center text-muted">
            No rooms are available for these dates and number of guests. Try
            different dates.
          </p>
        )}

        {rooms.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <RoomCard key={room.slug} room={room} query={query} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}