import Link from "next/link";
import { Search } from "lucide-react";
import { AdminHeading, Pagination, Td, Th, TableWrap } from "@/components/admin/ui";
import { EmptyState } from "@/components/ui/primitives";
import { listClients } from "@/server/services/client";
import { EXPERIENCE_LEVEL_LABELS } from "@/lib/constants";
import { formatShortDate } from "@/lib/utils";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageRaw } = await searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const query = q?.trim().slice(0, 120) || undefined;

  const { items, total, pageCount } = await listClients(query, page);

  return (
    <>
      <AdminHeading
        title="Clients"
        description={`${total} ${total === 1 ? "person has" : "people have"} enquired. Records are created automatically from booking requests.`}
      />

      <form method="get" role="search" className="mb-5 flex gap-2">
        <div className="relative flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--text-secondary)]"
          />
          <input
            type="search"
            name="q"
            defaultValue={query ?? ""}
            placeholder="Search by name, email or country"
            aria-label="Search clients"
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

      {items.length === 0 ? (
        <EmptyState
          title={query ? "No clients match" : "No clients yet"}
          description={
            query
              ? "Try a different name, email address or country."
              : "A client record is created the first time someone sends a booking request."
          }
        />
      ) : (
        <>
          <TableWrap>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Country</Th>
                <Th>Level</Th>
                <Th>Bookings</Th>
                <Th>First seen</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((client) => (
                <tr key={client.id} className="transition-colors hover:bg-[var(--surface-page)]">
                  <Td>
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="font-semibold text-[var(--color-ink)] underline-offset-4 hover:underline"
                    >
                      {client.name}
                    </Link>
                  </Td>
                  <Td className="break-all text-[var(--text-secondary)]">{client.email}</Td>
                  <Td>{client.country ?? "—"}</Td>
                  <Td>
                    {client.experienceLevel
                      ? EXPERIENCE_LEVEL_LABELS[client.experienceLevel]
                      : "—"}
                  </Td>
                  <Td data-numeric>{client.bookingCount}</Td>
                  <Td data-numeric className="text-[var(--text-secondary)]">
                    {formatShortDate(client.createdAt)}
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>

          <Pagination
            page={page}
            pageCount={pageCount}
            baseHref={`/admin/clients${query ? `?q=${encodeURIComponent(query)}` : ""}`}
          />
        </>
      )}
    </>
  );
}
