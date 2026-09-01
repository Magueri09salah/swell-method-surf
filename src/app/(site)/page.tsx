import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
import { MethodPillars } from "@/components/sections/MethodPillars";
import { LevelsBand } from "@/components/sections/LevelsBand";
import { CoachingPreview } from "@/components/sections/CoachingPreview";
import { PackagesSection } from "@/components/sections/PackagesSection";
import { PlaceSection } from "@/components/sections/PlaceSection";
import { CoachIntro } from "@/components/sections/CoachIntro";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { CtaBand } from "@/components/sections/CtaBand";
import { Container, Eyebrow } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata, serviceJsonLd } from "@/lib/seo";
import { getContent } from "@/server/services/content";
import { getFeaturedOffers } from "@/server/services/coaching";
import { getActivePackages } from "@/server/services/package";
import { getFeaturedTestimonials } from "@/server/services/testimonial";
import { getGoogleReviews } from "@/server/services/google-reviews";
import { getGalleryPreview } from "@/server/services/gallery";

export const metadata: Metadata = pageMetadata({
  title: "Surf Coaching in Imsouane, Morocco",
  description:
    "Private, semi-private and small-group surf coaching in Imsouane. Technique-led sessions on one of Morocco's longest right-hand waves — for first-timers through to advanced surfers.",
  path: "/",
});

export default async function HomePage() {
  // Parallel: these reads are independent, so waterfalling them would add
  // latency for nothing.
  const [hero, intro, cta, pillars, bio, place, offers, packages, testimonials, googleReviews, gallery] =
    await Promise.all([
      getContent("home.hero"),
      getContent("home.intro"),
      getContent("home.cta"),
      getContent("method.pillars"),
      getContent("about.bio"),
      getContent("imsouane.guide"),
      getFeaturedOffers(),
      getActivePackages(),
      getFeaturedTestimonials(),
    getGoogleReviews(),
      getGalleryPreview(6),
    ]);

  return (
    <>
      <Hero content={hero} />
      <Intro content={intro} />
      <LevelsBand />
      <MethodPillars content={pillars} limit={6} />
      <CoachingPreview offers={offers} />
      <PackagesSection packages={packages} />
      <PlaceSection content={place} limit={4} />
      <CoachIntro content={bio} truncate />
      <TestimonialsSection testimonials={testimonials} google={googleReviews} />

      {gallery.length > 0 && (
        <section className="section-y">
          <Container size="wide">
            <Reveal className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="flex max-w-[40ch] flex-col gap-4">
                <Eyebrow>Gallery</Eyebrow>
                <h2 className="type-display-l text-[var(--text-primary)]">Mornings in the bay.</h2>
              </div>

              <Link
                href="/gallery"
                className="inline-flex h-11 w-fit shrink-0 items-center gap-2 rounded-[4px] border border-[var(--color-line-strong)] px-5 text-[0.9375rem] font-semibold transition-colors duration-200 hover:border-[var(--color-ink)] hover:bg-[var(--surface-raised)]"
              >
                See the gallery
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Reveal>

            <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {gallery.map((image, index) => (
                <Reveal key={image.id} delay={Math.min(index, 5) * 60}>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[4px] border border-[var(--color-line)]">
                    <Image
                      src={image.imageUrl}
                      alt={image.altText}
                      fill
                      loading="lazy"
                      sizes="(max-width: 767px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      <CtaBand content={cta} />

      <JsonLd
        data={serviceJsonLd(
          offers.map((offer) => ({
            title: offer.title,
            description: offer.shortDescription,
            price: offer.price,
            currency: offer.currency,
            slug: offer.slug,
          })),
        )}
      />
    </>
  );
}
