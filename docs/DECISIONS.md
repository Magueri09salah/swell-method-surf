# Decision Log

Senior-level calls made during the build where the brief left room for judgement, or
where following the brief literally would have produced a worse product.

---

### D-001 — Supplied logo used as a recolourable CSS mask, not an <img>

**Context.** The artwork (`logoswell.png`, 781x940 RGBA) is a flat terracotta
shape on a transparent background: sun with seven rays, coastal village with palms,
three birds, a curling right-hander, and the stacked wordmark.

**Decision.** The artwork is used **as supplied** — no redrawing, no tracing — and applied
through `mask-image` with `background-color: currentColor` rather than as an `<img>`.

**Why a mask.** The mark must be terracotta on the cream header and light on the dark
footer and admin sidebar. An `<img>` cannot recolour, so it would need two exported files
kept in sync by hand — and they would drift. One masked asset covers every surface.

**Derived assets**, all cut from the master:

| File | What | Size |
| --- | --- | --- |
| `logo-master.png` | The artwork as supplied | 781x940 |
| `logo-emblem.png` | Emblem, alpha-only mask | 384x303, 16KB |
| `logo-full.png` | Stacked lockup, alpha-only mask | 512x618, 36KB |
| `logo-emblem-color.png` | Terracotta emblem for non-mask contexts (OG card) | 300x237, 11KB |
| `src/app/icon.png`, `apple-icon.png` | Favicon and touch icon | 256x256 |

Crops were taken on the artwork's **own blank rows**, found by scanning row occupancy —
so the bounds come from the design, not from eyeballing. The detected bands lined up
exactly with the emblem, `SWELL`, `METHOD`, `SURF COACHING`, `IMSOUANE` and `MOROCCO`.

**A 89% size win, for free.** A CSS mask reads only the alpha channel, so the RGB plane is
dead weight — and being anti-aliased, it compressed badly. Re-encoding as greyscale+alpha
with a constant grey makes the colour plane uniform, which deflate collapses: 151KB -> 16KB
and 267KB -> 36KB.

**Colour verified against the artwork.** Decoding the master's pixels, the single most
common opaque colour is **`#BF7047`** at 14.1% of opaque pixels — an exact match for
`--brand-terracotta`. The remaining top values are anti-aliasing neighbours within +/-2.
No token needed changing.

**The wordmark beside the emblem is live text, not an image**, so it stays selectable,
searchable and legible to screen readers at any zoom. The `stacked` variant uses the
artwork's own typography.

### D-002 — Rejected the design skill's generated style, palette and font

**Context.** `ui-ux-pro-max --design-system` returned: style *Liquid Glass*, accent
`#059669` (green), heading font *Calistoga*.

**Decision.** All three rejected.

- *Liquid Glass* is glassmorphism, which the brief bans outright (§6, §53), and the tool
  itself flags its performance as "Moderate-Poor" and accessibility as "Text contrast".
- The green accent contradicts the fixed brand palette in §5.
- Calistoga is a heavy display face that would compete with the logo's own lettering,
  violating §48.

**Kept from the skill:** the accessibility rule set, touch-target minimums, motion
timing guidance, and the pre-delivery checklist — all of which are applied.

---

### D-003 — Prisma 6, not Prisma 7

**Context.** Prisma 7.9 is the latest major. The brief pins only Next.js to "latest stable".

**Decision.** Pin Prisma `^6.19`. Prisma 7 changes the generator model and client output
path, and its driver-adapter story for Neon differs. Prisma 6 is stable, well-understood
against Neon's pooled/direct URL pair, and carries zero migration risk for this build.

**Upgrade path:** isolated to `prisma/schema.prisma` and `src/server/db.ts`.

---

### D-004 — Custom session auth instead of NextAuth/Auth.js

**Context.** There is exactly one user: the coach. No OAuth, no sign-up, no account
recovery flow in MVP.

**Decision.** ~120 lines of auditable code — bcrypt + a `jose` HS256 JWT in an httpOnly
cookie — instead of a full auth framework and its adapter, database tables and config
surface.

**Rationale.** Less dependency surface, less to misconfigure, and every security-relevant
line is readable in one file. The `User` table already carries a `role` enum, so adding
providers or users later does not require re-modelling.

---

### D-005 — In-memory rate limiting

**Decision.** Fixed-window in-memory limiter rather than Redis.

**Trade-off, stated plainly:** this does **not** hold across serverless instances. Under
scale-out an attacker gets N× the limit. It defeats casual abuse and bots, which is the
actual MVP threat model for a single coach's inquiry form. `checkRateLimit()` is a single
exported function, so swapping in Upstash Redis is a one-file change.

---

### D-006 — No dark mode

**Decision.** Ship light only, with `color-scheme: light` declared.

**Rationale.** The identity is a sun-faded cream and terracotta palette. A dark inversion
would either misrepresent the brand or require a second palette that no longer reads as
Swell Method Surf. Section-level inversion (`--surface-inverse`) provides contrast rhythm
instead. This is a brand decision, not a scope cut.

---

### D-007 — Booking is an inquiry, not a transaction

**Decision.** The form creates a `PENDING` booking request; the coach confirms manually.
No payment, no calendar-driven availability enforcement in MVP.

**Rationale.** Directly follows brief §10. Surf sessions depend on swell, tide and wind —
auto-confirming a slot the ocean may not deliver is worse service, not better. Manual
confirmation is the correct product behaviour here, not a limitation.

---

### D-008 — Native `<select>` over a custom listbox

**Decision.** All form selects are styled native `<select>` elements.

**Rationale.** Better mobile UX (system picker), free accessibility, zero JS, no focus-trap
bugs. A custom listbox would add weight and risk for no user benefit.

---

### D-009 — Custom IntersectionObserver reveals instead of Framer Motion

**Context.** Brief §31 permits Framer Motion or GSAP but asks for "the simplest solution".

**Decision.** A ~40-line `<Reveal>` component using IntersectionObserver + CSS transitions.

**Rationale.** Saves ~35KB gzipped on every page for effects that are pure fade-and-rise.
Critically, **elements are visible by default** and the animation is additive — so if JS
fails or the observer never fires, content still renders. A motion library that hides
content until hydration cannot make that guarantee.

---

### D-010 — Photography is the coach's own, served locally

**Superseded the placeholder approach.** Sixteen of the coach's own photographs were
supplied and are installed to `public/photography/` under meaningful names, referenced
through the single map in `src/lib/media.ts`.

**Alt text describes what is actually in each frame** — a coach briefing four surfers on
the sand, two surfers sitting out the back, blue fishing boats above the shoreline. No
conditions, locations or people are asserted beyond what is visible. Intrinsic
`width`/`height` come from the real files so `next/image` reserves the correct box.

`next.config.ts` no longer allow-lists Unsplash: every image is local, so there is no
remote host to trust. Verified — zero database rows point at a remote host, and zero point
at a missing file.

**Still not done, and deliberately:** no fabricated testimonials, no invented statistics,
no invented credentials. The two seeded sample reviews remain `published: false`.

---

### D-011 — Content model is typed key/value, not a page builder

**Decision.** `ContentSection` rows keyed by stable strings (`home.hero`, `about.bio`)
with a Zod-validated JSON payload per key, edited through purpose-built forms.

**Rationale.** Brief §20 explicitly asks not to over-build the CMS. A block-based builder
would let the coach break the design; typed forms cannot. Adding a field is a schema edit
in one file.

---

### D-012 — `terracotta` demoted from interactive fill to decoration

**Context.** Brief §5 names `#BF7047` the primary brand color and suggests it for primary
buttons.

**Decision.** Measured contrast: cream on `#BF7047` is **3.18:1**, white on it **3.73:1** —
both fail WCAG AA for button labels. All solid interactive fills therefore use
`--brand-terracotta-dark` `#8A4E35` (5.54:1 / 6.52:1). Terracotta remains the brand
accent for hairlines, icons, eyebrow labels and display type ≥ 24px, where 3:1 is
sufficient.

**Why this does not weaken the brand:** the two tones are close enough that the identity
reads identically, and terracotta still appears on virtually every screen. Brief §30's
WCAG AA requirement and §5's color intent are both satisfied; where they conflicted,
accessibility won.

Similarly, `--brand-muted` `#72594A` is **banned on dark surfaces** (2.43:1) and replaced
there by a derived `--brand-sand-light` `#C9B2A0` (7.75:1).

---

### D-013 — Repalette to the Figma design: yellow, ink and paper

**Context.** After the first build, the client supplied a Figma design with a different
visual language: a vivid yellow, near-black ink, an off-white paper ground and soft butter
cards, with a heavy geometric sans for display and a **monospace** for all body and UI text.

**Decision.** Adopt it wholesale. The structure, routes, data model, admin and architecture
are untouched — only the design tokens and component styling changed. Fonts moved from
Instrument Serif + Manrope to **Poppins** (600/700/800) + **IBM Plex Mono** (400/500/600),
both self-hosted through `next/font`.

**The measured constraint that shaped the implementation:**

| Pairing | Ratio | Consequence |
| --- | --- | --- |
| ink on yellow | **14.54** | Yellow is an excellent *surface*. |
| ink on paper | **17.90** | Body copy is comfortably AAA. |
| **yellow on paper** | **1.23** | **Yellow can never be text on a light ground.** |
| **terracotta on yellow** | **2.95** | Fails even the 3:1 graphics floor. |

So `--accent` changed meaning: under the old palette it was terracotta, which *could* carry
text; it is now yellow, which cannot. Every `text-[var(--accent)]` was migrated to a neutral
tone during the token swap — had that been done mechanically without checking, the site
would have shipped 1.23:1 text.

**Two consequences worth naming:**

1. **The logo goes ink on the yellow footer.** Its own terracotta is 2.95:1 there. The CSS-mask
   delivery (D-001) made this a one-prop change: `tone="ink"`. Terracotta is retained on light
   neutral surfaces, where it is 3.63:1 and carries the original identity.
2. **The hero needs a structural scrim.** The yellow headline over the brightest sky region of
   the hero photograph is **1.21:1** raw. `.hero-scrim` puts a 42-60% black gradient between
   them, lifting the headline past 3:1 for large display type on every sampled region and the
   white sub-copy past 4.5:1. The scrim is load-bearing, not decoration.

**Typography note.** Monospace body text is a deliberate style choice from the design, not an
accident. It is honoured, with two adjustments: the measure is narrowed to 58ch (mono sets
wider per character) and line-height raised to 1.75-1.8, so long-form copy stays comfortable.

**Font identification is inferred from the screenshot, not from a Figma file.** Poppins and
IBM Plex Mono match the letterforms closely. If the design uses different faces, it is a
two-line change in `src/app/layout.tsx`.

---

### D-014 — Uploaded images are stored in Postgres, not on disk or in object storage

**Context.** The admin needed a real image chooser — pick from a laptop, or from a phone's
photo library. That requires somewhere to put the bytes.

**The option that looks obvious and is wrong:** writing to `public/photography/`. It works
perfectly in development and **silently loses every upload in production**, because
Vercel's filesystem is ephemeral and read-only at runtime. That is the worst class of bug:
invisible locally, data-losing live.

**The option that is usually right:** object storage — Vercel Blob, S3, Cloudinary. It
needs credentials this deployment does not have, and adding a hard dependency the coach
must sign up for and configure before a single photo can be uploaded is a poor trade at
this scale.

**Decision.** Store bytes in Postgres (`MediaAsset.data`), served by
`GET /api/media/[id]`. Zero configuration, works identically in development and on Vercel,
survives deploys, and is included in normal database backups.

**Why this is fine here, stated honestly.** Binaries in a relational database is a real
anti-pattern at scale. At *this* scale it is not: one coach, tens of photographs,
downscaled to ~300KB each — call it 20MB. Neon's smallest tier is 500MB. The usual
objections (bloating backups, hammering the connection pool) do not bite at two orders of
magnitude below the threshold where they start to.

**What keeps it cheap:**

- **Client-side downscaling before upload.** Phone photos are 3-6MB at 4000px. Anything
  large is resized to 2000px and re-encoded as JPEG in the browser — typically 3-5MB down
  to ~300KB. Small images pass through untouched so a compact PNG keeps its transparency.
- EXIF orientation is applied during that resize, so portrait phone photos are not stored
  sideways.
- Bytes are immutable, so the serving route sets `immutable` caching and an ETag; the
  database is hit once per image per client.
- List queries never select `data`.

**Swap path.** `src/server/services/media.ts` is the only module that touches the bytes.
Moving to object storage means changing `createMedia` to PUT and `mediaUrl` to return the
CDN URL — the picker, the forms and every stored reference keep working, because they all
address images by URL string.

**Security, because this accepts user-supplied files:**

- Admin-only upload; `GET /api/media/[id]` is public because these *are* the site's photos.
- **The declared MIME type is never trusted.** The real format is read from magic bytes and
  must both be allow-listed and agree with what the client claimed.
- **SVG is refused** — it is an executable document, and serving user-uploaded SVG from our
  own origin is a stored-XSS vector.
- 6MB hard cap, upload rate-limited, `nosniff` and `Content-Disposition: inline` on serve.

Verified end to end against the live database: 16 checks covering auth, a shell script
renamed `.png`, an SVG with an inline `<script>`, missing alt text, byte-identical
round-trip, and cache headers.

---

### D-015 — `imageUrl` is not a URL

**The bug.** `imageUrl` was `z.string().url()` with `type="url"` on the input. When
photography moved from Unsplash to local files, the seed wrote `/photography/x.jpg`
straight to the database — bypassing the form. So the public site rendered perfectly while
**every coaching offer had become unsaveable**: opening one and pressing Save was rejected
by both the browser and Zod.

It was invisible to the build, invisible to the tests, and invisible to page rendering. It
surfaced only when someone actually tried to edit a record.

**Decision.** A shared `imageRef` schema that accepts what images actually are here:

| Form | Example |
| --- | --- |
| Uploaded | `/api/media/<cuid>` |
| Shipped in `public/` | `/photography/hero-lineup.jpg` |
| Remote, allow-listed | `https://host/path.jpg` |

And rejects: plain `http`, `javascript:`, `data:` URIs, and **protocol-relative `//host`**,
which starts with a slash and looks local but resolves to a third party.

Covered by 12 regression tests so this cannot come back.

---

### D-016 — Packages are their own model, not a flag on CoachingOffer

**Context.** The design has an "Our Packages" section: multi-day bundles (3 days, 5 days, a
full week) with a feature list and a per-person price.

**Decision.** A separate `Package` model.

**Why not a flag on `CoachingOffer`.** The two are sold on different axes. An offer is
priced by *session length* and capped by *participants*; a package is priced by *days* and
lists what is bundled. Squeezing both through one table means `durationMinutes` and
`maxParticipants` are null for every package, `days` is null for every offer, and every
query needs a discriminator. Two small tables are cheaper to reason about than one wide
half-empty one.

Booking still funnels through the existing form: a package card links to
`/contact?package=<slug>`, which pre-writes the message. That deliberately avoids adding a
`packageId` column to `Booking` for what is, today, a sentence the coach reads.

---

### D-017 — Decorative card images take `alt=""`, so the form stops asking

**Context.** The client asked to remove the alt-text field from the coaching form.

**Decision.** Removed — and it is the *correct* accessibility outcome, not a concession.

WCAG 1.1.1 is explicit that a decorative image takes `alt=""`. On a coaching or package
card the title, summary, feature list and price sit directly beside the photograph and
already carry the meaning. Alt text there produces a redundant announcement, which is worse
for a screen-reader user than silence.

So `ImagePicker` gained `showAltText`, and the rule is drawn where it belongs:

| Surface | Alt text | Why |
| --- | --- | --- |
| Gallery | **Required** | The photograph *is* the content |
| Coaching card | `alt=""` | Adjacent text carries the meaning |
| Package card | `alt=""` | Same |
| Testimonial avatar | `alt=""` | The name is right there |

Uploads still record alt text against the `MediaAsset` (derived from the title when the
field is hidden), so the media library stays identifiable.

`showLibrary` and `showUrlInput` were added the same way and switched off outside the
gallery, per the client's request for a simpler form.

---

### D-018 — WhatsApp hand-off, not a WhatsApp API

**Context.** "Booking request should be sent to WhatsApp also."

**Decision.** On success, the booking — already saved — is offered as a one-tap `wa.me`
link with the request written out: reference, name, date, party size, level, format and
message.

**Why not push it server-side.** That needs the WhatsApp Business API: a Meta Business
account, a verified number, an approved message template and per-message billing. None of
that exists here, and standing it up is a business decision, not a code change.

**Why this is genuinely good rather than a fallback.** The message arrives from the
visitor's own number, so the coach can simply reply — a template push from a business
number cannot be answered as a normal conversation. It reaches the coach instantly, it
needs no credentials, and the booking is already in the database whether or not the visitor
taps it.

The link is built server-side from the validated data and the stored number, and returns
`null` when no WhatsApp number is configured, in which case the button is simply absent.

---

### D-019 — Availability and Testimonials removed from the dashboard

**Decision.** At the client's request, both were removed from the admin: navigation, pages,
actions and — for Availability — the service and schema too.

**Availability** was a clean deletion: it had no public surface at all (booking never
enforced it, D-007), so nothing on the site changed.

**Testimonials needs stating plainly.** The admin pages are gone, but the public
`/reviews` page and the homepage testimonials section still render from the database. That
means **reviews can no longer be added or edited from the dashboard.** Right now nothing is
published, so both surfaces show their designed empty state. If reviews are meant to stay
part of the site, the admin needs restoring; if not, the public page and section should be
removed too. Left as-is pending that call rather than deleting public pages that were not
mentioned.

---

### D-020 — The booking form switches between a session and a package

**Context.** The site now sells two different things. One form asking for both, or two
separate forms, would each be worse: the first collects fields that do not apply, the
second duplicates ten identical inputs and two validation paths.

**Decision.** One form, one switch. A radiogroup at the top chooses *Single session* or
*Multi-day package*, and only the fields that apply to that choice are rendered.

| | Single session | Multi-day package |
| --- | --- | --- |
| Coaching format | shown | hidden (a package defines how it runs) |
| Coaching option | shown, optional | hidden |
| Package | hidden | shown, **required** |
| Name, email, date, party size, level, message | shown | shown |

**Radio inputs, not two styled buttons.** Arrow keys move between the options, the current
choice is announced, and the control still submits with JavaScript disabled — none of
which a pair of `<button>`s gives without hand-rolling it.

**Hidden, not disabled.** A field that does not apply is removed from the accessibility
tree entirely rather than being left greyed out for a screen reader to read past.

**Three details worth naming:**

1. **Arriving from a package card pre-switches the form.** `/contact?package=<slug>` starts
   on the package half with that package selected, so the choice already made on the
   previous page is not silently discarded. An unknown slug falls back to Single session
   rather than being echoed back into the page.
2. **The requirement is enforced server-side, not just in the UI.** A `superRefine` rejects
   `bookingType: PACKAGE` with no `packageId`, so a hand-crafted POST cannot create a
   package request the coach is unable to price.
3. **The switch is hidden entirely when no packages are on sale.** A toggle with one real
   option is a confusing control; the value is submitted directly instead.

**Storage.** `Booking.bookingType` is an explicit enum rather than being inferred from
which foreign key is set — both relations are `SetNull`, so deleting a package would
otherwise silently turn a package booking into a session booking. `bookingType` defaults to
`SESSION`, so a payload without it (an older cached client, a no-JS submit) still validates.

The WhatsApp summary and the admin list and detail all name the package where they would
otherwise show the coaching format.

---

### D-021 — The Google reviews integration was removed, and the reviews surfaces hide themselves

**The integration was built, worked correctly, and could never return anything.** Every
billing account created on the Google Cloud project was auto-closed by Google, so the Places
API answered `403 PERMISSION_DENIED` on every request. This was confirmed to be an account
problem rather than a code problem: the same key fails against Google's *own* documentation
example Place ID, which rules out our Place ID, our field mask, our key restrictions and our
fetch. Five billing accounts, all closed, all at $0 spend.

Rather than keep a complete, correct, permanently dead code path in the tree waiting on a
third party, it was deleted:

- `src/server/services/google-reviews.ts` — the Places API client
- `src/components/testimonials/GoogleReviewCard.tsx` — the review card
- the `google` prop and the Google branch of `TestimonialsSection` / `TestimonialsGrid`
- `lh3.googleusercontent.com` from `next.config.ts` (reviewer avatars, now unreachable)
- `GOOGLE_PLACE_ID` / `GOOGLE_PLACES_API_KEY` from `.env` and `.env.example`

Restoring it is a `git revert` away if the billing account is ever reopened; the work is in
the history, not in the working tree. This codebase does not keep dead code (see CLAUDE.md).

**Separately, the reviews surfaces now hide themselves when empty.** With no Google source
and no published testimonials — the Testimonials admin having been removed in D-019 — four
public surfaces were advertising an absence. All four are driven by one predicate,
`hasPublicReviews()` in `src/server/services/reviews.ts`:

| Surface | With nothing published | With one or more |
| --- | --- | --- |
| Homepage section | not rendered | full section |
| `/reviews` | 404 | full page |
| Footer link | dropped | shown |
| Sitemap entry | omitted | included |

**Why a predicate rather than a feature flag.** The condition that hides these surfaces is
exactly the condition that should un-hide them. Reading the same cached source the section
itself reads means the site repairs itself the moment a testimonial is published — no deploy,
no flag anyone has to remember to flip.

**Why 404 and not an empty page.** Serving a header over a blank column is a soft 404:
search engines index a thin page and visitors follow a link to nothing. Dropping the footer
link and the sitemap entry alongside it means no surface on the site, and no entry in
Google's index, points at the route while it is dark.

The designed empty states were removed rather than left unreachable, for the same
no-dead-code reason as above.

**Consequence worth naming.** Publishing a testimonial currently requires database access,
because D-019 removed the Testimonials admin. Reviews therefore cannot return through the
dashboard alone. Restoring that admin section is the remaining piece of work if the coach
wants reviews back on the site without a developer.
