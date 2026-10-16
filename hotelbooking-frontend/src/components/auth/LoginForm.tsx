"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { loginAction } from "@/lib/auth/actions";
import type { FormState } from "@/lib/auth/types";

const initialState: FormState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />

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
        autoComplete="current-password"
        required
      />

      {state.error && (
        <p role="alert" className="rounded-md bg-surface px-4 py-3 text-sm">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}