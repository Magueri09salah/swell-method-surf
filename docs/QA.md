# QA Report — Swell Method Surf

This records what was **actually executed**, with results, and — just as importantly —
what was **not** verified and why. Nothing below is claimed on the basis of "it should
work".

## 1. Automated gates (all executed, all passing)

| Gate                | Command             | Result                                    |
| ------------------- | ------------------- | ----------------------------------------- |
| Type check          | `npx tsc --noEmit`  | **Pass**, 0 errors. Strict mode, no `any`. |
| Unit tests          | `npx vitest run`    | **Pass**, 50/50 across 2 files             |
| Lint                | `npx eslint .`      | **Pass**, 0 errors, 0 warnings             |
| Production build    | `npx next build`    | **Pass**, 14 static pages, 0 errors        |

TypeScript runs with `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride` and
`noFallthroughCasesInSwitch`. ESLint treats `@typescript-eslint/no-explicit-any` as an
**error**, not a warning.

### Test coverage

Business logic, not framework glue:

- Booking validation — 16 cases: valid payload, email normalisation, numeric coercion
  from FormData, past dates, same-day (allowed), > 1 year out, invalid email, party size
  bounds, unknown enum, omitted optionals, over-long message, honeypot filled/empty,
  and two regression cases for the acknowledgement checkbox (see section 6).
- Booking status machine — 6 cases: forward path, terminal reachability, refusing to skip
  confirmation, refusing to move backwards, terminal finality, no-op transitions.
- Admin validation — coaching offers (slug format, negative price, duration bounds,
  currency length), gallery (**alt text required**), testimonials (rating bounds),
  availability slots (end after start, time format), login, settings.
- Content schemas — every shipped default validates against its own schema, so a default
  cannot silently drift and make `getContent()` fall back on every request.
- Rate limiting — under limit, over limit, per-key isolation, window expiry.
- Utilities — reference generation (200 iterations, no ambiguous characters), accented
  slugification, duration formatting.

## 2. Runtime verification (executed against a production build)

Server started with `next start`; every route requested.

**Route status codes — all as intended:**

```
200  /            200  /method     200  /coaching   200  /imsouane
200  /about       200  /gallery    200  /reviews    200  /contact
200  /sitemap.xml 200  /robots.txt 200  /admin/login
307  /admin  → /admin/login        404  /nonexistent
```

**Admin protection — all 10 top-level admin routes redirect when signed out:**

```
/admin, /admin/bookings, /admin/clients, /admin/coaching, /admin/settings,
/admin/content, /admin/gallery, /admin/messages, /admin/availability,
/admin/testimonials   →  307 /admin/login?from=<path>
```

**Security headers present on every response:**

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Powered-By: (absent — confirmed removed)
```

**Rendered HTML audit of `/`:**

| Check                              | Result                                   |
| ---------------------------------- | ---------------------------------------- |
| `<title>`                          | Unique, page-specific                    |
| `<h1>` count                       | 1 (with 9 `h2` — no level skipped)       |
| Meta description                   | Present, page-specific                   |
| Canonical                          | Present, absolute                        |
| Open Graph / Twitter               | Present                                  |
| `lang="en"`                        | Present                                  |
| Viewport meta                      | Present, zoom **not** disabled           |
| Skip-to-content link               | Present, first focusable element         |
| Images missing `alt`               | **0 of 5**                               |
| JSON-LD parses as valid JSON       | Yes                                      |
| Raw `<` / `>` inside JSON-LD       | **None** — escaping verified             |
| External script/style hosts        | **None** — fonts fully self-hosted       |

## 2a. Design v2 verification (executed)

The palette and typography were replaced with the client's Figma design. Verified after:

| Check | Result |
| --- | --- |
| Stale v1 tokens left in source | **0** (cream, shell, brown, sand, terracotta-dark/deep/lift, photo-warm, rounded-arch) |
| `text-[var(--color-yellow)]` occurrences | 3 — each confirmed on an **ink** surface (14.54:1) |
| Yellow used as text on a light ground | **0** — this would be 1.23:1 |
| Poppins + IBM Plex Mono loading | Both, self-hosted, zero external font hosts |
| Hero scrim present | Yes — without it the headline is 1.21:1 |
| Photographs served | 16 local files, all resolve, 0 remote hosts |
| Database rows pointing at a remote host | **0** |
| Database rows pointing at a missing file | **0** |
| Homepage images missing alt | **0 of 15** |
| All public routes | 200; `/admin` 307 to login; unknown 404 |

**The failure this audit was designed to catch:** `--accent` changed meaning between v1
and v2. It was terracotta (usable as text); it is now yellow (1.23:1 on paper). A purely
mechanical token rename would have shipped unreadable text across the site. Every
`text-[var(--accent)]` was migrated to a neutral tone and then re-audited.

## 2b. Brand asset verification (executed)

The supplied artwork was decoded pixel by pixel rather than colour-picked by eye.

| Check | Result |
| --- | --- |
| Master artwork | 781x940 RGBA, transparent background |
| Most common opaque colour | **`#BF7047`** — 14.1% of opaque pixels |
| Match to `--brand-terracotta` | **Exact.** No token change required |
| Next 7 dominant colours | Anti-aliasing neighbours within +/-2 per channel |
| Emblem crop bounds | Rows 46-517, found from the artwork's own blank rows |
| Mask files valid | Emblem 42.7% opaque / 50.2% transparent; full lockup 28.2% / 66.2% |
| Grey plane uniform (compressibility) | Yes, both files |
| Size reduction | 151KB -> 16KB and 267KB -> 36KB (**~89%**) |

Live asset responses all 200 with `image/png`: `/brand/logo-emblem.png`,
`/brand/logo-full.png`, `/brand/logo-emblem-color.png`, `/icon.png`, `/apple-icon.png`,
`/opengraph-image` (1200x630).

Note: the artwork contains **no cream** — the background is transparent (539,411
transparent pixels, 3 near-white). `--brand-cream` therefore comes from the brief's
specification, not from the file, and could not be pixel-verified.

## 3. Colour contrast (computed, not eyeballed)

Every brand pairing was measured against WCAG 2.1. Two findings changed the design:

**Finding 1 — terracotta cannot be a button fill.** Cream on `#BF7047` = **3.18:1**;
white on it = **3.73:1**. Both fail AA for button labels. All solid interactive fills now
use `--interactive` `#8A4E35` (**5.54:1** / **6.52:1**). Terracotta is retained for
decoration, hairlines, icons and display type ≥ 24px, where 3:1 suffices.

**Finding 2 — muted brown is unusable on dark surfaces.** `#72594A` on `#2B211C` =
**2.43:1**, a hard fail. Dark sections now use a derived `--brand-sand-light` `#C9B2A0`
(**7.75:1**).

Also corrected: the initial warning tone measured 3.97:1 on cream and was darkened to
`#855A17` (**5.14:1**).

Body text pairings clear AA and mostly AAA: brown/cream **13.36:1**, brown/white
**15.02:1**, muted/cream **5.51:1**, cream/brown **13.36:1**.

Recorded in DESIGN_SYSTEM.md §2.2 and DECISIONS.md D-012.

## 4. Accessibility measures implemented

- Skip link, first tab stop on every page.
- Focus never removed — a global `:focus-visible` ring at 2px with 2px offset.
- Semantic landmarks; one `<main>` per page; `<nav aria-label>`.
- Forms: visible labels (never placeholder-only), persistent helper text, errors **below**
  the field with an icon, `aria-describedby`, `aria-invalid`, `role="alert"`, and focus
  moved to the first invalid field on submit failure.
- Status is never carried by colour alone — every `Badge` pairs tone with an icon.
- Star ratings expose `role="img"` with an accessible name ("4 out of 5") instead of five
  icons.
- Mobile menu and gallery lightbox are Radix Dialogs: focus trapped, `Escape` closes,
  focus restored to the trigger.
- Touch targets ≥ 44×44; form controls ≥ 44px tall with 16px text (no iOS auto-zoom).
- `prefers-reduced-motion` honoured globally; reveals render at final state.
- **Content is visible by default** — the reveal system only hides once JS confirms
  IntersectionObserver support, so a JS failure can never hide content.
- Zoom is not disabled (`maximumScale: 5`).

## 5. Performance measures implemented

- Fonts self-hosted via `next/font`, `display: swap`, two families only.
- Hero image `priority` + `fetchPriority="high"`; all others lazy.
- `next/image` throughout with explicit `sizes`; AVIF/WebP enabled.
- Public pages statically rendered with 1-hour revalidate and tag invalidation.
- Client components limited to genuine interaction: mobile nav, booking form, gallery
  lightbox, admin forms/tables, reveal wrapper. Everything else is a server component.
- Scroll reveal is ~40 lines of IntersectionObserver rather than a motion library —
  roughly 35KB gzipped saved on every page (DECISIONS.md D-009).
- Only `transform` and `opacity` are animated.
- Skeletons match final dimensions to protect CLS.
- Grain texture is an inlined data-URI — no request.

## 6. Defects found and fixed during this audit

Recorded because a QA document that reports only successes is not a QA document.

**D-A · The booking acknowledgement checkbox was not enforced.** The form sets
`noValidate` so it can present its own errors, which means the input's `required`
attribute is inert — and the field was absent from the Zod schema entirely. A visitor
could submit without ever confirming they understood this was a request rather than a
confirmed session.

The first fix was also wrong, and the test suite proved it: `z.string().optional()
.refine(...)` **passed** for an absent checkbox, because Zod skips refinements when the
value is `undefined`. Verified directly, then corrected to
`z.preprocess((v) => v === "on", z.literal(true))`, which rejects absent, `""` and
`"off"`. Two regression tests now cover it, and the error is wired through
`CheckboxField` with `role="alert"`.

**D-B · `next.config.ts` claimed a strict CSP that did not exist.** The comment described
a Content-Security-Policy; no CSP header was actually sent. A real policy was added, and
its limitation is now stated honestly in the comment rather than overclaimed: `script-src`
still needs `'unsafe-inline'` for Next's bootstrap scripts, so this is hardening, not
XSS-proofing. Nonce-based CSP is the documented follow-up.

Verified live: the CSP header is present with `frame-ancestors 'none'`, `object-src
'none'`, `base-uri 'self'`, `form-action 'self'`, and `img-src` limited to the two
allow-listed hosts.

**D-C · The build failed hard when the database was unreachable.** See section 7 below.

**D-E · The Open Graph card overflowed.** The headline used `maxWidth: "15ch"`. Satori —
the renderer behind `ImageResponse` — does not support `ch` units, so the width collapsed
and every word wrapped onto its own line, running off the bottom of the card. Caught by
actually rendering the route and looking at the PNG, not by reading the code. Fixed with a
pixel width. A reminder that a build passing is not the same as output being correct.

**D-F · Stale cache masked live data.** After seeding, `/coaching` rendered zero offers
while the database held six. `unstable_cache` had persisted empty results from the earlier
database-less builds into `.next/cache`, with a one-hour revalidate. Clearing `.next`
fixed it. Worth knowing operationally: after changing data availability, clear the build
cache or the stale entry wins.

**D-D · ESLint could not run at all.** The initial flat config used the `FlatCompat`
shim, which throws a circular-structure error against `eslint-config-next` 16. That
config ships native flat configs; the shim was removed. Four genuine errors it then
surfaced — a `setState` inside an effect in `Reveal`, two unused imports, and an
unjustified raw anchor — were all fixed rather than suppressed. `Reveal` was rewritten to
drive the DOM through a ref, which also removed a render cycle per revealed element.

## 7. Resilience

The build initially **failed hard** when the database was unreachable. Fixed via
`safeRead()`: public read paths return documented fallbacks and log at error level; the
site renders shipped default copy and designed empty states instead of a 500.

Deliberately narrow — `safeRead` is **not** used for admin reads (the coach must see real
errors, not silently empty lists that could lead them to re-create existing data) and
never for writes.

## 8. Not verified — and why

Stated honestly rather than implied:

- ~~No live database~~ — **now resolved.** Neon is connected, `migrate` and `seed` have
  run, and 12 end-to-end checks passed against it: booking persistence, email
  normalisation, client deduplication on repeat bookings, status transition with price
  snapshotting, note authorship, bcrypt verification (correct accepted, wrong rejected,
  hash not plaintext), and cascade cleanup. Public pages were confirmed rendering real
  seeded data with **zero** `safeRead` fallbacks during build.
- **No browser automation was run.** Keyboard journeys, focus order and the mobile menu
  are implemented per the contract in §4 and follow Radix's tested primitives, but have
  not been driven in a real browser.
- **No Lighthouse / axe run.** The performance and accessibility work above is
  implementation, not measurement. Run both against the deployed site.
- **No visual regression testing** at the seven target breakpoints. Layouts are written
  mobile-first with intentional per-breakpoint structure, but have not been screenshotted.
- ~~Prisma migrations not applied~~ — **now resolved.** `prisma/migrations/20260821180649_init/`
  exists and is applied against Neon.

## 9. Recommended next steps

1. Provision Neon, run `db:migrate` and `db:seed`, then execute DEPLOYMENT.md §4.
2. Run Lighthouse and axe DevTools on `/` and `/contact`.
3. Keyboard-test the booking form and gallery lightbox in a real browser.
4. Screenshot at 375 / 390 / 768 / 1024 / 1280 / 1440 / 1920.
5. Replace placeholder photography and the stand-in logo.
6. Delete the seeded sample testimonials and add real ones.
