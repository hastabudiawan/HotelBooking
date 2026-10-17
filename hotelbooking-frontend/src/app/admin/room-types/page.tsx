import type { Metadata } from "next";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Flash } from "@/components/admin/Flash";
import { ButtonLink } from "@/components/ui/Button";
import { getRoomTypesFresh } from "@/lib/api/admin";
import type { RoomTypeDto } from "@/lib/api/types";
import { deleteRoomTypeAction } from "@/lib/admin/actions";
import { redirectIfUnauthorized } from "@/lib/auth/guard";
import { ADMIN_ROLES, requireRole } from "@/lib/auth/session";
import { formatRupiah, plural } from "@/lib/format";

export const metadata: Metadata = { title: "Room types" };

export default async function AdminRoomTypesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const query = await searchParams;
  await requireRole(ADMIN_ROLES, "/admin/room-types");

  let roomTypes: RoomTypeDto[];
  try {
    roomTypes = await getRoomTypesFresh();
  } catch (error) {
    redirectIfUnauthorized(error, "/admin/room-types");
    throw error;
  }

  return (
    <>
      <Flash saved={query.saved} deleted={query.deleted} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">
          Room types <span className="text-base font-normal text-muted">({roomTypes.length})</span>
        </h2>
        <ButtonLink href="/admin/room-types/new">Add room type</ButtonLink>
      </div>

      {roomTypes.length === 0 ? (
        <p className="mt-6 rounded-lg bg-surface px-5 py-10 text-center text-muted">
          No room types yet.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {roomTypes.map((type) => (
            <li
              key={type.id}
              className="flex flex-wrap items-start justify-between gap-4 rounded-lg bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
            >
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-brand-dark">{type.name}</h3>
                <p className="text-xs text-muted">/rooms/{type.slug}</p>
                <p className="mt-2 text-sm">
                  {formatRupiah(type.basePrice)} / night · up to {plural(type.capacity, "guest")}
                </p>
              </div>
              <div className="flex flex-wrap items-start gap-3">
                <Link
                  href={`/admin/room-types/${type.id}`}
                  className="inline-flex rounded-md border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand-soft"
                >
                  Edit
                </Link>
                <DeleteButton
                  action={deleteRoomTypeAction}
                  id={type.id}
                  question={`Delete ${type.name}?`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}