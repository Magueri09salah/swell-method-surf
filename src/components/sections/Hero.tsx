import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { media } from "@/lib/media";
import { SITE } from "@/lib/constants";
import type { ContentData } from "@/lib/validation/content";

/**
 * Homepage hero — full-bleed photograph, dark scrim, oversized yellow headline.
 *
 * CONTRAST, measured not assumed: the yellow headline over the brightest sky
 * region of this photograph is 1.21:1 raw, which is unreadable. The `.hero-scrim`
 * gradient (globals.css) puts a 42-60% black layer between them, lifting the
 * headline past the 3:1 floor for large display type on every sampled region and
 * the white sub-copy past 4.5:1. The scrim is structural here, not decoration.
 *
 * The image is `priority` — it is the LCP element — and carries explicit
 * dimensions plus `sizes` so it never shifts the layout.
 */

const QUICK_LINKS = [
  { href: "/coaching", label: "Surf lessons" },
  { href: "/method", label: "The method" },
  { href: "/imsouane", label: "Imsouane" },
] as const;

export function Hero({ content }: { content: ContentData<"home.hero"> }) {
  const image = media("heroPrimary");

  return (
    <section className="on-inverse relative isolate flex min-h-[max(34rem,78svh)] flex-col justify-between overflow-hidden">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="-z-20 object-cover"
      />
      <div aria-hidden="true" className="hero-scrim absolute inset-0 -z-10" />

      <div className="mx-auto flex w-full max-w-[1480px] flex-1 flex-col justify-between gap-10 px-5 pb-8 pt-12 md:px-8 md:pb-10 md:pt-16 xl:px-12">
        <div className="flex flex-col items-start gap-5">
          <p className="inline-flex items-center gap-2 rounded-[9999px] bg-[var(--color-yellow)] px-4 py-2 type-label text-[var(--text-on-accent)]">
            <MapPin aria-hidden="true" className="size-3.5" />
            {SITE.locality}, {SITE.country}
          </p>

          <h1 className="type-display-xl max-w-[13ch] text-[var(--color-yellow)]">
            {content.title}
          </h1>

          <p className="measure type-body-lg text-white">{content.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center rounded-[9999px] border border-white/45 bg-white/12 px-5 type-label text-white backdrop-blur-[2px] transition-colors duration-200 hover:border-white hover:bg-white hover:text-[var(--color-ink)]"
            >
              {link.label}
            </Link>
          ))}

          <Link
            href={content.primaryCtaHref}
            className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-[9999px] bg-[var(--color-ink)] px-6 type-label text-white transition-colors duration-200 hover:bg-[var(--color-yellow)] hover:text-[var(--color-ink)]"
          >
            {content.primaryCtaLabel}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
