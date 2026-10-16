import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CreateBookingForm } from "@/components/bookings/CreateBookingForm";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { checkRoomAvailability, getRoomTypeBySlug } from "@/lib/api/rooms";
import { requireUser } from "@/lib/auth/session";
import { ROLES } from "@/lib/auth/types";
import { formatDate, formatRupiah, isIsoDate, plural } from "@/lib/format";

export const metadata: Metadata = {
  title: "Confirm your booking",
  robots: { index: false },
};

type PageProps = {
  searchParams: Promise<{
    roomType?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
};

export default async function NewBookingPage({ searchParams }: PageProps) {
  const query = await searchParams;

  const returnTo = `/booking/new?${new URLSearchParams(
    Object.entries(query).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  )}`;

  const session = await requireUser(returnTo);

  if (!session.user.roles.includes(ROLES.guest)) {
    return (
      <Container className="max-w-2xl py-16">
        <h1 className="text-2xl font-bold">Guest accounts only</h1>
        <p className="mt-3 text-muted">
          Staff accounts cannot book rooms. Sign out and use a guest account to make a booking.
        </p>
      </Container>
    );
  }

  const guests = Number.parseInt(query.guests ?? "", 10);
  if (
    !query.roomType ||
    !isIsoDate(query.checkIn) ||
    !isIsoDate(query.checkOut) ||
    !Number.isInteger(guests) ||
    guests < 1
  ) {
    redirect("/rooms");
  }

  const room = await getRoomTypeBySlug(query.roomType);
  if (!room) notFound();

  const availability = await checkRoomAvailability(room.slug, {
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    guests,
  });

  const backHref = `/rooms/${room.slug}?${new URLSearchParams({
    checkIn: query.checkIn,
    checkOut: query.checkOut,
    guests: String(guests),
  })}`;

  return (
    <Container className="max-w-2xl py-10 md:py-14">
      <h1 className="text-3xl font-bold">Confirm your booking</h1>

      {availability.status === "invalid" && (
        <div className="mt-6 space-y-4">
          <p role="alert" className="rounded-md bg-surface px-4 py-3 text-sm">
            {availability.message}
          </p>
          <ButtonLink href={backHref} variant="outline">
            Change dates
          </ButtonLink>
        </div>
      )}

      {availability.status === "unavailable" && (
        <div className="mt-6 space-y-4">
          <p className="rounded-md bg-surface px-4 py-3 text-sm">
            Sorry, {room.name} is no longer available for these dates and number of guests.
          </p>
          <ButtonLink href={backHref} variant="outline">
            Choose other dates
          </ButtonLink>
        </div>
      )}

      {availability.status === "available" && (
        <div className="mt-6 rounded-lg bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <h2 className="text-xl font-semibold text-brand-dark">{room.name}</h2>

          <dl className="mt-5 grid grid-cols-2 gap-y-4 text-sm">
            <dt className="text-muted">Check-in</dt>
            <dd className="text-right font-semibold">{formatDate(query.checkIn)}</dd>

            <dt className="text-muted">Check-out</dt>
            <dd className="text-right font-semibold">{formatDate(query.checkOut)}</dd>

            <dt className="text-muted">Guests</dt>
            <dd className="text-right font-semibold">{plural(guests, "guest")}</dd>

            <dt className="text-muted">Price</dt>
            <dd className="text-right font-semibold">
              {formatRupiah(availability.item.pricePerNight)} x{" "}
              {plural(availability.item.nights, "night")}
            </dd>

            <dt className="border-t border-line pt-4 text-base font-semibold">Total</dt>
            <dd className="border-t border-line pt-4 text-right text-lg font-bold">
              {formatRupiah(availability.item.totalPrice)}
            </dd>
          </dl>

          <div className="mt-6">
            <CreateBookingForm
              roomTypeId={room.id}
              checkIn={query.checkIn}
              checkOut={query.checkOut}
              guestCount={guests}
              returnTo={returnTo}
            />
          </div>

          <p className="mt-4 text-center text-sm">
            <Link href={backHref} className="font-semibold text-brand hover:underline">
              Change dates
            </Link>
          </p>
        </div>
      )}
    </Container>
  );
}