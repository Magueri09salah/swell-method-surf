"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { ErrorBanner } from "@/components/ui/primitives";
import { loginAction } from "@/server/actions/auth";
import type { ActionResult } from "@/server/services/types";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionResult<undefined> | null, FormData>(
    loginAction,
    null,
  );

  const failed = state !== null && !state.ok;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {/* One generic message for both unknown-email and wrong-password, so
          accounts cannot be enumerated from the response. */}
      {failed && <ErrorBanner>{state.error}</ErrorBanner>}

      <TextField
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="username"
        autoFocus
        inputMode="email"
      />

      <TextField
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
      />

      <Button type="submit" size="lg" loading={pending} className="mt-1 w-full">
        Sign in
      </Button>
    </form>
  );
}
