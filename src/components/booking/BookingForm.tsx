"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarCheck, MessageCircle, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  CheckboxField,
  HoneypotField,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/ui/Field";
import { ErrorBanner, WaveRule } from "@/components/ui/primitives";
import { submitBookingRequest, type BookingSuccess } from "@/server/actions/public";
import {
  COACHING_FORMAT_LABELS,
  EXPERIENCE_LEVEL_LABELS,
} from "@/lib/constants";
import { cn, formatDuration, formatPrice } from "@/lib/utils";
import type { ActionResult } from "@/server/services/types";
import type { CoachingOfferDTO } from "@/server/services/types";
import type { PackageDTO } from "@/server/services/package";

/**
 * Booking request form.
 *
 * Design decisions worth stating:
 *  - ONE page, no wizard. A five-step flow for eleven fields is friction, not
 *    polish, and every extra step sheds conversions.
 *  - Server action + `useActionState`, so the form works with JS disabled and
 *    progressively enhances to inline errors.
 *  - Errors come back keyed by field from the SAME Zod schema the server used,
 *    so client and server can never disagree about what is valid.
 *  - On failure, focus moves to the first invalid field (WCAG 3.3.1) and a
 *    summary is announced.
 */

const initialState: ActionResult<BookingSuccess> | null = null;

const BOOKING_TYPE_OPTIONS = [
  {
    value: "SESSION" as const,
    title: "Single session",
    body: "One coached session — private, semi-private or a small group.",
  },
  {
    value: "PACKAGE" as const,
    title: "Multi-day package",
    body: "Several days together, with equipment and daily feedback included.",
  },
];

export function BookingForm({
  offers,
  packages,
  preselectedOfferId,
  preselectedPackageId,
  prefilledMessage,
}: {
  offers: CoachingOfferDTO[];
  packages: PackageDTO[];
  preselectedOfferId?: string;
  preselectedPackageId?: string;
  /** Pre-written when the visitor arrived from a package card. */
  prefilledMessage?: string;
}) {
  const [state, formAction, pending] = useActionState(submitBookingRequest, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const [selectedOffer, setSelectedOffer] = useState(preselectedOfferId ?? "");
  const [selectedPackage, setSelectedPackage] = useState(preselectedPackageId ?? "");

  /**
   * Which half of the form is showing.
   *
   * Starts on PACKAGE when the visitor arrived from a package card, so the
   * choice they already made on the previous page is not silently discarded.
   */
  const [bookingType, setBookingType] = useState<"SESSION" | "PACKAGE">(
    preselectedPackageId ? "PACKAGE" : "SESSION",
  );

  const canChoosePackage = packages.length > 0;
  const isPackage = canChoosePackage && bookingType === "PACKAGE";

  const failed = state !== null && !state.ok;
  const fieldErrors = failed ? (state.fieldErrors ?? {}) : {};

  // Move focus to the first invalid control so keyboard and screen-reader users
  // are taken to the problem rather than left to hunt for it.
  useEffect(() => {
    if (!failed) return;
    const firstKey = Object.keys(fieldErrors)[0];
    if (!firstKey || !formRef.current) return;

    const control = formRef.current.elements.namedItem(firstKey);
    if (control instanceof HTMLElement) control.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Move focus to the confirmation so the outcome is announced, not just shown.
  useEffect(() => {
    if (state?.ok) successRef.current?.focus();
  }, [state]);

  if (state?.ok) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="flex flex-col items-start gap-5 rounded-[8px] border border-[var(--color-line)] bg-[var(--surface-raised)] p-8 md:p-10"
      >
        <PartyPopper aria-hidden="true" className="size-8 text-[var(--text-tertiary)]" />

        <h2 className="type-h2 text-[var(--text-primary)]">Your request is in.</h2>

        <WaveRule />

        <p className="measure type-body-lg text-[var(--text-secondary)]">
          Your reference is{" "}
          <strong className="font-semibold text-[var(--text-primary)]">
            {state.data.reference}
          </strong>
          . I read every request personally and reply within about 24 hours — usually sooner,
          unless the swell is good.
        </p>

        <p className="measure type-body text-[var(--text-secondary)]">
          I will confirm the format, the time, and what the conditions are likely to be doing on
          your dates. Nothing is charged now.
        </p>

        {/* Your request is already saved. This just opens WhatsApp with it
            written out, which usually reaches me faster than email. */}
        {state.data.whatsappUrl && (
          <div className="flex w-full flex-col gap-2 rounded-[12px] bg-[var(--color-yellow)] p-5">
            <p className="type-body-sm text-[var(--text-on-accent)]">
              Want a faster reply? Send it on WhatsApp too — your request is already saved either
              way.
            </p>
            <a
              href={state.data.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 w-fit items-center gap-2 rounded-[9999px] bg-[var(--color-ink)] px-6 type-label text-white transition-colors duration-200 hover:bg-white hover:text-[var(--color-ink)]"
            >
              <MessageCircle aria-hidden="true" className="size-4" />
              Send on WhatsApp
            </a>
          </div>
        )}

        <Link
          href="/method"
          className="inline-flex h-11 items-center gap-2 rounded-[4px] border border-[var(--color-line-strong)] px-5 text-[0.9375rem] font-semibold transition-colors duration-200 hover:border-[var(--color-ink)]"
        >
          Read the method while you wait
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    );
  }

  const offerOptions = [
    { value: "", label: "No preference — recommend one for me" },
    ...offers.map((offer) => ({
      value: offer.id,
      label: `${offer.title} · ${formatDuration(offer.durationMinutes)} · ${formatPrice(offer.price, offer.currency)}`,
    })),
  ];

  const packageOptions = [
    { value: "", label: "Choose a package…" },
    ...packages.map((pkg) => ({
      value: pkg.id,
      label: `${pkg.title} · ${formatPrice(pkg.price, pkg.currency)} per person`,
    })),
  ];

  const chosenPackage = packages.find((item) => item.id === selectedPackage);

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-6">
      {failed && <ErrorBanner>{state.error}</ErrorBanner>}

      <HoneypotField />

      {canChoosePackage ? (
        <fieldset className="flex flex-col gap-3 border-0 p-0">
          <legend className="type-label mb-1 text-[var(--text-tertiary)]">
            What are you booking?
          </legend>

          {/* Radio inputs rather than two buttons: arrow keys move between the
              options, the current choice is announced, and the whole thing
              still submits with JavaScript disabled. */}
          <div className="grid gap-3 sm:grid-cols-2">
            {BOOKING_TYPE_OPTIONS.map((option) => {
              const active = bookingType === option.value;
              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer flex-col gap-1 rounded-[12px] border p-4 transition-colors duration-200",
                    active
                      ? "border-[var(--color-ink)] bg-[var(--color-yellow)]"
                      : "border-[var(--color-line)] bg-[var(--surface-raised)] hover:border-[var(--color-line-strong)]",
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="bookingType"
                      value={option.value}
                      checked={active}
                      onChange={() => setBookingType(option.value)}
                      className="size-4 shrink-0 accent-[var(--color-ink)]"
                    />
                    <span className="type-h3">{option.title}</span>
                  </span>
                  <span
                    className={cn(
                      "type-caption pl-[1.625rem]",
                      active ? "text-[rgba(20,20,20,0.72)]" : "text-[var(--text-secondary)]",
                    )}
                  >
                    {option.body}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : (
        // No packages on sale: a switch with one real option is just a
        // confusing control, so it is omitted and the value sent directly.
        <input type="hidden" name="bookingType" value="SESSION" />
      )}

      <fieldset className="flex flex-col gap-5 border-0 p-0">
        <legend className="type-label mb-1 text-[var(--text-tertiary)]">About you</legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Your name"
            name="name"
            required
            autoComplete="name"
            hint="Your name"
            error={fieldErrors.name?.[0]}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            required
            inputMode="email"
            autoComplete="email"
            hint="Where I will send the confirmation."
            error={fieldErrors.email?.[0]}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Phone or WhatsApp"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            hint="Optional, but it is the fastest way to reach you about conditions."
            error={fieldErrors.phone?.[0]}
          />
          <TextField
            label="Country"
            name="country"
            autoComplete="country-name"
            hint="Optional, but it helps me understand your surfing background."
            error={fieldErrors.country?.[0]}
          />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-5 border-0 p-0">
        <legend className="type-label mb-1 text-[var(--text-tertiary)]">Your surfing</legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Experience level"
            name="experienceLevel"
            required
            defaultValue="FIRST_TIME"
            hint="First time is a perfectly good answer."
            error={fieldErrors.experienceLevel?.[0]}
            options={Object.entries(EXPERIENCE_LEVEL_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
          {/* Format applies to a single session only — a package already defines
              how it runs. Hidden rather than disabled, so assistive tech is not
              read an irrelevant control. */}
          {isPackage ? (
            <input type="hidden" name="coachingFormat" value="NOT_SURE" />
          ) : (
            <SelectField
              label="Coaching format"
              name="coachingFormat"
              required
              defaultValue="NOT_SURE"
              hint="Not sure is a perfectly good answer."
              error={fieldErrors.coachingFormat?.[0]}
              options={Object.entries(COACHING_FORMAT_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          )}
        </div>

        {isPackage ? (
          <SelectField
            label="Package"
            name="packageId"
            required
            value={selectedPackage}
            onChange={(event) => setSelectedPackage(event.target.value)}
            hint="Everything listed on the package is included."
            error={fieldErrors.packageId?.[0]}
            options={packageOptions}
          />
        ) : (
          offers.length > 0 && (
            <SelectField
              label="Coaching option"
              name="coachingOfferId"
              value={selectedOffer}
              onChange={(event) => setSelectedOffer(event.target.value)}
              hint="Pick one if you already know, or leave it to me."
              error={fieldErrors.coachingOfferId?.[0]}
              options={offerOptions}
            />
          )
        )}

        {/* Echo what the chosen package contains, so nobody has to go back to
            the previous page to check what they are asking for. */}
        {isPackage && chosenPackage && chosenPackage.features.length > 0 && (
          <div className="rounded-[12px] bg-[var(--surface-soft)] p-5">
            <p className="type-label mb-2 text-[var(--text-tertiary)]">
              {chosenPackage.title} includes
            </p>
            <ul className="flex flex-col gap-1.5">
              {chosenPackage.features.map((feature) => (
                <li key={feature} className="type-body-sm flex gap-2.5 text-[var(--text-secondary)]">
                  <span
                    aria-hidden="true"
                    className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-[var(--color-ink)]"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-5 border-0 p-0">
        <legend className="type-label mb-1 text-[var(--text-tertiary)]">When</legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Preferred date"
            name="preferredDate"
            type="date"
            required
            error={fieldErrors.preferredDate?.[0]}
          />
          <TextField
            label="How many surfers"
            name="participants"
            type="number"
            min={1}
            max={8}
            defaultValue={1}
            required
            inputMode="numeric"
            error={fieldErrors.participants?.[0]}
          />
        </div>
      </fieldset>

      <TextAreaField
        label="Anything else I should know"
        name="message"
        rows={5}
        defaultValue={prefilledMessage}
        hint="Injuries, nerves, what you are hoping to work on, mixed levels in your group — all useful."
        error={fieldErrors.message?.[0]}
      />

      <CheckboxField
        label="I understand this is a request, not a confirmed booking."
        hint="Nothing is charged now. I will confirm by email once I have checked the dates and conditions."
        name="acknowledged"
        required
        error={fieldErrors.acknowledged?.[0]}
      />

      <div className="flex flex-col gap-3 border-t border-[var(--color-line)] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="type-caption text-[var(--text-secondary)]">
          I reply to every request within about 24 hours.
        </p>

        <Button type="submit" size="lg" loading={pending} className="w-full sm:w-auto">
          <CalendarCheck aria-hidden="true" className="size-4" />
          Send booking request
        </Button>
      </div>
    </form>
  );
}
