"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { payAction } from "@/lib/bookings/actions";
import type { FormState } from "@/lib/auth/types";
import { formatRupiah } from "@/lib/format";

const initialState: FormState = {};

const methods = [
  { value: "Transfer", label: "Bank transfer" },
  { value: "QRIS", label: "QRIS" },
  { value: "Kartu", label: "Credit or debit card" },
];

export function PayForm({ bookingId, amount }: { bookingId: number; amount: number }) {
  const [state, formAction, pending] = useActionState(payAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="bookingId" value={bookingId} />

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Payment method</legend>
        {methods.map((method, index) => (
          <label
            key={method.value}
            className="flex cursor-pointer items-center gap-3 rounded-md border border-line px-4 py-3 text-sm has-checked:border-brand has-checked:bg-brand-soft"
          >
            <input
              type="radio"
              name="method"
              value={method.value}
              defaultChecked={index === 0}
              className="accent-brand"
            />
            {method.label}
          </label>
        ))}
      </fieldset>

      <label className="flex items-start gap-3 text-xs text-muted">
        <input type="checkbox" name="simulateFailure" className="mt-0.5 accent-brand" />
        <span>Demo only: simulate a declined payment</span>
      </label>

      {state.error && (
        <p role="alert" className="rounded-md bg-surface px-4 py-3 text-sm">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Processing..." : `Pay ${formatRupiah(amount)}`}
      </Button>
      <p className="text-center text-xs text-muted">
        This is a simulated payment. No real money is charged.
      </p>
    </form>
  );
}