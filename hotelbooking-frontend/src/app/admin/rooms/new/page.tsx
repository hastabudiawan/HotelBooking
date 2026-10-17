import type { Metadata } from "next";
import { RoomForm } from "@/components/admin/RoomForm";
import { getRoomTypesFresh } from "@/lib/api/admin";
import { redirectIfUnauthorized } from "@/lib/auth/guard";
import { ADMIN_ROLES, requireRole } from "@/lib/auth/session";
import type { RoomTypeDto } from "@/lib/api/types";

export const metadata: Metadata = { title: "Add room" };

export default async function NewRoomPage() {
  await requireRole(ADMIN_ROLES, "/admin/rooms/new");

  let roomTypes: RoomTypeDto[];
  try {
    roomTypes = await getRoomTypesFresh();
  } catch (error) {
    redirectIfUnauthorized(error, "/admin/rooms/new");
    throw error;
  }

  return (
    <>
      <h2 className="text-xl font-semibold">Add room</h2>
      <div className="mt-6">
        {roomTypes.length === 0 ? (
          <p className="rounded-lg bg-surface px-5 py-6 text-sm">
            Create a room type first, then add rooms to it.
          </p>
        ) : (
          <RoomForm roomTypes={roomTypes} />
        )}
      </div>
    </>
  );
}