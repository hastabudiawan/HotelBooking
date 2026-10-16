"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { createBookingAction } from "@/lib/bookings/actions";
import type { FormState } from "@/lib/auth/types";

const initialState: FormState = {};

type Props = {
  roomTypeId: number;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  returnTo: string;
};

export function CreateBookingForm({
  roomTypeId,
  checkIn,
  checkOut,
  guestCount,
  returnTo,
}: Props) {
  const [state, formAction, pending] = useActionState(createBookingAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="roomTypeId" value={roomTypeId} />
      <input type="hidden" name="checkIn" value={checkIn} />
      <input type="hidden" name="checkOut" value={checkOut} />
      <input type="hidden" name="guestCount" value={guestCount} />
      <input type="hidden" name="returnTo" value={returnTo} />

      {state.error && (
        <p role="alert" className="rounded-md bg-surface px-4 py-3 text-sm">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Booking..." : "Confirm booking"}
      </Button>
      <p className="text-center text-xs text-muted">
        Your room is held for 15 minutes. Pay within that time to confirm your booking.
      </p>
    </form>
  );
}