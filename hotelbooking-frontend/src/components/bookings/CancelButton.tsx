"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cancelAction } from "@/lib/bookings/actions";
import type { FormState } from "@/lib/auth/types";

const initialState: FormState = {};

export function CancelButton({
  bookingId,
  refundable,
}: {
  bookingId: number;
  // True kalau booking sudah dibayar (akan di-refund penuh).
  refundable: boolean;
}) {
  const [asking, setAsking] = useState(false);
  const [state, formAction, pending] = useActionState(cancelAction, initialState);

  if (!asking) {
    return (
      <div>
        <Button type="button" variant="outline" className="w-full" onClick={() => setAsking(true)}>
          Cancel booking
        </Button>
        {state.error && (
          <p role="alert" className="mt-3 rounded-md bg-surface px-4 py-3 text-sm">
            {state.error}
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-md bg-surface p-4">
      <input type="hidden" name="bookingId" value={bookingId} />
      <p className="text-sm">
        {refundable
          ? "Cancel this booking? Your payment will be refunded in full."
          : "Cancel this booking? The room will be released."}
      </p>
      <div className="flex gap-3">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? "Cancelling..." : "Yes, cancel"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          className="flex-1"
          onClick={() => setAsking(false)}
        >
          Keep booking
        </Button>
      </div>
    </form>
  );
}