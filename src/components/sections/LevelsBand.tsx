import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { media } from "@/lib/media";

/**
 * "Choose the package that matches your level" — the yellow card plus two
 * photographs, straight from the Figma.
 *
 * The levels are structural (they mirror the CoachingLevel enum), not editable
 * copy: they are the same four values the booking form and every offer already
 * use, so they must not drift.
 *
 * Black on yellow measures 14.54:1, so the card is one of the most readable
 * surfaces on the site — the yellow does the shouting, the type stays calm.
 */

const LEVELS = [
  { title: "Beginner", body: "Never surfed, or still finding your feet in the whitewater." },
  { title: "Intermediate & Advanced", body: "Turning, trimming, reading a section and choosing better waves." },
  { title: "Group or private", body: "One to one, in a pair, or a small group capped at four." },
] as const;

export function LevelsBand() {
  const left = media("beachWarmUp");
  const right = media("longboardShoreline");

  return (
    <section className="section-y bg-[var(--surface-soft)]">
      <Container size="wide">
        <Reveal className="mb-10 flex max-w-[24ch] flex-col gap-4 md:mb-14">
          <h2 className="type-display-l">Surf lessons and professional coaching in Imsouane.</h2>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3 md:gap-5">
          <Reveal className="flex">
            <div className="flex w-full flex-col gap-6 rounded-[12px] bg-[var(--color-yellow)] p-7">
              <p className="type-label text-[var(--text-on-accent)]">Catch your first wave</p>

              <p className="type-body-sm text-[var(--text-on-accent)]">
                From your first wave to advanced progression — choose the format that matches
                where you actually are.
              </p>

              <ul className="flex flex-1 flex-col gap-4">
                {LEVELS.map((level) => (
                  <li key={level.title} className="border-t border-[rgba(20,20,20,0.18)] pt-3">
                    <p className="type-h3 text-[var(--text-on-accent)]">{level.title}</p>
                    <p className="type-caption text-[rgba(20,20,20,0.72)]">{level.body}</p>
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className="inline-flex min-h-11 w-fit items-center gap-2 rounded-[9999px] bg-[var(--color-ink)] px-6 type-label text-white transition-colors duration-200 hover:bg-white hover:text-[var(--color-ink)]"
              >
                Book now
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </Reveal>

          {[left, right].map((image, index) => (
            <Reveal key={image.src} delay={(index + 1) * 70}>
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[12px] border border-[var(--color-line)] md:h-full">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 767px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
