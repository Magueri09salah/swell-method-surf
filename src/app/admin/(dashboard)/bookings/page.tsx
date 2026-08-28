import Link from "next/link";
import { Search } from "lucide-react";
import { AdminHeading, Pagination, Td, Th, TableWrap } from "@/components/admin/ui";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { listBookings } from "@/server/services/booking";
import { bookingFilterSchema, BOOKING_STATUSES } from "@/lib/validation/booking";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_TONE,
  COACHING_FORMAT_LABELS,
  EXPERIENCE_LEVEL_LABELS,
} from "@/lib/constants";
import { formatRelative, formatShortDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;

  // Query params are untrusted input like any other — parsed, not read.
  const parsed = bookingFilterSchema.safeParse(raw);
  const filter = parsed.success ? parsed.data : { page: 1, sort: "newest" as const };

  const { items, total, page, pageCount } = await listBookings(filter);

  const buildHref = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { status: filter.status, q: filter.q, sort: filter.sort, ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value && value !== "newest") params.set(key, value);
    }
    const query = params.toString();
    return `/admin/bookings${query ? `?${query}` : ""}`;
  };

  return (
    <>
      <AdminHeading
        title="Bookings"
        description={`${total} ${total === 1 ? "request" : "requests"} in total.`}
      />

      <div className="mb-5 flex flex-col gap-4">
        <form method="get" role="search" className="flex gap-2">
          {filter.status && <input type="hidden" name="status" value={filter.status} />}
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--text-secondary)]"
            />
            <input
              type="search"
              name="q"
              defaultValue={filter.q ?? ""}
              placeholder="Search by name, email or reference"
              aria-label="Search bookings"
              className="h-11 w-full rounded-[4px] border border-[var(--color-line)] bg-[var(--surface-raised)] pl-10 pr-3.5 text-base transition-colors duration-200 hover:border-[var(--color-line-strong)] focus:border-[var(--color-ink)]"
            />
          </div>
          <button
            type="submit"
            className="h-11 shrink-0 cursor-pointer rounded-[4px] bg-[var(--color-ink)] px-5 text-[0.9375rem] font-semibold text-white transition-colors duration-200 hover:bg-[var(--interactive-hover)]"
          >
            Search
          </button>
        </form>

        <div className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
          {[undefined, ...BOOKING_STATUSES].map((status) => {
            const active = filter.status === status;
            return (
              <Link
                key={status ?? "ALL"}
                href={buildHref({ status, page: undefined })}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center rounded-[4px] border px-3.5 type-body-sm font-medium transition-colors duration-200",
                  active
                    ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                    : "border-[var(--color-line-strong)] hover:border-[var(--color-ink)]",
                )}
              >
                {status ? BOOKING_STATUS_LABELS[status] : "All"}
              </Link>
            );
          })}
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={filter.q || filter.status ? "No bookings match" : "No bookings yet"}
          description={
            filter.q || filter.status
              ? "Try clearing the search or choosing a different status."
              : "Requests sent through the website booking form will appear here."
          }
        />
      ) : (
        <>
          <TableWrap>
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Preferred date</Th>
                <Th>Format</Th>
                <Th>Level</Th>
                <Th>Party</Th>
                <Th>Status</Th>
                <Th>Received</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((booking) => (
                <tr key={booking.id} className="transition-colors hover:bg-[var(--surface-page)]">
                  <Td>
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="font-semibold text-[var(--color-ink)] underline-offset-4 hover:underline"
                    >
                      {booking.clientName}
                    </Link>
                    <span className="block type-caption text-[var(--text-secondary)]">
                      {booking.reference} · {booking.clientEmail}
                    </span>
                  </Td>
                  <Td data-numeric>
                    {formatShortDate(booking.preferredDate)}
                    {booking.preferredTime && (
                      <span className="block type-caption text-[var(--text-secondary)]">
                        {booking.preferredTime}
                      </span>
                    )}
                  </Td>
                  <Td>
                    {booking.packageTitle ??
                      booking.offerTitle ??
                      COACHING_FORMAT_LABELS[booking.requestedFormat]}
                    {booking.bookingType === "PACKAGE" && (
                      <span className="block type-caption text-[var(--text-secondary)]">
                        Package
                      </span>
                    )}
                  </Td>
                  <Td>{EXPERIENCE_LEVEL_LABELS[booking.experienceLevel]}</Td>
                  <Td data-numeric>{booking.participants}</Td>
                  <Td>
                    <Badge tone={BOOKING_STATUS_TONE[booking.status]}>
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </Badge>
                  </Td>
                  <Td className="text-[var(--text-secondary)]">
                    {formatRelative(booking.createdAt)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>

          <Pagination page={page} pageCount={pageCount} baseHref={buildHref({})} />
        </>
      )}
    </>
  );
}
