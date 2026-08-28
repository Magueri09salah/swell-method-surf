"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { ErrorBanner, SuccessBanner } from "@/components/ui/primitives";
import { saveClientAction } from "@/server/actions/admin";
import { EXPERIENCE_LEVEL_LABELS } from "@/lib/constants";
import type { ActionResult } from "@/server/services/types";
import type { ClientDetail } from "@/server/services/client";

export function ClientForm({ client }: { client: ClientDetail }) {
  const [state, formAction, pending] = useActionState<ActionResult<undefined> | null, FormData>(
    saveClientAction,
    null,
  );

  const failed = state !== null && !state.ok;
  const errors = failed ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={client.id} />

      {failed && <ErrorBanner>{state.error}</ErrorBanner>}
      {state?.ok && <SuccessBanner>Client saved.</SuccessBanner>}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Name"
          name="name"
          required
          defaultValue={client.name}
          error={errors.name?.[0]}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          required
          defaultValue={client.email}
          error={errors.email?.[0]}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <TextField
          label="Phone"
          name="phone"
          type="tel"
          defaultValue={client.phone ?? ""}
          error={errors.phone?.[0]}
        />
        <TextField
          label="WhatsApp"
          name="whatsapp"
          type="tel"
          defaultValue={client.whatsapp ?? ""}
          error={errors.whatsapp?.[0]}
        />
        <TextField
          label="Country"
          name="country"
          defaultValue={client.country ?? ""}
          error={errors.country?.[0]}
        />
      </div>

      <SelectField
        label="Experience level"
        name="experienceLevel"
        defaultValue={client.experienceLevel ?? ""}
        options={[
          { value: "", label: "Not recorded" },
          ...Object.entries(EXPERIENCE_LEVEL_LABELS).map(([value, label]) => ({ value, label })),
        ]}
        error={errors.experienceLevel?.[0]}
      />

      <TextAreaField
        label="Private notes"
        name="notes"
        rows={5}
        defaultValue={client.notes ?? ""}
        hint="Only you see these. Useful for injuries, goals, or what you worked on last time."
        error={errors.notes?.[0]}
      />

      <Button type="submit" loading={pending} className="w-fit">
        Save client
      </Button>
    </form>
  );
}
