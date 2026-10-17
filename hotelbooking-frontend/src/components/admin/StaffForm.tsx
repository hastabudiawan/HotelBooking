"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { createStaffAction } from "@/lib/admin/actions";
import type { FormState } from "@/lib/auth/types";

const initialState: FormState = {};

export function StaffForm() {
  const [state, formAction, pending] = useActionState(createStaffAction, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-4" noValidate>
      <Field
        label="Full name"
        name="fullName"
        autoComplete="off"
        defaultValue={state.values?.fullName}
        required
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="off"
        defaultValue={state.values?.email}
        required
      />
      <Field
        label="Temporary password"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters, with an uppercase letter, a lowercase letter, and a number."
        required
      />

      {state.error && (
        <p role="alert" className="rounded-md bg-surface px-4 py-3 text-sm">
          {state.error}
        </p>
      )}
      {state.message && (
        <p role="status" className="rounded-md bg-emerald-100 px-4 py-3 text-sm text-emerald-900">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create receptionist"}
      </Button>
    </form>
  );
}