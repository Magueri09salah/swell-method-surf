"use client";

import { useId, type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Form primitives.
 *
 * Accessibility contract enforced by construction (DESIGN_SYSTEM.md §10):
 *   - a visible <label>, never placeholder-only
 *   - helper text persists; it does not vanish on focus
 *   - errors render BELOW the field, with an icon (never colour alone)
 *   - aria-describedby wires helper + error; aria-invalid marks the field
 *   - role="alert" announces the error to assistive technology
 *   - 44px minimum height and 16px text (prevents iOS auto-zoom)
 */

const controlBase =
  "w-full min-h-11 rounded-[4px] border bg-[var(--surface-raised)] px-3.5 py-2.5 " +
  "text-base text-[var(--text-primary)] placeholder:text-[color-mix(in_srgb,var(--text-secondary)_65%,transparent)] " +
  "transition-[border-color,box-shadow] duration-200 " +
  "disabled:opacity-45 disabled:cursor-not-allowed";

const controlState = (hasError: boolean) =>
  hasError
    ? "border-[var(--color-danger)] focus:border-[var(--color-danger)]"
    : "border-[var(--color-line)] hover:border-[var(--color-line-strong)] focus:border-[var(--color-ink)]";

type FieldShellProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (aria: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
  className?: string;
};

function FieldShell({ id, label, hint, error, required, children, className }: FieldShellProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="type-caption font-semibold text-[var(--text-primary)]">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="ml-1 text-[var(--color-danger)]">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>

      {hint && (
        <p id={hintId} className="type-caption text-[var(--text-secondary)]">
          {hint}
        </p>
      )}

      {children({ id, describedBy, invalid: Boolean(error) })}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="type-caption flex items-start gap-1.5 font-medium text-[var(--color-danger)]"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

type BaseFieldProps = {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
};

export function TextField({
  label,
  hint,
  error,
  className,
  required,
  ...props
}: BaseFieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "className">) {
  const generatedId = useId();
  const id = props.id ?? generatedId;

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      {({ describedBy, invalid }) => (
        <input
          {...props}
          id={id}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={cn(controlBase, controlState(invalid))}
        />
      )}
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  className,
  required,
  rows = 5,
  ...props
}: BaseFieldProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className">) {
  const generatedId = useId();
  const id = props.id ?? generatedId;

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      {({ describedBy, invalid }) => (
        <textarea
          {...props}
          id={id}
          rows={rows}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={cn(controlBase, controlState(invalid), "resize-y leading-relaxed")}
        />
      )}
    </FieldShell>
  );
}

/**
 * Native <select> by design (D-008): the system picker is better on mobile,
 * accessible for free, and needs no JavaScript.
 */
export function SelectField({
  label,
  hint,
  error,
  className,
  required,
  options,
  ...props
}: BaseFieldProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "className" | "children"> & {
    options: { value: string; label: string }[];
  }) {
  const generatedId = useId();
  const id = props.id ?? generatedId;

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={className}
    >
      {({ describedBy, invalid }) => (
        <select
          {...props}
          id={id}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={cn(controlBase, controlState(invalid), "cursor-pointer")}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

export function CheckboxField({
  label,
  hint,
  error,
  className,
  ...props
}: BaseFieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type">) {
  const generatedId = useId();
  const id = props.id ?? generatedId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-start gap-3">
        <input
          {...props}
          type="checkbox"
          id={id}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={cn(
            "mt-0.5 size-5 shrink-0 cursor-pointer rounded-[3px] border accent-[var(--color-ink)]",
            error ? "border-[var(--color-danger)]" : "border-[var(--color-line-strong)]",
          )}
        />
        <div className="flex flex-col gap-0.5">
          <label htmlFor={id} className="type-body-sm cursor-pointer font-medium">
            {label}
          </label>
          {hint && (
            <p id={hintId} className="type-caption text-[var(--text-secondary)]">
              {hint}
            </p>
          )}
        </div>
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="type-caption flex items-start gap-1.5 font-medium text-[var(--color-danger)]"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

/** Honeypot. Hidden from humans and assistive tech; bots fill it and are caught. */
export function HoneypotField() {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] size-px overflow-hidden">
      <label htmlFor="website">Website</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
