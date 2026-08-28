import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { CoachingCard } from "@/components/coaching/CoachingCard";
import { PackagesSection } from "@/components/sections/PackagesSection";
import { CtaBand } from "@/components/sections/CtaBand";
import { ButtonLink } from "@/components/ui/Button";
import { Container, EmptyState } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";
import { getActiveOffers } from "@/server/services/coaching";
import { getActivePackages } from "@/server/services/package";
import { getContent } from "@/server/services/content";

export const metadata: Metadata = pageMetadata({
  title: "Surf Coaching Options & Prices",
  description:
    "Private, semi-private and small-group surf coaching in Imsouane. Session lengths, group sizes, levels and prices for beginners through to advanced surfers.",
  path: "/coaching",
});

export default async function CoachingPage() {
  const [offers, packages, cta] = await Promise.all([
    getActiveOffers(),
    getActivePackages(),
    getContent("home.cta"),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Coaching"
        title="Formats, levels and what each session includes."
        lead="Every option below is coached personally. If you are unsure which fits, choose “Not sure yet” on the booking form and tell me where you are in your surfing — I will recommend honestly, including when a cheaper format would serve you better."
      />

      <section className="section-y">
        <Container size="wide">
          {offers.length === 0 ? (
            <EmptyState
              title="Coaching options are being finalised"
              description="Session formats and pricing for the coming season are being confirmed. Send a booking request and I will reply with what is available for your dates."
              action={<ButtonLink href="/contact">Send a request</ButtonLink>}
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {offers.map((offer, index) => (
                <Reveal key={offer.id} delay={Math.min(index, 5) * 60} className="h-full">
                  <CoachingCard offer={offer} index={index} showIncludes />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>

      <PackagesSection packages={packages} />

      <CtaBand content={cta} />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Coaching", path: "/coaching" },
        ])}
      />
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
