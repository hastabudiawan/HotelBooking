import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StaffBookingRow } from "@/components/staff/StaffBookingRow";
import { Button } from "@/components/ui/Button";
import { Field, fieldClass } from "@/components/ui/Field";
import { ApiError } from "@/lib/api/client";
import { searchStaffBookings } from "@/lib/api/staff";
import type { BookingStatus, StaffBookingDto } from "@/lib/api/types";
import { statusInfo } from "@/lib/booking-status";
import { redirectIfUnauthorized } from "@/lib/auth/guard";
import { STAFF_ROLES, requireRole } from "@/lib/auth/session";
import { isIsoDate, todayInJakarta } from "@/lib/format";

export const metadata: Metadata = { title: "Bookings" };

type PageProps = {
  searchParams: Promise<{ status?: string; checkIn?: string; code?: string }>;
};

const statuses = Object.keys(statusInfo) as BookingStatus[];

export default async function StaffBookingsPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const session = await requireRole(STAFF_ROLES, "/staff/bookings");
  const today = todayInJakarta();

  // Hanya nilai yang valid yang diteruskan ke backend.
  const status = statuses.find((item) => item === query.status);
  const checkIn = isIsoDate(query.checkIn) ? query.checkIn : undefined;
  const code = query.code?.trim() || undefined;
  const hasFilter = Boolean(status || checkIn || code);

  let results: StaffBookingDto[];
  try {
    results = await searchStaffBookings(session.token, { status, checkIn, code });
  } catch (error) {
    redirectIfUnauthorized(error, "/staff/bookings");
    if (error instanceof ApiError && error.status === 403) notFound();
    throw error;
  }

  return (
    <>
      <form
        method="get"
        action="/staff/bookings"
        className="grid gap-4 rounded-lg bg-surface p-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end"
      >
        <div>
          <label htmlFor="status" className="block text-sm font-semibold">
            Status
          </label>
          <select id="status" name="status" defaultValue={status ?? ""} className={fieldClass}>
            <option value="">Any status</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {statusInfo[item].label}
              </option>
            ))}
          </select>
        </div>

        <Field label="Check-in date" name="checkIn" type="date" defaultValue={checkIn} />
        <Field
          label="Booking code"
          name="code"
          placeholder="e.g. K7M2P"
          defaultValue={code}
        />

        <Button type="submit">Search</Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        {results.length === 200
          ? "Showing the first 200 results. Narrow the search to see others."
          : `${results.length} ${results.length === 1 ? "booking" : "bookings"} found`}
        {!hasFilter && ", all statuses"}
        {hasFilter && (
          <>
            {" · "}
            <a href="/staff/bookings" className="font-semibold text-brand hover:underline">
              Clear filters
            </a>
          </>
        )}
      </p>

      {results.length === 0 ? (
        <p className="mt-4 rounded-lg bg-surface px-5 py-10 text-center text-muted">
          No bookings match your search.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {results.map((booking) => (
            <li key={booking.id}>
              <StaffBookingRow booking={booking} today={today} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}