import { notFound } from "next/navigation";
import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { AdminHeading, Panel } from "@/components/admin/ui";
import { Badge } from "@/components/ui/primitives";
import { BookingNoteForm, BookingUpdateForm } from "@/components/admin/BookingDetailForms";
import { getBookingById } from "@/server/services/booking";
import { getActiveOffers } from "@/server/services/coaching";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_TONE,
  COACHING_FORMAT_LABELS,
  EXPERIENCE_LEVEL_LABELS,
} from "@/lib/constants";
import { formatDate, formatDateTime, formatPrice, whatsappHref } from "@/lib/utils";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [booking, offers] = await Promise.all([getBookingById(id), getActiveOffers()]);

  if (!booking) notFound();

  const contactRows = [
    { icon: Mail, label: booking.clientEmail, href: `mailto:${booking.clientEmail}` },
    booking.clientPhone && {
      icon: Phone,
      label: booking.clientPhone,
      href: `tel:${booking.clientPhone}`,
    },
    booking.clientWhatsapp && {
      icon: MessageCircle,
      label: `WhatsApp ${booking.clientWhatsapp}`,
      href: whatsappHref(
        booking.clientWhatsapp,
        `Hi ${booking.clientName}, thanks for your surf coaching request (${booking.reference}).`,
      ),
      external: true,
    },
  ].filter(Boolean) as { icon: typeof Mail; label: string; href: string; external?: boolean }[];

  return (
    <>
      <AdminHeading
        back={{ href: "/admin/bookings", label: "All bookings" }}
        title={booking.clientName}
        description={`Reference ${booking.reference}`}
        action={
          <Badge tone={BOOKING_STATUS_TONE[booking.status]}>
            {BOOKING_STATUS_LABELS[booking.status]}
          </Badge>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="The request">
            <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {[
                { term: "Preferred date", value: formatDate(booking.preferredDate) },
                {
                  term: "Booking type",
                  value: booking.bookingType === "PACKAGE" ? "Multi-day package" : "Single session",
                },
                {
                  term: booking.bookingType === "PACKAGE" ? "Package" : "Format requested",
                  value:
                    booking.bookingType === "PACKAGE"
                      ? (booking.packageTitle ?? "No longer available")
                      : COACHING_FORMAT_LABELS[booking.requestedFormat],
                },
                {
                  term: "Experience level",
                  value: EXPERIENCE_LEVEL_LABELS[booking.experienceLevel],
                },
                { term: "Number of surfers", value: String(booking.participants) },
                { term: "Coaching assigned", value: booking.offerTitle ?? "Not assigned" },
                {
                  term: "Quoted",
                  value:
                    booking.priceQuoted === null
                      ? "Not quoted"
                      : formatPrice(booking.priceQuoted, booking.currency),
                },
                {
                  term: "Scheduled",
                  value: booking.scheduledAt
                    ? formatDateTime(booking.scheduledAt)
                    : "Not scheduled",
                },
                { term: "Received", value: formatDateTime(booking.createdAt) },
                { term: "Country", value: booking.clientCountry ?? "Not given" },
              ]
                // Kept for bookings taken before the field was removed from
                // the form; new ones simply do not have one.
                .concat(
                  booking.preferredTime
                    ? [{ term: "Preferred time", value: booking.preferredTime }]
                    : [],
                )
                .map((row) => (
                  <div key={row.term} className="flex flex-col gap-0.5">
                    <dt className="type-label text-[var(--text-secondary)]">{row.term}</dt>
                    <dd data-numeric className="type-body-sm font-medium">
                      {row.value}
                    </dd>
                  </div>
                ))}
            </dl>

            {booking.message && (
              <div className="mt-6 border-t border-[var(--color-line)] pt-5">
                <p className="type-label mb-2 text-[var(--text-secondary)]">Their message</p>
                <p className="measure whitespace-pre-wrap type-body-sm text-[var(--text-primary)]">
                  {booking.message}
                </p>
              </div>
            )}
          </Panel>

          <Panel title="Manage this booking">
            <BookingUpdateForm booking={booking} offers={offers} />
          </Panel>

          <Panel title="Internal notes">
            <BookingNoteForm bookingId={booking.id} />

            {booking.notes.length > 0 && (
              <ul className="mt-6 flex flex-col divide-y divide-[var(--color-line-subtle)] border-t border-[var(--color-line)]">
                {booking.notes.map((note) => (
                  <li key={note.id} className="flex flex-col gap-1 py-3">
                    <p className="whitespace-pre-wrap type-body-sm">{note.body}</p>
                    <p className="type-caption text-[var(--text-secondary)]">
                      {note.authorName ?? "Unknown"} · {formatDateTime(note.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="Contact">
            <ul className="flex flex-col gap-3">
              {contactRows.map((row) => (
                <li key={row.href}>
                  <a
                    href={row.href}
                    {...(row.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="flex min-h-11 items-center gap-2.5 break-all type-body-sm text-[var(--color-ink)] underline-offset-4 hover:underline"
                  >
                    <row.icon aria-hidden="true" className="size-4 shrink-0" />
                    {row.label}
                  </a>
                </li>
              ))}
            </ul>

            <Link
              href={`/admin/clients/${booking.clientId}`}
              className="mt-4 inline-flex h-11 items-center rounded-[4px] border border-[var(--color-line-strong)] px-4 type-body-sm font-semibold transition-colors duration-200 hover:border-[var(--color-ink)]"
            >
              View client record
            </Link>
          </Panel>
        </div>
      </div>
    </>
  );
}
