import type { Metadata } from "next";
import { BookingCard } from "@/components/bookings/BookingCard";
import { FilterTabs, type FilterKey } from "@/components/bookings/FilterTabs";
import { Container } from "@/components/layout/Container";
import { ButtonLink } from "@/components/ui/Button";
import { ApiError } from "@/lib/api/client";
import { getMyBookings } from "@/lib/api/bookings";
import type { BookingDto } from "@/lib/api/types";
import { groupLabels, groupOf } from "@/lib/booking-groups";
import { redirectIfUnauthorized } from "@/lib/auth/guard";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "My bookings",
  robots: { index: false },
};

const filters: FilterKey[] = ["all", "active", "completed", "closed"];

function parseFilter(value: string | undefined): FilterKey {
  return filters.includes(value as FilterKey) ? (value as FilterKey) : "all";
}

export default async function MyBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const filter = parseFilter((await searchParams).filter);
  const session = await requireUser("/account/bookings");

  let bookings: BookingDto[];
  try {
    bookings = await getMyBookings(session.token);
  } catch (error) {
    redirectIfUnauthorized(error, "/account/bookings");
    if (error instanceof ApiError && error.status === 403) {
      return (
        <Container className="max-w-2xl py-16">
          <h1 className="text-2xl font-bold">Guest accounts only</h1>
          <p className="mt-3 text-muted">
            Booking history is available for guest accounts. Staff accounts do not have
            personal bookings.
          </p>
        </Container>
      );
    }
    throw error;
  }

  const counts = {
    all: bookings.length,
    active: bookings.filter((b) => groupOf(b) === "active").length,
    completed: bookings.filter((b) => groupOf(b) === "completed").length,
    closed: bookings.filter((b) => groupOf(b) === "closed").length,
  };

  const visible =
    filter === "all" ? bookings : bookings.filter((b) => groupOf(b) === filter);

  const tabs = [
    { key: "all" as const, label: "All", count: counts.all },
    { key: "active" as const, label: groupLabels.active, count: counts.active },
    { key: "completed" as const, label: groupLabels.completed, count: counts.completed },
    { key: "closed" as const, label: groupLabels.closed, count: counts.closed },
  ];

  return (
    <Container className="py-10 md:py-14">
      <h1 className="text-3xl font-bold">My bookings</h1>

      <div className="mt-6">
        <FilterTabs tabs={tabs} current={filter} />
      </div>

      {bookings.length === 0 ? (
        <div className="mt-10 rounded-lg bg-surface px-6 py-12 text-center">
          <p className="text-lg font-semibold">You have no bookings yet</p>
          <p className="mt-2 text-sm text-muted">
            Find a room and your reservations will show up here.
          </p>
          <div className="mt-6">
            <ButtonLink href="/rooms">Browse rooms</ButtonLink>
          </div>
        </div>
      ) : visible.length === 0 ? (
        <p className="mt-10 rounded-lg bg-surface px-6 py-10 text-center text-muted">
          No bookings in this group.
        </p>
      ) : (
        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {visible.map((booking) => (
            <li key={booking.id}>
              <BookingCard booking={booking} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}