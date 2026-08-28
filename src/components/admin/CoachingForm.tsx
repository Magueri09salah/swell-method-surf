"use client";

import { useActionState, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CheckboxField, SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { ImagePicker } from "./ImagePicker";
import { ErrorBanner } from "@/components/ui/primitives";
import { saveCoachingOffer } from "@/server/actions/admin";
import { COACHING_FORMAT_LABELS, COACHING_LEVEL_LABELS } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import type { ActionResult, CoachingOfferDTO } from "@/server/services/types";

export function CoachingForm({ offer }: { offer?: CoachingOfferDTO }) {
  const [state, formAction, pending] = useActionState<ActionResult<undefined> | null, FormData>(
    saveCoachingOffer,
    null,
  );

  const failed = state !== null && !state.ok;
  const errors = failed ? (state.fieldErrors ?? {}) : {};

  // Slug auto-fills from the title while creating, but is never overwritten
  // once an offer exists — changing a live slug breaks inbound links.
  const [title, setTitle] = useState(offer?.title ?? "");
  const [slug, setSlug] = useState(offer?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(offer));

  const [imageUrl, setImageUrl] = useState(offer?.imageUrl ?? "");

  return (
    <form action={formAction} className="flex max-w-[52rem] flex-col gap-6">
      {offer && <input type="hidden" name="id" value={offer.id} />}

      {failed && <ErrorBanner>{state.error}</ErrorBanner>}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Title"
          name="title"
          required
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (!slugTouched) setSlug(slugify(event.target.value));
          }}
          error={errors.title?.[0]}
        />
        <TextField
          label="Slug"
          name="slug"
          required
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          hint="Used in links. Lowercase letters, numbers and hyphens."
          error={errors.slug?.[0]}
        />
      </div>

      <TextAreaField
        label="Short description"
        name="shortDescription"
        rows={2}
        required
        defaultValue={offer?.shortDescription}
        hint="Appears on cards. Keep it under about 200 characters."
        error={errors.shortDescription?.[0]}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Level"
          name="level"
          defaultValue={offer?.level ?? "ALL_LEVELS"}
          options={Object.entries(COACHING_LEVEL_LABELS).map(([value, label]) => ({ value, label }))}
          error={errors.level?.[0]}
        />
        <SelectField
          label="Format"
          name="format"
          defaultValue={offer?.format ?? "PRIVATE"}
          options={Object.entries(COACHING_FORMAT_LABELS)
            .filter(([value]) => value !== "NOT_SURE")
            .map(([value, label]) => ({ value, label }))}
          error={errors.format?.[0]}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <TextField
          label="Duration (minutes)"
          name="durationMinutes"
          type="number"
          min={15}
          max={600}
          required
          defaultValue={offer?.durationMinutes ?? 120}
          error={errors.durationMinutes?.[0]}
        />
        <TextField
          label="Price"
          name="price"
          type="number"
          min={0}
          step="1"
          required
          defaultValue={offer?.price ?? 0}
          error={errors.price?.[0]}
        />
        <TextField
          label="Currency"
          name="currency"
          required
          maxLength={3}
          defaultValue={offer?.currency ?? "MAD"}
          error={errors.currency?.[0]}
        />
        <TextField
          label="Max participants"
          name="maxParticipants"
          type="number"
          min={1}
          max={20}
          required
          defaultValue={offer?.maxParticipants ?? 1}
          error={errors.maxParticipants?.[0]}
        />
      </div>

      <TextAreaField
        label="What's included"
        name="includes"
        rows={5}
        defaultValue={offer?.includes.join("\n")}
        hint="One item per line. These appear as a checklist on the coaching page."
        error={errors.includes?.[0]}
      />

      <input type="hidden" name="imageUrl" value={imageUrl} />
      {/* The card photograph is decorative — the title, summary and price beside
          it carry the meaning — so it renders with alt="" (WCAG 1.1.1) and the
          form does not ask for alt text. */}
      <input type="hidden" name="imageAlt" value="" />

      <ImagePicker
        label="Photograph"
        value={imageUrl}
        onChange={setImageUrl}
        altText=""
        onAltTextChange={() => {}}
        showAltText={false}
        showLibrary={false}
        showUrlInput={false}
        uploadAltFallback={title || "Coaching photograph"}
        hint="Optional. Upload from this device or your photo library."
        error={errors.imageUrl?.[0]}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          label="Sort order"
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={offer?.sortOrder ?? 0}
          error={errors.sortOrder?.[0]}
        />
        <div className="flex flex-col justify-end gap-3 sm:col-span-2">
          <CheckboxField
            label="Active"
            name="active"
            defaultChecked={offer?.active ?? true}
            hint="Inactive options are hidden from the website."
          />
          <CheckboxField
            label="Featured"
            name="featured"
            defaultChecked={offer?.featured ?? false}
            hint="Featured options appear on the homepage."
          />
        </div>
      </div>

      <div className="flex gap-3 border-t border-[var(--color-line)] pt-6">
        <Button type="submit" loading={pending}>
          {offer ? "Save changes" : "Create coaching option"}
        </Button>
        <ButtonLink href="/admin/coaching" variant="secondary">
          Cancel
        </ButtonLink>
      </div>
    </form>
  );
}
