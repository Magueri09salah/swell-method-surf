# Product Requirements Document — Swell Method Surf

**Version** 1.0 · **Status** Approved for build · **Owner** Product
**Business** Swell Method Surf — Surf Coaching, Imsouane, Morocco

---

## 1. Product Vision

Swell Method Surf is an independent surf coach operating out of Imsouane on Morocco's
Atlantic coast. The product is a marketing site and private business console that
positions the coach as a **premium, personal, technique-led alternative** to high-volume
surf camps — and converts that positioning into booked sessions.

The website is not a brochure. It is the coach's entire commercial front door: it must
carry the brand, explain the method, earn trust, take the booking, and then hand the coach
a tool that runs the business day to day.

## 2. Problem

Independent surf coaches lose bookings to camps for three reasons:

1. **No credible digital presence.** Instagram alone reads as a hobby, not a service.
2. **Unclear offer.** Visitors cannot tell what they get, at what level, for what price.
3. **Booking friction.** Inquiries scatter across DMs, WhatsApp and email, so they get
   lost, answered late, or double-booked.

Meanwhile the coach has no single place to see who is coming, when, and what they need.

## 3. Target Users

### Persona 1 — The first-timer

Late twenties, on holiday on the Agadir/Taghazout coast, has never surfed. Anxious about
looking foolish and about safety. Books on emotional trust, not on technical detail.

- **Needs:** reassurance, clarity on what a first session looks like, a human face, simple booking.
- **Fears:** being thrown in with twelve strangers.
- **Decides on:** tone, the coach's face, "first time" being explicitly welcomed.

### Persona 2 — The plateaued intermediate

Surfs two weeks a year. Can stand up and go straight but cannot turn or read a line-up.
Frustrated by group lessons that re-teach the pop-up.

- **Needs:** proof there is a real method, evidence of technical depth, small groups.
- **Decides on:** the Method page and the level labelling on each offer.

### Persona 3 — The technical progresser

Surfs regularly at home, travelling to Imsouane specifically for the long right. Wants a
coach as a peer who gives precise feedback, not a babysitter.

- **Needs:** credibility signals, wave-selection and positioning coaching, flexibility.
- **Decides on:** the depth and specificity of the coaching language. Generic copy loses them.

### Persona 4 — The pair booking together

Couple or friends at mixed levels. One beginner, one intermediate.

- **Needs:** semi-private format, ability to say "we are two at different levels", one booking for both.
- **Decides on:** whether the form lets them express that without sending a separate email.

## 4. Business Goals

| #  | Goal                                       | Measure                                  |
| -- | ------------------------------------------ | ---------------------------------------- |
| B1 | Convert visitors into qualified inquiries  | Booking-request rate at or above 4%      |
| B2 | Reduce admin time per booking              | All inquiries in one queue, < 2 min triage |
| B3 | Command a premium price                    | Zero price-shopping language on the site |
| B4 | Rank for Imsouane surf-coaching intent     | Page 1 for "surf coaching Imsouane"      |
| B5 | Own the client relationship                | Every inquiry becomes a Client record    |

## 5. User Goals

- Understand within five seconds what this is, where it is, and who it is for.
- See the coaching formats, levels, durations and prices without hunting.
- Judge whether the coach is credible and whether they will be looked after.
- Send a booking request in under ninety seconds on a phone.
- Receive a clear confirmation that the request landed and what happens next.

## 6. Functional Requirements

### FR-1 — Public site

Home, About, Method, Coaching, Imsouane, Gallery, Reviews, Contact. All content that
changes (offers, testimonials, gallery, hero and intro copy, contact details) is
database-backed and editable from the admin — never hardcoded in components.

### FR-2 — Booking request

A single-page form capturing name, email, phone/WhatsApp, country, preferred date and
time, party size, experience level, coaching type and a free-text message. Server-side
validated, persisted, rate-limited, and surfaced to the admin as a `PENDING` booking.
Submitting also creates or reuses a `Client` record keyed on email.

### FR-3 — Admin console

Authenticated area at `/admin` with dashboard, bookings queue, client records, coaching
CRUD, availability, testimonials CRUD, gallery CRUD, content editing, messages, settings.

### FR-4 — Booking lifecycle

`PENDING → CONFIRMED → COMPLETED`, plus `CANCELLED` and `REJECTED` as terminal states.
Status changes are admin-only. Any state may move to a terminal state.

### FR-5 — Content management

Key/value content sections addressable by a stable key (for example `home.hero`), edited
through typed forms — not a freeform page builder.

## 7. Non-Functional Requirements

| Area            | Requirement                                                     |
| --------------- | --------------------------------------------------------------- |
| Performance     | LCP < 2.0s on 4G mobile; CLS < 0.05; INP < 200ms                |
| Accessibility   | WCAG 2.1 AA across public site and admin                        |
| Browser support | Last 2 versions of Chrome, Safari, Firefox, Edge; iOS Safari 16+ |
| Responsive      | Intentional layouts at 375 / 390 / 768 / 1024 / 1280 / 1440 / 1920 |
| Security        | See section 13                                                   |
| Maintainability | Strict TypeScript, no `any`, service layer isolates Prisma       |

## 8. Public Website Requirements

- Every page has unique title, description, canonical and Open Graph metadata.
- No page may show lorem ipsum, placeholder names, or fabricated statistics.
- Imagery is replaceable: all photography flows through a single config module.
- Empty states are designed — a site with zero testimonials must still look finished.

## 9. Booking Requirements

- Form is usable and complete on a 375px viewport with one thumb.
- Validation is inline, on blur, with errors adjacent to the field and announced to assistive tech.
- Server rejects any payload failing the Zod schema; client validation is a convenience only.
- Rate limit: 5 submissions per IP per 10 minutes; over-limit returns a friendly message.
- Honeypot field absorbs naive bots without imposing a CAPTCHA on real users.
- Success state replaces the form and states what happens next and when.

## 10. Admin Requirements

- Single admin role for MVP (`ADMIN`); schema supports more roles later.
- Every admin route and every mutating action re-checks the session server-side.
- Bookings list supports search, status filter, sort and pagination.
- Every destructive action is confirmed. Content deletions are hard deletes; bookings are
  never deleted, only moved to `CANCELLED` or `REJECTED`.

## 11. Authentication

Email and password, credentials hashed with bcrypt (cost 12). Session is a signed HS256
JWT in an `httpOnly`, `secure`, `sameSite=lax` cookie with a 7-day expiry. Login is
rate-limited to 5 attempts per IP per 10 minutes. There is no public sign-up: the admin
account is provisioned by seed. See `docs/ARCHITECTURE.md` section 5.

## 12. Content Management

Editable via admin: homepage hero (eyebrow, title, subtitle, CTAs), homepage intro, coach
biography, method sections, Imsouane sections, contact block, social links, WhatsApp
number, footer. Stored as `ContentSection` rows with a typed JSON payload per key.

## 13. Security

- No secrets in client bundles; all reads go through server components and server actions.
- Zod validation on every server action and route handler input.
- Prisma parameterises all queries; no raw SQL with interpolation.
- Rate limiting on all public write endpoints.
- Security headers including HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
- Admin session cookie is `httpOnly` — never readable from JavaScript.
- Generic authentication failure messages, so accounts cannot be enumerated.

## 14. SEO

See `docs/SEO.md`. Summary: per-page metadata, `sitemap.xml`, `robots.txt`, and
`LocalBusiness`, `SportsActivityLocation`, `Person` and `BreadcrumbList` JSON-LD.
No fabricated `aggregateRating` — review markup is emitted only for real stored reviews.

## 15. Analytics Readiness

No analytics vendor is bundled in MVP. A single `<Analytics />` slot exists in the root
layout so a privacy-friendly script can be dropped in without touching pages.

## 16. Accessibility and Performance

Targets are listed in section 7. The audit checklist lives in `docs/QA.md`.

## 17. Future Features (explicitly out of MVP scope)

Online payments · automated availability-driven booking · WhatsApp automation ·
transactional email · surf-forecast integration · client progression tracking ·
video analysis · multilingual (FR/AR) · customer accounts.

The schema and service layer are shaped so these are additive rather than rewrites — see
`docs/ARCHITECTURE.md` section 9.
