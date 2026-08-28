"use client";

import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Destructive submit button with a confirmation step.
 *
 * Uses `useFormStatus` so it disables itself and shows progress during the
 * server action, preventing double submission.
 *
 * `window.confirm` is intentional: it is fully accessible, cannot be styled
 * into ambiguity, and is unmissable. A prettier custom dialog for "delete this
 * permanently" is a downgrade in clarity.
 */
export function ConfirmSubmit({
  message,
  label = "Delete",
  iconOnly = false,
  className,
}: {
  message: string;
  label?: string;
  iconOnly?: boolean;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={iconOnly ? label : undefined}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-[4px] font-semibold transition-colors duration-200",
        "text-[var(--color-danger)] hover:bg-[rgba(179,38,30,0.10)]",
        "disabled:cursor-not-allowed disabled:opacity-45",
        iconOnly ? "size-11" : "h-11 px-3 type-body-sm",
        className,
      )}
    >
      <Trash2 aria-hidden="true" className="size-4" />
      {!iconOnly && (pending ? "Deleting…" : label)}
    </button>
  );
}

/** Non-destructive inline submit (toggles, reorder) with pending state. */
export function InlineSubmit({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={label}
      className={cn(
        "inline-flex size-11 cursor-pointer items-center justify-center rounded-[4px] transition-colors duration-200",
        "text-[var(--text-secondary)] hover:bg-[var(--color-line-subtle)] hover:text-[var(--color-ink)]",
        "disabled:cursor-not-allowed disabled:opacity-45",
        className,
      )}
    >
      {children}
    </button>
  );
}
