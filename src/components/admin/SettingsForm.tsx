"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { ErrorBanner, SuccessBanner } from "@/components/ui/primitives";
import { saveSettingsAction } from "@/server/actions/admin";
import type { ActionResult } from "@/server/services/types";
import type { SiteSettings } from "@/server/services/settings";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState<ActionResult<undefined> | null, FormData>(
    saveSettingsAction,
    null,
  );

  const failed = state !== null && !state.ok;
  const errors = failed ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} className="flex max-w-[52rem] flex-col gap-8">
      {failed && <ErrorBanner>{state.error}</ErrorBanner>}
      {state?.ok && <SuccessBanner>Settings saved.</SuccessBanner>}

      <fieldset className="flex flex-col gap-5 border-0 p-0">
        <legend className="type-label mb-1 text-[var(--text-tertiary)]">Business</legend>

        <TextField
          label="Business name"
          name="businessName"
          required
          defaultValue={settings.businessName}
          error={errors.businessName?.[0]}
        />

        <TextField
          label="Location"
          name="location"
          defaultValue={settings.location}
          hint="Shown in the footer and on the booking page."
          error={errors.location?.[0]}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-5 border-0 p-0">
        <legend className="type-label mb-1 text-[var(--text-tertiary)]">Contact</legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Email"
            name="email"
            type="email"
            required
            defaultValue={settings.email}
            hint="Shown publicly. Where clients reply to you."
            error={errors.email?.[0]}
          />
          <TextField
            label="Phone"
            name="phone"
            type="tel"
            defaultValue={settings.phone}
            error={errors.phone?.[0]}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="WhatsApp number"
            name="whatsapp"
            type="tel"
            defaultValue={settings.whatsapp}
            hint="Include the country code, e.g. +212 6 12 34 56 78."
            error={errors.whatsapp?.[0]}
          />
          <TextField
            label="Instagram URL"
            name="instagram"
            defaultValue={settings.instagram}
            error={errors.instagram?.[0]}
          />
        </div>

        <TextField
          label="Google Maps URL"
          name="mapsUrl"
          defaultValue={settings.mapsUrl}
          hint="Optional. Used in structured data so search engines can place you."
          error={errors.mapsUrl?.[0]}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-5 border-0 p-0">
        <legend className="type-label mb-1 text-[var(--text-tertiary)]">Booking</legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Currency"
            name="currency"
            required
            maxLength={3}
            defaultValue={settings.currency}
            hint="Three-letter code, e.g. MAD or EUR."
            error={errors.currency?.[0]}
          />
          <TextField
            label="Timezone"
            name="timezone"
            required
            defaultValue={settings.timezone}
            hint="IANA name. Africa/Casablanca for Imsouane."
            error={errors.timezone?.[0]}
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5 border-0 p-0">
        <legend className="type-label mb-1 text-[var(--text-tertiary)]">Search engines</legend>

        <TextField
          label="Default page title"
          name="seoTitle"
          defaultValue={settings.seoTitle}
          hint="Aim for under 60 characters — longer titles get truncated in results."
          error={errors.seoTitle?.[0]}
        />

        <TextField
          label="Default description"
          name="seoDescription"
          defaultValue={settings.seoDescription}
          hint="Aim for under 160 characters."
          error={errors.seoDescription?.[0]}
        />
      </fieldset>

      <div className="border-t border-[var(--color-line)] pt-6">
        <Button type="submit" loading={pending}>
          Save settings
        </Button>
      </div>
    </form>
  );
}
