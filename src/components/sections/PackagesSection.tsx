import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { formatPrice } from "@/lib/utils";
import type { PackageDTO } from "@/server/services/package";

/**
 * "Our Packages" — multi-day bundles.
 *
 * Renders nothing at all when there are no active packages. That is deliberate:
 * an empty-state box for a section the coach may simply not sell would be
 * clutter on the homepage, unlike Coaching or Reviews where the absence is
 * itself worth explaining.
 *
 * Card photographs use `alt=""`: the title, feature list and price beside them
 * already carry the meaning, so describing the image would only add a redundant
 * announcement (WCAG 1.1.1).
 */
export function PackagesSection({
  packages,
  headingLevel = "h2",
}: {
  packages: PackageDTO[];
  headingLevel?: "h1" | "h2";
}) {
  if (packages.length === 0) return null;

  const Heading = headingLevel;

  return (
    <section id="packages" className="section-y bg-[var(--surface-soft)]">
      <Container size="wide">
        <Reveal className="mb-10 flex flex-col items-center gap-4 text-center md:mb-14">
          <Heading className="type-display-l">Our Packages</Heading>
          <span aria-hidden="true" className="h-1 w-12 rounded-full bg-[var(--color-yellow)]" />
          <p className="measure type-body-lg text-[var(--text-secondary)]">
            Book several days together. Every package includes equipment and daily feedback.
          </p>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {packages.map((pkg, index) => (
            <Reveal key={pkg.id} delay={Math.min(index, 5) * 70} className="h-full">
              <article className="group flex h-full flex-col overflow-hidden rounded-[12px] border border-[var(--color-line)] bg-[var(--surface-raised)] transition-colors duration-200 hover:border-[var(--color-ink)]">
                {pkg.imageUrl && (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={pkg.imageUrl}
                      alt=""
                      fill
                      loading="lazy"
                      sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                      className="object-cover transition-transform duration-[560ms] ease-[cubic-bezier(0.16,0.84,0.24,1)] group-hover:scale-[1.04]"
                    />
                  </div>
                )}

                <div className="flex flex-1 flex-col gap-4 p-6">
                  <h3 className="type-h3">{pkg.title}</h3>

                  {pkg.features.length > 0 && (
                    <ul className="flex flex-1 flex-col gap-2.5">
                      {pkg.features.map((feature) => (
                        <li
                          key={feature}
                          className="type-body-sm flex gap-2.5 text-[var(--text-secondary)]"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-[var(--color-ink)]"
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-line)] pt-4">
                    <p>
                      <span data-numeric className="type-h3">
                        {formatPrice(pkg.price, pkg.currency)}
                      </span>
                      <span className="type-label ml-1.5 text-[var(--text-tertiary)]">
                        / person
                      </span>
                    </p>

                    <Link
                      href={`/contact?package=${pkg.slug}`}
                      className="inline-flex min-h-11 items-center rounded-[9999px] bg-[var(--color-ink)] px-5 type-label text-white transition-colors duration-200 hover:bg-[var(--color-yellow)] hover:text-[var(--color-ink)]"
                    >
                      Book now
                      <span className="sr-only"> — {pkg.title}</span>
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
