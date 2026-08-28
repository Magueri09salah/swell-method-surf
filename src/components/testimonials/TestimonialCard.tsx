import Image from "next/image";
import { StarRating } from "@/components/ui/primitives";
import { initials } from "@/lib/utils";
import type { TestimonialDTO } from "@/server/services/types";

/**
 * Testimonial.
 *
 * Rendered as a <blockquote>/<figcaption> pair so the attribution is
 * programmatically tied to the quote, not merely adjacent to it.
 *
 * Avatars fall back to initials rather than a generic silhouette — a stock
 * placeholder face on a real person's review reads as fabricated.
 */
export function TestimonialCard({
  testimonial,
  inverse = false,
}: {
  testimonial: TestimonialDTO;
  inverse?: boolean;
}) {
  const nameColor = inverse ? "text-[var(--color-paper)]" : "text-[var(--text-primary)]";
  const metaColor = inverse
    ? "text-[var(--text-on-inverse-dim)]"
    : "text-[var(--text-secondary)]";
  const quoteColor = inverse ? "text-[var(--color-paper)]" : "text-[var(--text-primary)]";
  const borderColor = inverse ? "border-[rgba(255,255,255,0.20)]" : "border-[var(--color-line)]";

  return (
    <figure className={`flex h-full flex-col gap-5 border-t pt-6 ${borderColor}`}>
      <StarRating value={testimonial.rating} />

      <blockquote className={`flex-1 font-display text-[1.375rem] leading-[1.4] ${quoteColor}`}>
        <p>&ldquo;{testimonial.quote}&rdquo;</p>
      </blockquote>

      <figcaption className="flex items-center gap-3">
        {testimonial.avatarUrl ? (
          <Image
            src={testimonial.avatarUrl}
            alt=""
            width={40}
            height={40}
            loading="lazy"
            className="size-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--color-line)] type-caption font-semibold text-[var(--color-ink)]"
          >
            {initials(testimonial.clientName)}
          </span>
        )}

        <span className="flex flex-col">
          <span className={`type-body-sm font-semibold ${nameColor}`}>
            {testimonial.clientName}
          </span>
          {testimonial.origin && (
            <span className={`type-caption ${metaColor}`}>{testimonial.origin}</span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}
