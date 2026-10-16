"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { registerAction } from "@/lib/auth/actions";
import type { FormState } from "@/lib/auth/types";

const initialState: FormState = {};

export function RegisterForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />

      <Field
        label="Full name"
        name="fullName"
        autoComplete="name"
        defaultValue={state.values?.fullName}
        required
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={state.values?.email}
        required
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters, with an uppercase letter, a lowercase letter, and a number."
        required
      />
      <Field
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
      />

      {state.error && (
        <p role="alert" className="rounded-md bg-surface px-4 py-3 text-sm">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}