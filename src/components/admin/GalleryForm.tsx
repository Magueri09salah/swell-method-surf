"use client";

import { useActionState, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CheckboxField, SelectField, TextField } from "@/components/ui/Field";
import { ImagePicker } from "./ImagePicker";
import { ErrorBanner } from "@/components/ui/primitives";
import { saveGalleryImage } from "@/server/actions/admin";
import { GALLERY_CATEGORY_LABELS } from "@/lib/constants";
import type { ActionResult, GalleryImageDTO } from "@/server/services/types";

export function GalleryForm({ image }: { image?: GalleryImageDTO }) {
  const [state, formAction, pending] = useActionState<ActionResult<undefined> | null, FormData>(
    saveGalleryImage,
    null,
  );

  const failed = state !== null && !state.ok;
  const errors = failed ? (state.fieldErrors ?? {}) : {};

  const [url, setUrl] = useState(image?.imageUrl ?? "");
  const [alt, setAlt] = useState(image?.altText ?? "");

  return (
    <form action={formAction} className="flex max-w-[46rem] flex-col gap-6">
      {image && <input type="hidden" name="id" value={image.id} />}

      {failed && <ErrorBanner>{state.error}</ErrorBanner>}

      {/* Hidden inputs carry the picker's values into the normal form POST, so
          the server action contract is unchanged and the form still submits
          without JavaScript-driven state plumbing. */}
      <input type="hidden" name="imageUrl" value={url} />
      <input type="hidden" name="altText" value={alt} />

      <ImagePicker
        label="Photograph"
        required
        value={url}
        onChange={setUrl}
        altText={alt}
        onAltTextChange={setAlt}
        hint="Upload from this device or your photo library, pick one you have already uploaded, or paste a link."
        error={errors.imageUrl?.[0] ?? errors.altText?.[0]}
      />

      <TextField
        label="Title"
        name="title"
        required
        defaultValue={image?.title}
        error={errors.title?.[0]}
      />

      <TextField
        label="Caption"
        name="caption"
        defaultValue={image?.caption ?? ""}
        hint="Optional. Shown under the image in the lightbox."
        error={errors.caption?.[0]}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <SelectField
          label="Category"
          name="category"
          defaultValue={image?.category ?? "SURF"}
          options={Object.entries(GALLERY_CATEGORY_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
          error={errors.category?.[0]}
        />
        <TextField
          label="Width (px)"
          name="width"
          type="number"
          min={1}
          defaultValue={image?.width ?? ""}
          hint="Optional. Helps prevent layout shift."
          error={errors.width?.[0]}
        />
        <TextField
          label="Height (px)"
          name="height"
          type="number"
          min={1}
          defaultValue={image?.height ?? ""}
          error={errors.height?.[0]}
        />
        <TextField
          label="Sort order"
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={image?.sortOrder ?? 0}
          error={errors.sortOrder?.[0]}
        />
      </div>

      <div className="flex flex-col gap-3">
        <CheckboxField
          label="Published"
          name="published"
          defaultChecked={image?.published ?? true}
        />
        <CheckboxField
          label="Featured"
          name="featured"
          defaultChecked={image?.featured ?? false}
          hint="Featured images are preferred for the homepage preview."
        />
      </div>

      <div className="flex gap-3 border-t border-[var(--color-line)] pt-6">
        <Button type="submit" loading={pending}>
          {image ? "Save changes" : "Add image"}
        </Button>
        <ButtonLink href="/admin/gallery" variant="secondary">
          Cancel
        </ButtonLink>
      </div>
    </form>
  );
}
