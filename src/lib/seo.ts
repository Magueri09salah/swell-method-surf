import type { Metadata } from "next";
import { SITE, siteUrl } from "@/lib/constants";

/**
 * SEO helpers. See docs/SEO.md.
 *
 * Hard rule: nothing here fabricates business facts. No invented aggregate
 * ratings, no invented addresses, no invented opening hours. Structured data is
 * emitted only from values that actually exist in the database or in SITE.
 */

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
};

export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  noIndex = false,
}: PageMetaInput): Metadata {
  const base = siteUrl();
  const url = `${base}${path === "/" ? "" : path}`;
  const ogImage = image ?? `${base}/opengraph-image`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: SITE.name,
      locale: SITE.locale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

// ---------------------------------------------------------------------------
// JSON-LD
// ---------------------------------------------------------------------------

type BusinessInfo = {
  email?: string;
  phone?: string;
  instagram?: string;
  mapsUrl?: string;
};

/**
 * LocalBusiness + SportsActivityLocation.
 *
 * `address` carries only locality/region/country — the values we genuinely know.
 * No street address is invented. Optional properties are omitted entirely rather
 * than emitted empty, because empty structured-data fields are worse than absent
 * ones.
 */
export function localBusinessJsonLd(info: BusinessInfo = {}) {
  const base = siteUrl();
  const sameAs = [info.instagram].filter((v): v is string => Boolean(v));

  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "SportsActivityLocation"],
    "@id": `${base}/#business`,
    name: SITE.name,
    description: `${SITE.tagline}. Private, semi-private and small-group surf coaching in Imsouane, Morocco.`,
    url: base,
    ...(info.email ? { email: info.email } : {}),
    ...(info.phone ? { telephone: info.phone } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(info.mapsUrl ? { hasMap: info.mapsUrl } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.locality,
      addressRegion: SITE.region,
      addressCountry: SITE.countryCode,
    },
    areaServed: { "@type": "Place", name: `${SITE.locality}, ${SITE.country}` },
    sport: "Surfing",
  };
}

export function personJsonLd(name: string, description: string) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${base}/about#coach`,
    name,
    description,
    jobTitle: "Surf Coach",
    worksFor: { "@id": `${base}/#business` },
    knowsAbout: ["Surfing", "Surf coaching", "Ocean safety", "Wave reading"],
  };
}

export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${base}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

/**
 * Review markup for REAL, published testimonials only.
 *
 * Deliberately emits individual `Review` nodes and NOT an `aggregateRating`.
 * An aggregate rating implies a verified review corpus; asserting one from a
 * handful of hand-entered testimonials would be a fabricated business claim
 * (brief §27, §53).
 */
export function reviewsJsonLd(
  reviews: { clientName: string; quote: string; rating: number; sessionDate?: string | null }[],
) {
  if (reviews.length === 0) return null;
  const base = siteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: reviews.map((review, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Review",
        itemReviewed: { "@id": `${base}/#business` },
        author: { "@type": "Person", name: review.clientName },
        reviewBody: review.quote,
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1,
        },
        ...(review.sessionDate ? { datePublished: review.sessionDate.slice(0, 10) } : {}),
      },
    })),
  };
}

export function serviceJsonLd(
  offers: { title: string; description: string; price: number; currency: string; slug: string }[],
) {
  if (offers.length === 0) return null;
  const base = siteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Surf coaching options",
    itemListElement: offers.map((offer, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: offer.title,
        description: offer.description,
        serviceType: "Surf coaching",
        provider: { "@id": `${base}/#business` },
        areaServed: { "@type": "Place", name: `${SITE.locality}, ${SITE.country}` },
        offers: {
          "@type": "Offer",
          price: offer.price.toFixed(2),
          priceCurrency: offer.currency,
          url: `${base}/coaching#${offer.slug}`,
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };
}
