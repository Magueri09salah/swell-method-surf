import Image from "next/image";
import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { media } from "@/lib/media";
import type { ContentData } from "@/lib/validation/content";

/** Splits stored copy on blank lines into paragraphs. */
export function paragraphs(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * "Who am I?" — text left, tall portrait right, matching the Figma.
 * The heading is a small tracked mono label rather than display type, so the
 * photograph and the prose carry the section instead of competing with it.
 */
export function Intro({ content }: { content: ContentData<"home.intro"> }) {
  const image = media("coachSurfing");

  return (
    <section className="section-y">
      <Container size="wide">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] lg:gap-16">
          <Reveal className="flex flex-col gap-6">
            <h2 className="type-h1">{content.title}</h2>

            <div className="flex flex-col gap-4">
              {paragraphs(content.body).map((paragraph, index) => (
                <p key={index} className="measure type-body-lg text-[var(--text-secondary)]">
                  {paragraph}
                </p>
              ))}
            </div>

            {content.signature && (
              <p className="type-label text-[var(--text-tertiary)]">{content.signature}</p>
            )}
          </Reveal>

          <Reveal delay={80}>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[12px] border border-[var(--color-line)]">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                loading="lazy"
                sizes="(max-width: 1023px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
