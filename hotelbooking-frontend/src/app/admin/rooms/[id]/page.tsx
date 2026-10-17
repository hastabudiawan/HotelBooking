import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoomForm } from "@/components/admin/RoomForm";
import { getAdminRoom, getRoomTypesFresh } from "@/lib/api/admin";
import { redirectIfUnauthorized } from "@/lib/auth/guard";
import { ADMIN_ROLES, requireRole } from "@/lib/auth/session";
import type { AdminRoomDto, RoomTypeDto } from "@/lib/api/types";

export const metadata: Metadata = { title: "Edit room" };

export default async function EditRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const session = await requireRole(ADMIN_ROLES, `/admin/rooms/${id}`);

  let room: AdminRoomDto | null;
  let roomTypes: RoomTypeDto[];
  try {
    [room, roomTypes] = await Promise.all([
      getAdminRoom(session.token, id),
      getRoomTypesFresh(),
    ]);
  } catch (error) {
    redirectIfUnauthorized(error, `/admin/rooms/${id}`);
    throw error;
  }

  if (!room) notFound();

  return (
    <>
      <h2 className="text-xl font-semibold">Edit room {room.roomNumber}</h2>
      <p className="mt-1 text-sm text-muted">
        Status is managed from the front desk or during check-in and check-out.
      </p>
      <div className="mt-6">
        <RoomForm roomTypes={roomTypes} initial={room} />
      </div>
    </>
  );
}