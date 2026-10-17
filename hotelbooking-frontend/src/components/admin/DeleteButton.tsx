"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { FormState } from "@/lib/auth/types";

const initialState: FormState = {};

type Props = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  id: number;
  // Teks konfirmasi, misalnya: Delete room 101?
  question: string;
};

export function DeleteButton({ action, id, question }: Props) {
  const [asking, setAsking] = useState(false);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (!asking) {
    return (
      <div>
        <Button
          type="button"
          variant="outline"
          className="px-4 py-2"
          onClick={() => setAsking(true)}
        >
          Delete
        </Button>
        {state.error && (
          <p role="alert" className="mt-2 max-w-xs text-xs text-red-800">
            {state.error}
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="id" value={id} />
      <p className="text-sm">{question}</p>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending} className="px-4 py-2">
          {pending ? "Deleting..." : "Yes, delete"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          className="px-4 py-2"
          onClick={() => setAsking(false)}
        >
          Keep
        </Button>
      </div>
    </form>
  );
}