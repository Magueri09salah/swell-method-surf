import type { Metadata } from "next";
import { PageHeader } from "@/components/sections/PageHeader";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { CtaBand } from "@/components/sections/CtaBand";
import { ButtonLink } from "@/components/ui/Button";
import { Container, EmptyState } from "@/components/ui/primitives";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getPublishedGallery } from "@/server/services/gallery";
import { getContent } from "@/server/services/content";

export const metadata: Metadata = pageMetadata({
  title: "Gallery — Surfing and Coaching in Imsouane",
  description:
    "Photographs from the bay: coaching sessions, the line-up, the coastline and life around the village of Imsouane.",
  path: "/gallery",
});

export default async function GalleryPage() {
  const [images, cta] = await Promise.all([getPublishedGallery(), getContent("home.cta")]);

  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="The bay, the sessions, the coastline."
        lead="Photographs from around Imsouane and from coaching mornings in the bay."
      />

      <section className="section-y">
        <Container size="wide">
          {images.length === 0 ? (
            <EmptyState
              title="Photographs coming soon"
              description="The gallery is being put together. In the meantime, the coaching pages describe what a session actually looks like."
              action={<ButtonLink href="/coaching">See coaching options</ButtonLink>}
            />
          ) : (
            <GalleryGrid images={images} />
          )}
        </Container>
      </section>

      <CtaBand content={cta} />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Gallery", path: "/gallery" },
        ])}
      />
    </>
  );
}
