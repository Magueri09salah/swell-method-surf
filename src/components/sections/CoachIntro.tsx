import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { paragraphs } from "./Intro";
import { media } from "@/lib/media";
import type { ContentData } from "@/lib/validation/content";

/**
 * Coach introduction — photograph left, prose right, matching the Figma's
 * "Why Swell Method Surf?" block.
 */
export function CoachIntro({
  content,
  showCta = true,
  headingLevel = "h2",
  truncate = false,
}: {
  content: ContentData<"about.bio">;
  showCta?: boolean;
  headingLevel?: "h1" | "h2";
  truncate?: boolean;
}) {
  const Heading = headingLevel;
  const image = media("groupSession");
  const body = paragraphs(content.body);
  const shown = truncate ? body.slice(0, 2) : body;

  return (
    <section className="section-y">
      <Container size="wide">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)] lg:gap-16">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[12px] border border-[var(--color-line)]">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                loading="lazy"
                sizes="(max-width: 1023px) 100vw, 42vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal delay={80} className="flex flex-col gap-6">
            <p className="type-label text-[var(--text-tertiary)]">{content.eyebrow}</p>
            <Heading className="type-display-l">{content.title}</Heading>

            {shown.map((paragraph, index) => (
              <p key={index} className="measure type-body-lg text-[var(--text-secondary)]">
                {paragraph}
              </p>
            ))}

            {content.quote && (
              <blockquote className="rounded-[12px] bg-[var(--color-yellow)] p-6">
                <p className="type-h3 text-[var(--text-on-accent)]">
                  &ldquo;{content.quote}&rdquo;
                </p>
              </blockquote>
            )}

            {showCta && (
              <a
                href="/about"
                className="inline-flex min-h-11 w-fit items-center gap-2 rounded-[9999px] border border-[var(--color-ink)] px-6 type-label text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--color-ink)] hover:text-white"
              >
                More about the coach
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            )}
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
