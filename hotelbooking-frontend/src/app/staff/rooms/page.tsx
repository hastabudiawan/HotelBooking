import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoomStatusForm } from "@/components/staff/RoomStatusForm";
import { ApiError } from "@/lib/api/client";
import { getAdminRooms } from "@/lib/api/staff";
import type { AdminRoomDto, RoomStatus } from "@/lib/api/types";
import { redirectIfUnauthorized } from "@/lib/auth/guard";
import { STAFF_ROLES, requireRole } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Rooms" };

const statusStyle: Record<RoomStatus, string> = {
  Available: "bg-emerald-100 text-emerald-900",
  Occupied: "bg-sky-100 text-sky-900",
  Cleaning: "bg-amber-100 text-amber-900",
  Maintenance: "bg-red-100 text-red-900",
};

export default async function StaffRoomsPage() {
  const session = await requireRole(STAFF_ROLES, "/staff/rooms");

  let rooms: AdminRoomDto[];
  try {
    rooms = await getAdminRooms(session.token);
  } catch (error) {
    redirectIfUnauthorized(error, "/staff/rooms");
    if (error instanceof ApiError && error.status === 403) notFound();
    throw error;
  }

  const sorted = [...rooms].sort((a, b) =>
    a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }),
  );

  const counts = (["Available", "Occupied", "Cleaning", "Maintenance"] as RoomStatus[]).map(
    (status) => ({ status, count: rooms.filter((r) => r.status === status).length }),
  );

  return (
    <>
      <ul className="flex flex-wrap gap-3">
        {counts.map(({ status, count }) => (
          <li
            key={status}
            className={cn("rounded-full px-4 py-2 text-sm font-semibold", statusStyle[status])}
          >
            {status}: {count}
          </li>
        ))}
      </ul>

      {sorted.length === 0 ? (
        <p className="mt-6 rounded-lg bg-surface px-5 py-10 text-center text-muted">
          There are no rooms yet.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((room) => (
            <li
              key={room.id}
              className="rounded-lg bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xl font-bold">{room.roomNumber}</p>
                  <p className="text-sm text-muted">{room.roomTypeName}</p>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    statusStyle[room.status],
                  )}
                >
                  {room.status}
                </span>
              </div>
              <div className="mt-4">
                <RoomStatusForm roomId={room.id} current={room.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}