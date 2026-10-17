import Link from "next/link";
import { StatTile } from "@/components/staff/StatTile";
import { getRoomTypesFresh } from "@/lib/api/admin";
import { getAdminRooms } from "@/lib/api/staff";
import type { AdminRoomDto, RoomTypeDto } from "@/lib/api/types";
import { ADMIN_ROLES, requireRole } from "@/lib/auth/session";
import { redirectIfUnauthorized } from "@/lib/auth/guard";

const shortcuts = [
  { href: "/admin/room-types", title: "Room types", text: "Names, prices, capacity, and descriptions." },
  { href: "/admin/rooms", title: "Rooms", text: "Add, rename, or remove physical rooms." },
  { href: "/admin/staff", title: "Staff", text: "Create receptionist accounts." },
];

export default async function AdminOverviewPage() {
  const session = await requireRole(ADMIN_ROLES, "/admin");

  let roomTypes: RoomTypeDto[];
  let rooms: AdminRoomDto[];
  try {
    [roomTypes, rooms] = await Promise.all([getRoomTypesFresh(), getAdminRooms(session.token)]);
  } catch (error) {
    redirectIfUnauthorized(error, "/admin");
    throw error;
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Room types" value={roomTypes.length} />
        <StatTile label="Rooms" value={rooms.length} />
        <StatTile
          label="Rooms in maintenance"
          value={rooms.filter((room) => room.status === "Maintenance").length}
        />
      </div>

      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {shortcuts.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block h-full rounded-lg bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_6px_24px_rgba(0,0,0,0.14)]"
            >
              <h2 className="text-lg font-semibold text-brand-dark">{item.title}</h2>
              <p className="mt-2 text-sm text-muted">{item.text}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}