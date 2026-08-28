import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import type { ContentData } from "@/lib/validation/content";

/**
 * Closing conversion band — a flat yellow block, as in the Figma.
 *
 * Deliberately NOT a photo-with-scrim like the hero: the page has already used
 * that device once, and repeating it weakens both. A flat colour block also
 * gives the strongest contrast on the page (black on yellow, 14.54:1) at the
 * exact moment the reader is being asked to act.
 */
export function CtaBand({ content }: { content: ContentData<"home.cta"> }) {
  return (
    <section className="bg-[var(--color-yellow)]">
      <Container size="default" className="section-y">
        <Reveal className="flex flex-col items-start gap-6 text-[var(--text-on-accent)]">
          <p className="type-label">Imsouane · Morocco</p>

          <h2 className="type-display-l max-w-[16ch]">{content.title}</h2>

          <p className="measure type-body-lg text-[rgba(20,20,20,0.78)]">{content.body}</p>

          <Link
            href={content.ctaHref}
            className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-[9999px] bg-[var(--color-ink)] px-7 type-label text-white transition-colors duration-200 hover:bg-white hover:text-[var(--color-ink)]"
          >
            {content.ctaLabel}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
