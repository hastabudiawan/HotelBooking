import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoomTypeForm } from "@/components/admin/RoomTypeForm";
import { getRoomTypesFresh } from "@/lib/api/admin";
import { redirectIfUnauthorized } from "@/lib/auth/guard";
import { ADMIN_ROLES, requireRole } from "@/lib/auth/session";
import type { RoomTypeDto } from "@/lib/api/types";

export const metadata: Metadata = { title: "Edit room type" };

export default async function EditRoomTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();

  await requireRole(ADMIN_ROLES, `/admin/room-types/${id}`);

  let roomTypes: RoomTypeDto[];
  try {
    roomTypes = await getRoomTypesFresh();
  } catch (error) {
    redirectIfUnauthorized(error, `/admin/room-types/${id}`);
    throw error;
  }

  const roomType = roomTypes.find((item) => item.id === id);
  if (!roomType) notFound();

  return (
    <>
      <h2 className="text-xl font-semibold">Edit {roomType.name}</h2>
      <div className="mt-6">
        <RoomTypeForm initial={roomType} />
      </div>
    </>
  );
}