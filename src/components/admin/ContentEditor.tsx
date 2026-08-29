"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextAreaField, TextField } from "@/components/ui/Field";
import { ErrorBanner, SuccessBanner } from "@/components/ui/primitives";
import { ImagePicker } from "./ImagePicker";
import { saveContentAction } from "@/server/actions/admin";
import type { ActionResult } from "@/server/services/types";
import type { ContentKey } from "@/lib/validation/content";

/**
 * Typed content editor (docs/DECISIONS.md D-011).
 *
 * NOT a block builder. Each content key gets purpose-built fields, so the coach
 * edits real copy and cannot break the layout.
 *
 * The whole payload is serialised into one hidden `__payload` field as JSON,
 * which keeps repeatable groups (pillars, blocks) simple and keeps the server
 * action's contract to two fields regardless of shape. The server re-validates
 * the parsed JSON against the schema for that key.
 */

type Primitive = string;
type Repeatable = Record<string, Primitive>;

type ContentValue = Record<string, Primitive | Repeatable[]>;

const FIELD_LABELS: Record<string, string> = {
  eyebrow: "Eyebrow",
  title: "Title",
  subtitle: "Subtitle",
  intro: "Introduction",
  body: "Body",
  quote: "Pull quote",
  signature: "Signature",
  objective: "Goal",
  id: "Identifier",
  ctaLabel: "Button label",
  ctaHref: "Button link",
  primaryCtaLabel: "Primary button label",
  primaryCtaHref: "Primary button link",
  secondaryCtaLabel: "Secondary button label",
  secondaryCtaHref: "Secondary button link",
  imageUrl: "Section photograph",
  imageAlt: "Image alt text",
};

/**
 * Fields rendered with the image picker rather than a text box.
 *
 * Keyed by name so any section that later gains an `imageUrl` gets the picker
 * for free — no change needed here.
 */
const IMAGE_FIELDS = new Set(["imageUrl"]);
/** Rendered alongside its image, not as a separate input. */
const IMAGE_ALT_FIELDS = new Set(["imageAlt"]);

const LONG_FIELDS = new Set(["body", "intro", "subtitle", "quote"]);

function label(key: string): string {
  return FIELD_LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

export function ContentEditor({
  contentKey,
  title,
  initial,
}: {
  contentKey: ContentKey;
  title: string;
  initial: ContentValue;
}) {
  const [state, formAction, pending] = useActionState<ActionResult<undefined> | null, FormData>(
    saveContentAction,
    null,
  );

  const [value, setValue] = useState<ContentValue>(initial);

  const failed = state !== null && !state.ok;

  const setField = (key: string, next: Primitive) =>
    setValue((current) => ({ ...current, [key]: next }));

  const setRepeatable = (key: string, index: number, field: string, next: Primitive) =>
    setValue((current) => {
      const list = [...((current[key] as Repeatable[]) ?? [])];
      const item = list[index];
      if (!item) return current;
      list[index] = { ...item, [field]: next };
      return { ...current, [key]: list };
    });

  const addItem = (key: string, template: Repeatable) =>
    setValue((current) => ({
      ...current,
      [key]: [...((current[key] as Repeatable[]) ?? []), template],
    }));

  const removeItem = (key: string, index: number) =>
    setValue((current) => ({
      ...current,
      [key]: ((current[key] as Repeatable[]) ?? []).filter((_, i) => i !== index),
    }));

  const scalarKeys = Object.keys(value).filter((key) => typeof value[key] === "string");
  const listKeys = Object.keys(value).filter((key) => Array.isArray(value[key]));

  return (
    <form action={formAction} className="flex max-w-[52rem] flex-col gap-6">
      <input type="hidden" name="__key" value={contentKey} />
      <input type="hidden" name="__payload" value={JSON.stringify(value)} />

      {failed && <ErrorBanner>{state.error}</ErrorBanner>}
      {state?.ok && <SuccessBanner>Saved. The website is already showing your changes.</SuccessBanner>}

      <div className="flex flex-col gap-5">
        {scalarKeys.map((key) => {
          const current = value[key] as string;

          // The alt text is captured by the picker itself.
          if (IMAGE_ALT_FIELDS.has(key)) return null;

          if (IMAGE_FIELDS.has(key)) {
            return (
              <ImagePicker
                key={key}
                label={label(key)}
                value={current}
                onChange={(url) => setField(key, url)}
                altText={(value.imageAlt as string) ?? ""}
                onAltTextChange={(alt) => setField("imageAlt", alt)}
                showUrlInput={false}
                hint="Upload from this device, or reuse one you have already uploaded. Leave empty to keep the photograph the site ships with."
              />
            );
          }

          return LONG_FIELDS.has(key) ? (
            <TextAreaField
              key={key}
              label={label(key)}
              rows={key === "body" ? 10 : 4}
              value={current}
              onChange={(event) => setField(key, event.target.value)}
              hint={key === "body" ? "Leave a blank line between paragraphs." : undefined}
            />
          ) : (
            <TextField
              key={key}
              label={label(key)}
              value={current}
              onChange={(event) => setField(key, event.target.value)}
            />
          );
        })}
      </div>

      {listKeys.map((key) => {
        const list = (value[key] as Repeatable[]) ?? [];
        const template = list[0]
          ? Object.fromEntries(Object.keys(list[0]).map((field) => [field, ""]))
          : { title: "", body: "" };

        return (
          <fieldset key={key} className="flex flex-col gap-4 border-0 p-0">
            <legend className="type-label mb-1 text-[var(--text-tertiary)]">{label(key)}</legend>

            {list.map((item, index) => (
              <div
                key={index}
                className="flex flex-col gap-4 rounded-[8px] border border-[var(--color-line)] bg-[var(--surface-page)] p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="type-caption font-semibold text-[var(--text-secondary)]">
                    {index + 1}. {item.title || "Untitled"}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(key, index)}
                    aria-label={`Remove ${item.title || `item ${index + 1}`}`}
                    className="grid size-11 cursor-pointer place-items-center rounded-[4px] text-[var(--color-danger)] transition-colors duration-200 hover:bg-[rgba(179,38,30,0.10)]"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </button>
                </div>

                {Object.keys(item).map((field) =>
                  LONG_FIELDS.has(field) || field === "body" ? (
                    <TextAreaField
                      key={field}
                      label={label(field)}
                      rows={4}
                      value={item[field] ?? ""}
                      onChange={(event) => setRepeatable(key, index, field, event.target.value)}
                    />
                  ) : (
                    <TextField
                      key={field}
                      label={label(field)}
                      value={item[field] ?? ""}
                      onChange={(event) => setRepeatable(key, index, field, event.target.value)}
                    />
                  ),
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-fit"
              onClick={() => addItem(key, template)}
            >
              <Plus aria-hidden="true" className="size-3.5" />
              Add {label(key).toLowerCase().replace(/s$/, "")}
            </Button>
          </fieldset>
        );
      })}

      <div className="flex gap-3 border-t border-[var(--color-line)] pt-6">
        <Button type="submit" loading={pending}>
          Save {title.toLowerCase()}
        </Button>
        <ButtonLink href="/admin/content" variant="secondary">
          Back
        </ButtonLink>
      </div>
    </form>
  );
}
