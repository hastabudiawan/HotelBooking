import { notFound } from "next/navigation";
import { StaffBookingRow } from "@/components/staff/StaffBookingRow";
import { StatTile } from "@/components/staff/StatTile";
import { ApiError } from "@/lib/api/client";
import { getAdminRooms, searchStaffBookings } from "@/lib/api/staff";
import type { AdminRoomDto, StaffBookingDto } from "@/lib/api/types";
import { redirectIfUnauthorized } from "@/lib/auth/guard";
import { STAFF_ROLES, requireRole } from "@/lib/auth/session";
import { formatDate, todayInJakarta } from "@/lib/format";

function Section({
  title,
  empty,
  items,
  today,
}: {
  title: string;
  empty: string;
  items: StaffBookingDto[];
  today: string;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">
        {title} <span className="text-base font-normal text-muted">({items.length})</span>
      </h2>
      {items.length === 0 ? (
        <p className="mt-4 rounded-lg bg-surface px-5 py-6 text-center text-sm text-muted">
          {empty}
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {items.map((booking) => (
            <li key={booking.id}>
              <StaffBookingRow booking={booking} today={today} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function StaffTodayPage() {
  const session = await requireRole(STAFF_ROLES, "/staff");
  const today = todayInJakarta();

  let confirmed: StaffBookingDto[];
  let inHouse: StaffBookingDto[];
  let rooms: AdminRoomDto[];
  try {
    [confirmed, inHouse, rooms] = await Promise.all([
      searchStaffBookings(session.token, { status: "Confirmed" }),
      searchStaffBookings(session.token, { status: "CheckedIn" }),
      getAdminRooms(session.token),
    ]);
  } catch (error) {
    redirectIfUnauthorized(error, "/staff");
    if (error instanceof ApiError && error.status === 403) notFound();
    throw error;
  }

  const arrivals = confirmed.filter((b) => b.checkIn === today);
  const late = confirmed.filter((b) => b.checkIn < today);
  const dueOut = inHouse.filter((b) => b.checkOut <= today);
  const availableRooms = rooms.filter((r) => r.status === "Available").length;

  return (
    <>
      <p className="text-sm text-muted">Today is {formatDate(today)} (WIB)</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Arrivals today" value={arrivals.length} />
        <StatTile label="In house" value={inHouse.length} />
        <StatTile label="Due out" value={dueOut.length} />
        <StatTile label="Rooms available" value={availableRooms} />
      </div>

      <Section
        title="Arrivals today"
        empty="No confirmed arrivals for today."
        items={arrivals}
        today={today}
      />
      <Section
        title="In house"
        empty="No guests are staying right now."
        items={[...inHouse].sort((a, b) => a.checkOut.localeCompare(b.checkOut))}
        today={today}
      />
      {late.length > 0 && (
        <Section
          title="Late arrivals"
          empty=""
          items={late}
          today={today}
        />
      )}
    </>
  );
}