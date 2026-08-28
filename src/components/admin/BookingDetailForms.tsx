"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { ErrorBanner, SuccessBanner } from "@/components/ui/primitives";
import { addBookingNoteAction, updateBookingAction } from "@/server/actions/admin";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";
import type { ActionResult } from "@/server/services/types";
import type { BookingDetailDTO, CoachingOfferDTO } from "@/server/services/types";

/**
 * Booking management forms.
 *
 * Status options are filtered to those the server will actually accept, so the
 * UI cannot offer a transition that will be rejected. The server still
 * re-validates the transition — this is a usability filter, not the rule.
 */
const ALLOWED_NEXT: Record<BookingDetailDTO["status"], BookingDetailDTO["status"][]> = {
  PENDING: ["PENDING", "CONFIRMED", "CANCELLED", "REJECTED"],
  CONFIRMED: ["CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED"],
  COMPLETED: ["COMPLETED"],
  CANCELLED: ["CANCELLED"],
  REJECTED: ["REJECTED"],
};

export function BookingUpdateForm({
  booking,
  offers,
}: {
  booking: BookingDetailDTO;
  offers: CoachingOfferDTO[];
}) {
  const [state, formAction, pending] = useActionState<ActionResult<undefined> | null, FormData>(
    updateBookingAction,
    null,
  );

  const failed = state !== null && !state.ok;
  const terminal = ALLOWED_NEXT[booking.status].length === 1;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={booking.id} />

      {failed && <ErrorBanner>{state.error}</ErrorBanner>}
      {state?.ok && <SuccessBanner>Booking updated.</SuccessBanner>}

      {terminal && (
        <p className="type-body-sm text-[var(--text-secondary)]">
          This booking is {BOOKING_STATUS_LABELS[booking.status].toLowerCase()} and can no longer
          change status.
        </p>
      )}

      <SelectField
        label="Status"
        name="status"
        defaultValue={booking.status}
        disabled={terminal}
        options={ALLOWED_NEXT[booking.status].map((status) => ({
          value: status,
          label: BOOKING_STATUS_LABELS[status],
        }))}
      />

      <SelectField
        label="Coaching option"
        name="coachingOfferId"
        defaultValue={booking.coachingOfferId ?? ""}
        hint="Assigning an offer sets the quoted price automatically when you confirm."
        options={[
          { value: "", label: "Not assigned" },
          ...offers.map((offer) => ({ value: offer.id, label: offer.title })),
        ]}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Scheduled date and time"
          name="scheduledAt"
          type="datetime-local"
          defaultValue={booking.scheduledAt ? booking.scheduledAt.slice(0, 16) : ""}
          hint="Set this once you have agreed a time."
        />
        <TextField
          label={`Quoted price (${booking.currency})`}
          name="priceQuoted"
          type="number"
          min={0}
          step="1"
          defaultValue={booking.priceQuoted ?? ""}
          hint="Leave blank to take the price from the coaching option."
        />
      </div>

      <TextField
        label="Number of surfers"
        name="participants"
        type="number"
        min={1}
        max={8}
        defaultValue={booking.participants}
      />

      <Button type="submit" loading={pending} className="w-fit">
        Save changes
      </Button>
    </form>
  );
}

export function BookingNoteForm({ bookingId }: { bookingId: string }) {
  const [state, formAction, pending] = useActionState<ActionResult<undefined> | null, FormData>(
    addBookingNoteAction,
    null,
  );

  const failed = state !== null && !state.ok;

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="bookingId" value={bookingId} />

      {failed && <ErrorBanner>{state.error}</ErrorBanner>}

      <TextAreaField
        label="Add an internal note"
        name="body"
        rows={3}
        required
        hint="Private to you. Never shown to the client."
        error={failed ? state.fieldErrors?.body?.[0] : undefined}
      />

      <Button type="submit" size="sm" variant="secondary" loading={pending} className="w-fit">
        Add note
      </Button>
    </form>
  );
}
