import Link from "next/link";
import { ArrowRight, ImagePlus, Package, Plus } from "lucide-react";
import { AdminHeading, Panel, StatCard, Td, Th, TableWrap } from "@/components/admin/ui";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { getDashboardData } from "@/server/services/dashboard";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_TONE,
  EXPERIENCE_LEVEL_LABELS,
} from "@/lib/constants";
import { formatPrice, formatRelative, formatShortDate } from "@/lib/utils";

/**
 * Dashboard.
 *
 * Answers the five questions from the brief (§45) and stops. No charts — a
 * single coach with a handful of bookings a week gains nothing from a sparkline
 * and loses the thing that matters: what needs attention today.
 */
export default async function AdminDashboard() {
  const data = await getDashboardData();

  return (
    <>
      <AdminHeading
        title="Dashboard"
        description="What needs your attention, and what is coming up."
        action={
          <ButtonLink href="/admin/bookings?status=PENDING" size="sm">
            Review requests
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="New requests"
          value={data.pendingCount}
          hint={data.pendingCount > 0 ? "Waiting on your reply" : "Nothing waiting"}
          href="/admin/bookings?status=PENDING"
          tone="attention"
        />
        <StatCard
          label="Confirmed"
          value={data.confirmedCount}
          hint="Booked in"
          href="/admin/bookings?status=CONFIRMED"
        />
        <StatCard
          label="Upcoming sessions"
          value={data.upcomingCount}
          hint="Confirmed, still ahead"
        />
        <StatCard label="Clients" value={data.clientCount} hint="All time" href="/admin/clients" />
      </div>

      {data.monthRevenue && data.monthRevenue.amount > 0 && (
        <div className="mt-4 rounded-[8px] border border-[var(--color-line)] bg-[var(--surface-raised)] p-5">
          <p className="type-label text-[var(--text-secondary)]">Quoted this month</p>
          <p data-numeric className="mt-1.5 font-display text-4xl text-[var(--text-primary)]">
            {formatPrice(data.monthRevenue.amount, data.monthRevenue.currency)}
          </p>
          <p className="mt-1 type-caption text-[var(--text-secondary)]">
            Confirmed and completed sessions dated this month. Quoted, not collected.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel
          title="Recent requests"
          action={
            <Link
              href="/admin/bookings"
              className="type-caption font-semibold text-[var(--color-ink)] underline-offset-4 hover:underline"
            >
              View all
            </Link>
          }
          className="min-w-0"
        >
          {data.recentInquiries.length === 0 ? (
            <EmptyState
              title="No requests yet"
              description="Booking requests from the website will land here as soon as they arrive."
            />
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Client</Th>
                  <Th>Requested</Th>
                  <Th>Level</Th>
                  <Th>Status</Th>
                  <Th>Received</Th>
                </tr>
              </thead>
              <tbody>
                {data.recentInquiries.map((booking) => (
                  <tr key={booking.id} className="transition-colors hover:bg-[var(--surface-page)]">
                    <Td>
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="font-semibold text-[var(--color-ink)] underline-offset-4 hover:underline"
                      >
                        {booking.clientName}
                      </Link>
                      <span className="block type-caption text-[var(--text-secondary)]">
                        {booking.reference}
                      </span>
                    </Td>
                    <Td>
                      {formatShortDate(booking.preferredDate)}
                      <span className="block type-caption text-[var(--text-secondary)]">
                        {booking.participants}{" "}
                        {booking.participants === 1 ? "surfer" : "surfers"}
                      </span>
                    </Td>
                    <Td>{EXPERIENCE_LEVEL_LABELS[booking.experienceLevel]}</Td>
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
          )}
        </Panel>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="Upcoming sessions">
            {data.upcomingSessions.length === 0 ? (
              <p className="type-body-sm text-[var(--text-secondary)]">
                Nothing confirmed yet. Confirmed bookings appear here in date order.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-[var(--color-line-subtle)]">
                {data.upcomingSessions.map((session) => (
                  <li key={session.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <Link
                        href={`/admin/bookings/${session.id}`}
                        className="type-body-sm font-semibold text-[var(--color-ink)] underline-offset-4 hover:underline"
                      >
                        {session.clientName}
                      </Link>
                      <p className="truncate type-caption text-[var(--text-secondary)]">
                        {session.offerTitle ?? "Format not set"} · {session.participants}{" "}
                        {session.participants === 1 ? "surfer" : "surfers"}
                      </p>
                    </div>
                    <span className="shrink-0 type-caption font-semibold" data-numeric>
                      {formatShortDate(session.when)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Quick actions">
            <ul className="flex flex-col gap-2">
              {[
                { href: "/admin/coaching/new", label: "Add a coaching option", icon: Plus },
                { href: "/admin/gallery/new", label: "Add a gallery image", icon: ImagePlus },
                { href: "/admin/packages/new", label: "Add a package", icon: Package },
                { href: "/admin/content", label: "Edit website content", icon: ArrowRight },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex min-h-11 items-center gap-2.5 rounded-[4px] border border-[var(--color-line)] px-3 type-body-sm font-medium transition-colors duration-200 hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]"
                  >
                    <item.icon aria-hidden="true" className="size-4 text-[var(--text-tertiary)]" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          {data.unreadMessages > 0 && (
            <Panel title="Messages">
              <p className="type-body-sm text-[var(--text-secondary)]">
                You have{" "}
                <strong className="text-[var(--text-primary)]">{data.unreadMessages}</strong> unread{" "}
                {data.unreadMessages === 1 ? "message" : "messages"}.
              </p>
              <ButtonLink href="/admin/messages" size="sm" variant="secondary" className="mt-3">
                Read messages
              </ButtonLink>
            </Panel>
          )}

        </div>
      </div>
    </>
  );
}
