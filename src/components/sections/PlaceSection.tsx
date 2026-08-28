import Image from "next/image";
import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { media } from "@/lib/media";
import type { ContentData } from "@/lib/validation/content";

/**
 * Imsouane.
 *
 * Full-bleed image band followed by an offset editorial column layout. Blocks
 * alternate their column start on wide screens so the section never settles
 * into a symmetrical grid.
 */
export function PlaceSection({
  content,
  headingLevel = "h2",
  limit,
}: {
  content: ContentData<"imsouane.guide">;
  headingLevel?: "h1" | "h2";
  limit?: number;
}) {
  const Heading = headingLevel;
  const image = media("imsouaneBoats");
  const blocks = limit ? content.blocks.slice(0, limit) : content.blocks;

  return (
    <section className="section-y">
      <Container size="wide">
        <Reveal className="flex max-w-[60ch] flex-col gap-5">
          <p className="type-label text-[var(--text-tertiary)]">{content.eyebrow}</p>
          <Heading className="type-display-l">{content.title}</Heading>
          <p className="type-body-lg text-[var(--text-secondary)]">{content.intro}</p>
        </Reveal>
      </Container>

      <Reveal delay={80} className="mt-12 md:mt-16">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[12px] border border-[var(--color-line)] md:aspect-[21/9]">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            loading="lazy"
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </Reveal>

      <Container size="wide" className="mt-12 md:mt-20">
        <div className="grid gap-x-16 gap-y-10 md:grid-cols-2">
          {blocks.map((block, index) => (
            <Reveal
              key={block.title}
              delay={Math.min(index, 5) * 60}
              className={
                // Nudge every other block down on wide screens to break the grid.
                index % 2 === 1 ? "md:mt-12" : undefined
              }
            >
              <article className="flex flex-col gap-3 rounded-[12px] bg-[var(--surface-soft)] p-6">
                <h3 className="type-h3">{block.title}</h3>
                <p className="measure type-body text-[var(--text-secondary)]">{block.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
