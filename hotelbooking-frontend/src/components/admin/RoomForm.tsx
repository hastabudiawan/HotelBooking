"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, fieldClass } from "@/components/ui/Field";
import type { AdminRoomDto, RoomTypeDto } from "@/lib/api/types";
import { saveRoomAction } from "@/lib/admin/actions";
import type { FormState } from "@/lib/auth/types";

const initialState: FormState = {};

export function RoomForm({
  roomTypes,
  initial,
}: {
  roomTypes: RoomTypeDto[];
  initial?: AdminRoomDto;
}) {
  const [state, formAction, pending] = useActionState(saveRoomAction, initialState);
  const values = state.values;

  return (
    <form action={formAction} className="max-w-md space-y-4" noValidate>
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <Field
        label="Room number"
        name="roomNumber"
        defaultValue={values?.roomNumber ?? initial?.roomNumber}
        maxLength={10}
        required
      />

      <div>
        <label htmlFor="roomTypeId" className="block text-sm font-semibold">
          Room type
        </label>
        <select
          id="roomTypeId"
          name="roomTypeId"
          defaultValue={values?.roomTypeId ?? String(initial?.roomTypeId ?? roomTypes[0]?.id ?? "")}
          className={fieldClass}
        >
          {roomTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {state.error && (
        <p role="alert" className="rounded-md bg-surface px-4 py-3 text-sm">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : initial ? "Save changes" : "Add room"}
        </Button>
        <Link
          href="/admin/rooms"
          className="inline-flex items-center px-4 text-sm font-semibold text-brand hover:underline"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}