import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminHeading, Panel, Td, Th, TableWrap } from "@/components/admin/ui";
import { Badge } from "@/components/ui/primitives";
import { ClientForm } from "@/components/admin/ClientForm";
import { getClientById } from "@/server/services/client";
import { BOOKING_STATUS_LABELS, BOOKING_STATUS_TONE } from "@/lib/constants";
import { formatShortDate } from "@/lib/utils";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) notFound();

  return (
    <>
      <AdminHeading
        back={{ href: "/admin/clients", label: "Clients" }}
        title={client.name}
        description={`First enquired ${formatShortDate(client.createdAt)} · ${client.bookings.length} ${client.bookings.length === 1 ? "booking" : "bookings"}`}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="Details">
          <ClientForm client={client} />
        </Panel>

        <Panel title="Booking history">
          {client.bookings.length === 0 ? (
            <p className="type-body-sm text-[var(--text-secondary)]">
              No bookings recorded for this client.
            </p>
          ) : (
            <TableWrap>
              <thead>
                <tr>
                  <Th>Reference</Th>
                  <Th>Date</Th>
                  <Th>Coaching</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {client.bookings.map((booking) => (
                  <tr key={booking.id} className="transition-colors hover:bg-[var(--surface-page)]">
                    <Td>
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="font-semibold text-[var(--color-ink)] underline-offset-4 hover:underline"
                      >
                        {booking.reference}
                      </Link>
                    </Td>
                    <Td data-numeric>{formatShortDate(booking.preferredDate)}</Td>
                    <Td>{booking.offerTitle ?? "—"}</Td>
                    <Td>
                      <Badge tone={BOOKING_STATUS_TONE[booking.status]}>
                        {BOOKING_STATUS_LABELS[booking.status]}
                      </Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Panel>
      </div>
    </>
  );
}
