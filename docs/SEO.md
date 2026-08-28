# SEO — Swell Method Surf

## 1. Governing rule

**Nothing here fabricates a business fact.** No invented aggregate ratings, no invented
street address, no invented opening hours, no invented certifications. Structured data is
emitted only from values that genuinely exist in the database or in `SITE`. Optional
properties are omitted entirely rather than emitted empty — an empty structured-data
field is worse than an absent one.

This is not only an ethics position. Fabricated `aggregateRating` is a documented cause of
Google manual actions, and invented business details are a legal exposure in most markets.

## 2. Target intent

| Priority | Query shape                                            | Page        |
| -------- | ------------------------------------------------------ | ----------- |
| 1        | surf coaching Imsouane · surf coach Imsouane           | `/`         |
| 1        | private surf lessons Morocco · surf lessons Imsouane   | `/coaching` |
| 2        | learn to surf Imsouane · beginner surf lessons Morocco | `/coaching` |
| 2        | Imsouane surf guide · surfing Imsouane                 | `/imsouane` |
| 3        | intermediate surf coaching Morocco                     | `/method`   |

`/imsouane` is deliberately an informational destination guide. It targets research-stage
queries that have far more volume than transactional ones, and pulls those readers into
the booking funnel via the CTA band.

## 3. Per-page metadata

Every page calls `pageMetadata()` from `src/lib/seo.ts`, which produces title,
description, canonical, robots, Open Graph and Twitter tags from one input. There is no
route that inherits a generic title.

| Route       | Title                                                   |
| ----------- | ------------------------------------------------------- |
| `/`         | Surf Coaching in Imsouane, Morocco                      |
| `/coaching` | Surf Coaching Options & Prices                          |
| `/method`   | The Swell Method — How the Coaching Works               |
| `/imsouane` | Surfing Imsouane — The Bay, The Season, The Etiquette   |
| `/about`    | The Coach — Swell Method Surf                           |
| `/reviews`  | Reviews from Surfers                                    |
| `/gallery`  | Gallery — Surfing and Coaching in Imsouane              |
| `/contact`  | Book a Surf Session in Imsouane                         |

Titles are template-suffixed with the brand via `layout.tsx`. Descriptions are written for
a human deciding whether to click, not stuffed with keywords.

**All `/admin` routes are `noindex, nofollow`** and additionally disallowed in robots.txt.

## 4. Structured data

Rendered through `<JsonLd>` (`src/components/seo/JsonLd.tsx`), which escapes `<`, `>` and
`&` into `\uXXXX` form. This matters because structured data embeds admin-authored strings
— testimonial quotes, settings, offer descriptions — and a value containing `</script>`
would otherwise terminate the element early and turn into an HTML injection. **No route
calls `dangerouslySetInnerHTML` directly.**

| Type                                     | Where            | Source                          |
| ---------------------------------------- | ---------------- | ------------------------------- |
| `LocalBusiness` + `SportsActivityLocation` | Every public page (site layout) | `SiteSetting` rows |
| `BreadcrumbList`                         | Every interior page | Route trail                  |
| `Service` (in an `ItemList`)             | `/`, `/coaching` | Active `CoachingOffer` rows     |
| `Person`                                 | `/about`         | Business name + bio title       |
| `Review` (in an `ItemList`)              | `/reviews`       | **Published testimonials only** |

`address` carries `addressLocality`, `addressRegion` and `addressCountry` — the three
things we actually know. No street address is invented.

**Deliberately absent: `aggregateRating`.** It implies a verified review corpus. Asserting
one from a handful of hand-entered testimonials would be exactly the fabricated business
claim this document forbids. Individual `Review` nodes carry the real ratings instead.

Verified at runtime: JSON-LD parses as valid JSON and contains no raw angle brackets.

## 5. Crawling

- `src/app/sitemap.ts` → `/sitemap.xml`. Eight public routes with intent-weighted
  priorities: `/` at 1.0, `/coaching` and `/contact` at 0.9, gallery lowest.
- `src/app/robots.ts` → `/robots.txt`. Allows `/`, disallows `/admin` and `/api`,
  declares the sitemap and host.
- Canonicals are absolute and derived from `NEXT_PUBLIC_SITE_URL`.

> **Deployment requirement:** `NEXT_PUBLIC_SITE_URL` must be the real production origin
> with no trailing slash. If it is left at localhost, every canonical and OG URL will point
> at localhost. This is the single highest-impact SEO configuration step.

## 6. Social preview

`src/app/opengraph-image.tsx` generates a 1200×630 card at request time using the brand
palette and mark. It uses system-safe fonts rather than fetching a webfont at the edge — a
remote font fetch there is a build-time failure mode for a decorative gain.

## 7. Technical foundations

- One `<h1>` per page; heading order is sequential with no level skipped for styling.
  Verified on the homepage: 1 × `h1`, 9 × `h2`.
- Semantic landmarks: `<header>`, `<nav aria-label>`, `<main>`, `<footer>`.
- Every image has meaningful alt text. Verified: 0 images missing `alt`.
- `lang="en"` on `<html>`.
- Fonts are self-hosted through `next/font` — **zero external requests**, verified in the
  rendered HTML.
- Public pages are statically rendered with a 1-hour revalidate and tag-based
  invalidation, so they are fast and still update the moment the coach edits content.

## 8. Post-launch checklist

1. Set `NEXT_PUBLIC_SITE_URL` to the production domain.
2. Verify the property in Google Search Console and submit `/sitemap.xml`.
3. Create and verify a Google Business Profile for Imsouane — for a local service
   business this outranks almost all on-page work.
4. Paste the real address and Maps URL into Admin → Settings.
5. Test `/` and `/coaching` in the Rich Results Test.
6. Replace placeholder photography (`src/lib/media.ts`) with real, geo-relevant images.
7. Publish real reviews so `Review` markup has genuine data to emit.
