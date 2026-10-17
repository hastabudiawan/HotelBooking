"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, fieldClass } from "@/components/ui/Field";
import type { RoomTypeDto } from "@/lib/api/types";
import { saveRoomTypeAction } from "@/lib/admin/actions";
import type { FormState } from "@/lib/auth/types";

const initialState: FormState = {};

export function RoomTypeForm({ initial }: { initial?: RoomTypeDto }) {
  const [state, formAction, pending] = useActionState(saveRoomTypeAction, initialState);
  const values = state.values;

  return (
    <form action={formAction} className="max-w-xl space-y-4" noValidate>
      {initial && <input type="hidden" name="id" value={initial.id} />}
      {initial && <input type="hidden" name="imageUrl" value={initial.imageUrl ?? ""} />}

      <Field
        label="Name"
        name="name"
        defaultValue={values?.name ?? initial?.name}
        required
      />

      <Field
        label="Slug"
        name="slug"
        defaultValue={values?.slug ?? initial?.slug}
        placeholder={initial ? undefined : "Created from the name if left empty"}
        hint={
          initial
            ? "Part of the page address (/rooms/slug). Changing it breaks old links."
            : "Lowercase letters, numbers, and hyphens. Optional."
        }
      />

      <div>
        <label htmlFor="description" className="block text-sm font-semibold">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={values?.description ?? initial?.description}
          className={fieldClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Price per night (Rp)"
          name="basePrice"
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          defaultValue={values?.basePrice ?? initial?.basePrice}
          required
        />
        <Field
          label="Capacity (guests)"
          name="capacity"
          type="number"
          inputMode="numeric"
          min={1}
          max={10}
          step={1}
          defaultValue={values?.capacity ?? initial?.capacity}
          required
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded-md bg-surface px-4 py-3 text-sm">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : initial ? "Save changes" : "Create room type"}
        </Button>
        <Link
          href="/admin/room-types"
          className="inline-flex items-center px-4 text-sm font-semibold text-brand hover:underline"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}