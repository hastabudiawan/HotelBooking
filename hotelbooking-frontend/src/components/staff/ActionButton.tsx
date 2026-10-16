"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import type { FormState } from "@/lib/auth/types";

type Props = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  bookingId: number;
  label: string;
  pendingLabel: string;
  variant?: "primary" | "outline";
};

const initialState: FormState = {};

export function ActionButton({
  action,
  bookingId,
  label,
  pendingLabel,
  variant = "primary",
}: Props) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <Button
        type="submit"
        variant={variant}
        disabled={pending}
        className="px-4 py-2"
      >
        {pending ? pendingLabel : label}
      </Button>
      {state.error && (
        <p role="alert" className="mt-2 max-w-xs text-xs text-red-800">
          {state.error}
        </p>
      )}
    </form>
  );
}