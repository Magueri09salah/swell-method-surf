import Image from "next/image";
import Link from "next/link";
import { Check, Clock, Users } from "lucide-react";
import { COACHING_LEVEL_LABELS } from "@/lib/constants";
import { formatDuration, formatPrice } from "@/lib/utils";
import { media } from "@/lib/media";
import type { CoachingOfferDTO } from "@/server/services/types";

/**
 * Coaching offer card, in the Figma's treatment: photograph on top, then a
 * butter-coloured info block carrying title, session length and price.
 *
 * Hover darkens the border and scales the image — the card itself never moves.
 * The whole card is one tab stop via a stretched link on the title.
 *
 * Offers without their own photograph fall back to a shared one rather than
 * rendering an empty frame, so a half-filled admin never breaks the grid.
 */

const FALLBACKS = ["coachingBriefing", "lessonWaveGroup", "coachingStance"] as const;

export function CoachingCard({
  offer,
  index = 0,
  showIncludes = false,
}: {
  offer: CoachingOfferDTO;
  index?: number;
  showIncludes?: boolean;
}) {
  const fallback = media(FALLBACKS[index % FALLBACKS.length] ?? "coachingBriefing");
  const src = offer.imageUrl ?? fallback.src;
  const alt = offer.imageUrl ? (offer.imageAlt ?? "") : fallback.alt;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[12px] border border-[var(--color-line)] bg-[var(--surface-raised)] transition-colors duration-200 hover:border-[var(--color-ink)] focus-within:border-[var(--color-ink)]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={src}
          alt={alt}
          fill
          loading="lazy"
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
          className="object-cover transition-transform duration-[560ms] ease-[cubic-bezier(0.16,0.84,0.24,1)] group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 rounded-[9999px] bg-[var(--color-yellow)] px-3 py-1.5 type-label text-[var(--text-on-accent)]">
          {COACHING_LEVEL_LABELS[offer.level]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 bg-[var(--surface-soft)] p-6">
        <h3 className="type-h3">
          <Link
            href={`/contact?offer=${offer.id}`}
            className="stretched-link rounded-[2px] text-[var(--text-primary)]"
          >
            {offer.title}
          </Link>
        </h3>

        <p className="type-body-sm flex-1 text-[var(--text-secondary)]">{offer.shortDescription}</p>

        {showIncludes && offer.includes.length > 0 && (
          <ul className="flex flex-col gap-1.5 pt-1">
            {offer.includes.map((item) => (
              <li
                key={item}
                className="type-caption flex items-start gap-2 text-[var(--text-secondary)]"
              >
                <Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}

        <dl className="mt-1 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 border-t border-[var(--color-line-strong)] pt-4">
          <div className="flex flex-col gap-1 type-caption text-[var(--text-secondary)]">
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Duration</dt>
              <Clock aria-hidden="true" className="size-3.5" />
              <dd>{formatDuration(offer.durationMinutes)} session</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Maximum participants</dt>
              <Users aria-hidden="true" className="size-3.5" />
              <dd>
                {offer.maxParticipants === 1
                  ? "One to one"
                  : `Up to ${offer.maxParticipants} surfers`}
              </dd>
            </div>
          </div>

          <div className="text-right">
            <dt className="sr-only">Price per person</dt>
            <dd data-numeric className="type-h3 leading-none text-[var(--text-primary)]">
              {formatPrice(offer.price, offer.currency)}
            </dd>
            <p className="type-label mt-1 text-[var(--text-tertiary)]">Per person</p>
          </div>
        </dl>
      </div>
    </article>
  );
}
