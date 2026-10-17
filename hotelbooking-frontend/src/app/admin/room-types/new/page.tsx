import type { Metadata } from "next";
import { RoomTypeForm } from "@/components/admin/RoomTypeForm";
import { ADMIN_ROLES, requireRole } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Add room type" };

export default async function NewRoomTypePage() {
  await requireRole(ADMIN_ROLES, "/admin/room-types/new");

  return (
    <>
      <h2 className="text-xl font-semibold">Add room type</h2>
      <div className="mt-6">
        <RoomTypeForm />
      </div>
    </>
  );
}