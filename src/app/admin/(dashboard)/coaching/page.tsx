import Link from "next/link";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { AdminHeading, Td, Th, TableWrap } from "@/components/admin/ui";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { ConfirmSubmit, InlineSubmit } from "@/components/admin/ConfirmSubmit";
import { listAllOffers } from "@/server/services/coaching";
import {
  deleteCoachingOffer,
  reorderCoachingOffer,
  toggleCoachingFlag,
} from "@/server/actions/admin";
import { COACHING_LEVEL_LABELS } from "@/lib/constants";
import { formatDuration, formatPrice } from "@/lib/utils";

export default async function CoachingAdminPage() {
  const offers = await listAllOffers();

  return (
    <>
      <AdminHeading
        title="Coaching"
        description="The session formats shown on the website. Order here is the order visitors see."
        action={
          <ButtonLink href="/admin/coaching/new" size="sm">
            <Plus aria-hidden="true" className="size-3.5" />
            New option
          </ButtonLink>
        }
      />

      {offers.length === 0 ? (
        <EmptyState
          title="No coaching options yet"
          description="Add your session formats — private, semi-private, group — so visitors can see what you offer and at what price."
          action={<ButtonLink href="/admin/coaching/new">Add the first option</ButtonLink>}
        />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Level</Th>
              <Th>Duration</Th>
              <Th>Price</Th>
              <Th>Visibility</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer, index) => (
              <tr key={offer.id} className="transition-colors hover:bg-[var(--surface-page)]">
                <Td>
                  <Link
                    href={`/admin/coaching/${offer.id}`}
                    className="font-semibold text-[var(--color-ink)] underline-offset-4 hover:underline"
                  >
                    {offer.title}
                  </Link>
                  <span className="block type-caption text-[var(--text-secondary)]">
                    /{offer.slug}
                  </span>
                </Td>
                <Td>{COACHING_LEVEL_LABELS[offer.level]}</Td>
                <Td data-numeric>{formatDuration(offer.durationMinutes)}</Td>
                <Td data-numeric>{formatPrice(offer.price, offer.currency)}</Td>
                <Td>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge tone={offer.active ? "success" : "muted"}>
                      {offer.active ? "Active" : "Hidden"}
                    </Badge>
                    {offer.featured && <Badge tone="warning">Featured</Badge>}
                  </div>
                </Td>
                <Td>
                  <div className="flex items-center justify-end gap-0.5">
                    <form action={reorderCoachingOffer}>
                      <input type="hidden" name="id" value={offer.id} />
                      <input type="hidden" name="direction" value="up" />
                      <InlineSubmit label={`Move ${offer.title} up`}>
                        <ArrowUp aria-hidden="true" className="size-4" />
                      </InlineSubmit>
                    </form>

                    <form action={reorderCoachingOffer}>
                      <input type="hidden" name="id" value={offer.id} />
                      <input type="hidden" name="direction" value="down" />
                      <InlineSubmit label={`Move ${offer.title} down`}>
                        <ArrowDown aria-hidden="true" className="size-4" />
                      </InlineSubmit>
                    </form>

                    <form action={toggleCoachingFlag}>
                      <input type="hidden" name="id" value={offer.id} />
                      <input type="hidden" name="field" value="active" />
                      <input type="hidden" name="value" value={offer.active ? "false" : "true"} />
                      <button
                        type="submit"
                        className="h-11 cursor-pointer rounded-[4px] px-3 type-caption font-semibold text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--color-line-subtle)] hover:text-[var(--color-ink)]"
                      >
                        {offer.active ? "Hide" : "Show"}
                      </button>
                    </form>

                    <form action={deleteCoachingOffer}>
                      <input type="hidden" name="id" value={offer.id} />
                      <ConfirmSubmit
                        iconOnly
                        label={`Delete ${offer.title}`}
                        message={`Delete "${offer.title}"? Past bookings will be kept but will no longer show this coaching option. This cannot be undone.`}
                      />
                    </form>
                  </div>
                  <span className="sr-only">Position {index + 1}</span>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </>
  );
}
