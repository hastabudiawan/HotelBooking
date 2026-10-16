"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { fieldClass } from "@/components/ui/Field";
import type { RoomStatus } from "@/lib/api/types";
import type { FormState } from "@/lib/auth/types";
import { updateRoomStatusAction } from "@/lib/staff/actions";

const initialState: FormState = {};

const options: RoomStatus[] = ["Available", "Cleaning", "Maintenance"];

export function RoomStatusForm({
  roomId,
  current,
}: {
  roomId: number;
  current: RoomStatus;
}) {
  const [state, formAction, pending] = useActionState(updateRoomStatusAction, initialState);

  if (current === "Occupied") {
    return (
      <p className="text-xs text-muted">
        Occupied. The status changes when the guest checks out.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="roomId" value={roomId} />
      <div className="flex gap-2">
        <label className="sr-only" htmlFor={`status-${roomId}`}>
          Room status
        </label>
        <select
          id={`status-${roomId}`}
          name="status"
          defaultValue={current}
          className={`${fieldClass} mt-0 flex-1 py-2`}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" disabled={pending} className="px-4 py-2">
          {pending ? "..." : "Save"}
        </Button>
      </div>
      {state.error && (
        <p role="alert" className="text-xs text-red-800">
          {state.error}
        </p>
      )}
    </form>
  );
}