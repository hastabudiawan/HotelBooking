import type { Metadata } from "next";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Flash } from "@/components/admin/Flash";
import { ButtonLink } from "@/components/ui/Button";
import { getAdminRooms } from "@/lib/api/staff";
import type { AdminRoomDto } from "@/lib/api/types";
import { deleteRoomAction } from "@/lib/admin/actions";
import { redirectIfUnauthorized } from "@/lib/auth/guard";
import { ADMIN_ROLES, requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Rooms" };

export default async function AdminRoomsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const query = await searchParams;
  const session = await requireRole(ADMIN_ROLES, "/admin/rooms");

  let rooms: AdminRoomDto[];
  try {
    rooms = await getAdminRooms(session.token);
  } catch (error) {
    redirectIfUnauthorized(error, "/admin/rooms");
    throw error;
  }

  const sorted = [...rooms].sort((a, b) =>
    a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }),
  );

  return (
    <>
      <Flash saved={query.saved} deleted={query.deleted} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">
          Rooms <span className="text-base font-normal text-muted">({rooms.length})</span>
        </h2>
        <ButtonLink href="/admin/rooms/new">Add room</ButtonLink>
      </div>

      {sorted.length === 0 ? (
        <p className="mt-6 rounded-lg bg-surface px-5 py-10 text-center text-muted">
          No rooms yet.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {sorted.map((room) => (
            <li
              key={room.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-lg bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
            >
              <div>
                <p className="text-xl font-bold">{room.roomNumber}</p>
                <p className="text-sm text-muted">
                  {room.roomTypeName} · {room.status}
                </p>
              </div>
              <div className="flex flex-wrap items-start gap-3">
                <Link
                  href={`/admin/rooms/${room.id}`}
                  className="inline-flex rounded-md border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand-soft"
                >
                  Edit
                </Link>
                <DeleteButton
                  action={deleteRoomAction}
                  id={room.id}
                  question={`Delete room ${room.roomNumber}?`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}