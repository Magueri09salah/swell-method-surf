import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/sections/PageHeader";
import { TestimonialsGrid } from "@/components/sections/TestimonialsSection";
import { CtaBand } from "@/components/sections/CtaBand";
import { Container } from "@/components/ui/primitives";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageMetadata, reviewsJsonLd } from "@/lib/seo";
import { getPublishedTestimonials } from "@/server/services/testimonial";
import { getContent } from "@/server/services/content";

export const metadata: Metadata = pageMetadata({
  title: "Reviews from Surfers",
  description:
    "What surfers say after coaching sessions in Imsouane — from first-timers standing up to experienced surfers working on turns and wave selection.",
  path: "/reviews",
});

export default async function ReviewsPage() {
  const [testimonials, cta] = await Promise.all([
    getPublishedTestimonials(),
    getContent("home.cta"),
  ]);

  // A page whose entire purpose is to list reviews has nothing to say when
  // there are none. 404 rather than publish a header over a blank column — the
  // footer link and the sitemap entry go with it, so nothing on the site or in
  // Google's index points here while it is empty.
  if (testimonials.length === 0) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Reviews"
        title="Honest words from people I have surfed with."
        lead="Every review here is from someone who booked a session. Nothing is solicited in exchange for a discount."
      />

      <section className="section-y">
        <Container size="wide">
          <TestimonialsGrid testimonials={testimonials} />
        </Container>
      </section>

      <CtaBand content={cta} />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Reviews", path: "/reviews" },
        ])}
      />
      {/* Individual Review nodes only — deliberately no aggregateRating, which
          would assert a verified review corpus we do not have. See lib/seo.ts. */}
      <JsonLd
        data={reviewsJsonLd(
          testimonials.map((testimonial) => ({
            clientName: testimonial.clientName,
            quote: testimonial.quote,
            rating: testimonial.rating,
            sessionDate: testimonial.sessionDate,
          })),
        )}
      />
    </>
  );
}
