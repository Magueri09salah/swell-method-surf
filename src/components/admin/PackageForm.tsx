"use client";

import { useActionState, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CheckboxField, TextAreaField, TextField } from "@/components/ui/Field";
import { ErrorBanner } from "@/components/ui/primitives";
import { ImagePicker } from "./ImagePicker";
import { savePackage } from "@/server/actions/admin";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/server/services/types";
import type { PackageDTO } from "@/server/services/package";

/**
 * Package editor, matching the "Our Packages" cards.
 *
 * The image is decorative here — the title, feature list and price beside it
 * carry the meaning — so the picker runs without an alt-text field and the card
 * renders `alt=""`. See ImagePicker's `showAltText` note.
 */
export function PackageForm({ pkg }: { pkg?: PackageDTO }) {
  const [state, formAction, pending] = useActionState<ActionResult<undefined> | null, FormData>(
    savePackage,
    null,
  );

  const failed = state !== null && !state.ok;
  const errors = failed ? (state.fieldErrors ?? {}) : {};

  // Slug auto-fills while creating, never after — changing a live slug breaks
  // inbound links.
  const [title, setTitle] = useState(pkg?.title ?? "");
  const [slug, setSlug] = useState(pkg?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(pkg));

  const [imageUrl, setImageUrl] = useState(pkg?.imageUrl ?? "");

  return (
    <form action={formAction} className="flex max-w-[48rem] flex-col gap-6">
      {pkg && <input type="hidden" name="id" value={pkg.id} />}

      {failed && <ErrorBanner>{state.error}</ErrorBanner>}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Package title"
          name="title"
          required
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (!slugTouched) setSlug(slugify(event.target.value));
          }}
          hint="For example: 5 Days Package"
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

      <div className="grid gap-5 sm:grid-cols-3">
        <TextField
          label="Days"
          name="days"
          type="number"
          min={1}
          max={60}
          required
          defaultValue={pkg?.days ?? 3}
          hint="Used for ordering."
          error={errors.days?.[0]}
        />
        <TextField
          label="Price per person"
          name="price"
          type="number"
          min={0}
          step="1"
          required
          defaultValue={pkg?.price ?? 0}
          error={errors.price?.[0]}
        />
        <TextField
          label="Currency"
          name="currency"
          required
          maxLength={3}
          defaultValue={pkg?.currency ?? "EUR"}
          hint="Three-letter code."
          error={errors.currency?.[0]}
        />
      </div>

      <TextAreaField
        label="What's included"
        name="features"
        rows={7}
        required
        defaultValue={pkg?.features.join("\n")}
        hint="One item per line. These become the bullet list on the card — for example: 5 Surf sessions (2h daily coaching)"
        error={errors.features?.[0]}
      />

      <input type="hidden" name="imageUrl" value={imageUrl} />

      <ImagePicker
        label="Package photograph"
        value={imageUrl}
        onChange={setImageUrl}
        altText=""
        onAltTextChange={() => {}}
        showAltText={false}
        showLibrary={false}
        showUrlInput={false}
        uploadAltFallback={title || "Package photograph"}
        hint="Upload from this device or your photo library."
        error={errors.imageUrl?.[0]}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          label="Sort order"
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={pkg?.sortOrder ?? 0}
          error={errors.sortOrder?.[0]}
        />
        <div className="flex flex-col justify-end gap-3 sm:col-span-2">
          <CheckboxField
            label="Active"
            name="active"
            defaultChecked={pkg?.active ?? true}
            hint="Inactive packages are hidden from the website."
          />
          <CheckboxField
            label="Featured"
            name="featured"
            defaultChecked={pkg?.featured ?? false}
            hint="Featured packages are highlighted on the card."
          />
        </div>
      </div>

      <div className="flex gap-3 border-t border-[var(--color-line)] pt-6">
        <Button type="submit" loading={pending}>
          {pkg ? "Save changes" : "Create package"}
        </Button>
        <ButtonLink href="/admin/packages" variant="secondary">
          Cancel
        </ButtonLink>
      </div>
    </form>
  );
}
