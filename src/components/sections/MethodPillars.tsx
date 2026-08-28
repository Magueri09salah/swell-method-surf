import { Container, Eyebrow } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import type { ContentData } from "@/lib/validation/content";

/**
 * The Method.
 *
 * Deliberately NOT a grid of identical cards (brief §53). It is a numbered
 * editorial list: a hairline-separated two-column layout where the numeral is
 * oversized display serif and the prose sits in a readable measure beside it.
 * Reads like a chapter list, which is what it is.
 */
export function MethodPillars({
  content,
  headingLevel = "h2",
  limit,
}: {
  content: ContentData<"method.pillars">;
  headingLevel?: "h1" | "h2";
  limit?: number;
}) {
  const Heading = headingLevel;
  const pillars = limit ? content.pillars.slice(0, limit) : content.pillars;

  return (
    <section className="section-y border-y border-[var(--color-line)] bg-[var(--surface-raised)]">
      <Container size="wide">
        <Reveal className="flex max-w-[62ch] flex-col gap-5">
          <Eyebrow>{content.eyebrow}</Eyebrow>
          <Heading className="type-display-l text-[var(--text-primary)]">{content.title}</Heading>
          <p className="type-body-lg text-[var(--text-secondary)]">{content.intro}</p>
        </Reveal>

        <ol className="mt-14 flex flex-col md:mt-20">
          {pillars.map((pillar, index) => (
            <Reveal
              as="li"
              key={pillar.id}
              // Cap the stagger so a long list does not end up with a
              // second-long delay on its final item.
              delay={Math.min(index, 5) * 60}
              className="group border-t border-[var(--color-line)] py-8 last:border-b md:py-11"
            >
              <div className="grid gap-4 md:grid-cols-[7rem_minmax(0,1fr)] md:gap-10 lg:grid-cols-[10rem_minmax(0,1fr)]">
                <div className="flex items-baseline gap-4 md:flex-col md:gap-2">
                  <span
                    aria-hidden="true"
                    className="font-display text-4xl leading-none text-[var(--text-tertiary)] transition-colors duration-300 group-hover:text-[var(--color-ink)] md:text-6xl"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="type-h3 text-[var(--text-primary)] md:text-2xl">{pillar.title}</h3>
                </div>

                <div className="flex flex-col gap-3">
                  <p className="measure type-body text-[var(--text-secondary)]">{pillar.body}</p>

                  {pillar.objective && (
                    <p className="type-caption flex items-start gap-2 font-semibold text-[var(--text-primary)]">
                      <span className="type-label mt-px text-[var(--text-tertiary)]">Goal</span>
                      <span className="font-medium">{pillar.objective}</span>
                    </p>
                  )}
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
