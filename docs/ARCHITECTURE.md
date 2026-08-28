# Architecture — Swell Method Surf

## 1. Stack

| Layer      | Choice                                    |
| ---------- | ----------------------------------------- |
| Framework  | Next.js 16 (App Router), React 19         |
| Language   | TypeScript 5.7, `strict` + `noUncheckedIndexedAccess` |
| Styling    | Tailwind CSS v4 (CSS-first `@theme`)      |
| Primitives | Radix UI (dialog only) + hand-built components |
| Icons      | `lucide-react`                            |
| Data       | Prisma 6 → Neon PostgreSQL                |
| Validation | Zod 4                                     |
| Auth       | Custom: bcrypt + `jose` HS256 JWT cookie  |
| Tests      | Vitest                                    |
| Hosting    | Vercel                                    |

## 2. Layering

```
React Server Component  (renders; never touches Prisma directly)
        │
        ├── Server Action        ← mutations, "use server"
        └── Route Handler        ← only where a real HTTP endpoint is needed
        │
   Service layer  (src/server/services/*)   ← the only place Prisma is imported
        │
   Prisma Client  (src/server/db.ts singleton)
        │
   Neon PostgreSQL
```

**The single hard rule:** `@prisma/client` may only be imported by `src/server/db.ts` and
files under `src/server/services/`. Nothing in `src/app/` or `src/components/` imports
Prisma. This keeps the data layer swappable and testable, and guarantees no Prisma types
leak into client bundles.

Services return **DTOs**, not Prisma models. `Decimal` is converted to `number` and
`Date` to ISO strings at the service boundary, so nothing non-serialisable crosses into
a client component.

## 3. Directory layout

```
src/
  app/
    (site)/            Public site — shared marketing layout
      page.tsx           /
      about/ method/ coaching/ imsouane/ gallery/ reviews/ contact/
    admin/
      (auth)/login/     Unauthenticated login (own layout)
      (dashboard)/      Authenticated shell — layout guards every child
        page.tsx bookings/ clients/ coaching/ availability/
        testimonials/ gallery/ content/ messages/ settings/
    api/                Route handlers (health only in MVP)
    sitemap.ts robots.ts manifest.ts opengraph-image.tsx
    not-found.tsx global-error.tsx
  components/
    ui/ layout/ navigation/ sections/ booking/ gallery/
    testimonials/ coaching/ admin/ forms/
  lib/                  Framework-agnostic: utils, validation, seo, constants
  server/
    db.ts               Prisma singleton
    auth/               session, password, guards
    services/           booking, client, coaching, testimonial,
                        gallery, content, settings, availability, dashboard
    actions/            "use server" entrypoints
    rate-limit.ts
```

Route groups `(site)` and `(dashboard)` exist so the public site and the admin can have
completely different layouts and fonts loading without nesting one inside the other.

## 4. Rendering strategy

| Route                | Strategy                          | Rationale                       |
| -------------------- | --------------------------------- | ------------------------------- |
| Public pages         | Dynamic + `unstable_cache` tags   | DB-backed but effectively static |
| `/admin/**`          | `force-dynamic`                   | Per-request auth, never cached  |
| `sitemap` / `robots` | Static                            | —                               |

Public reads are wrapped in `unstable_cache` with tags (`coaching`, `testimonials`,
`gallery`, `content`, `settings`). Admin mutations call `revalidateTag()`, so the public
site updates immediately after an edit without any page being rebuilt manually.

Client components are the exception, not the rule. Only these are `"use client"`:
mobile nav, booking form, gallery lightbox, testimonial carousel, admin tables/filters,
reveal wrapper, toast host, confirm dialog.

## 5. Authentication and authorization

**Flow.** `POST` login server action → rate-limit check → lookup user by email →
`bcrypt.compare` (always executed, even for unknown emails, to avoid a timing oracle) →
sign HS256 JWT `{ sub, email, role }` with 7-day expiry → set cookie.

**Cookie.** `swell_session`, `httpOnly`, `secure` in production, `sameSite=lax`,
`path=/`, `maxAge` 7 days. `sameSite=lax` combined with the fact that all mutations are
POST-only server actions gives CSRF protection; Next.js additionally verifies the `Origin`
header for server actions.

**Defence in depth — three layers:**

1. `middleware.ts` — rejects unauthenticated `/admin/*` requests at the edge and
   redirects to login. Cheap, but treated as UX only, never as the security boundary.
2. `(dashboard)/layout.tsx` — calls `requireAdmin()` server-side; every admin page is
   a child, so no page can be reached without passing this.
3. **Every server action** independently calls `requireAdmin()` before doing any work.

Layer 3 is the actual security boundary. Middleware alone is never trusted, because a
server action is directly invocable and does not necessarily traverse the page's middleware.

**Password storage.** bcrypt cost 12. Hashes never leave the service layer; the session
DTO exposes only `id`, `email`, `name`, `role`.

## 6. Validation

Zod schemas in `src/lib/validation/` are shared by client and server. Server actions
re-parse every input with `safeParse` and return a typed
`{ ok: false, fieldErrors }` result — client-side validation is treated purely as UX.

Public form payloads are additionally length-capped before parsing to stop oversized-body
abuse.

## 7. Error handling

- Server actions return a discriminated union `ActionResult<T>`; they never throw across
  the boundary.
- `error.tsx` per route segment, plus a root `global-error.tsx`.
- `not-found.tsx` is brand-designed, not a bare 404.
- Every async list has `loading.tsx` with a skeleton matching final layout dimensions
  (protects CLS).
- Every list has a designed empty state with a next action.
- Unexpected server errors are logged server-side; the client receives a generic message
  with a retry path — internals are never surfaced.

## 8. Rate limiting

In-memory fixed-window limiter keyed by IP (`src/server/rate-limit.ts`), applied to the
booking form, the contact message action and login.

**Known limitation, accepted for MVP:** in-memory state does not survive across serverless
instances, so the limit is best-effort under scale-out. It stops casual abuse and bots. The
module exposes a single `checkRateLimit()` function so swapping in Upstash Redis later is a
one-file change. Documented as D-005.

## 9. Extensibility

The MVP was shaped so the deferred features in PRD §17 are additive:

- **Payments** — `Booking` already carries `priceQuoted`/`currency`; add a `Payment` table.
- **Automated availability** — `AvailabilityDay`/`AvailabilitySlot` exist and are admin-managed.
  Booking currently ignores them; a future validator reads the same tables.
- **Notifications** — booking creation funnels through one service function
  (`createBookingRequest`), the single place to add email/WhatsApp dispatch.
- **Multilingual** — content already lives in `ContentSection` rows keyed by string; add a
  `locale` column and a `[locale]` route segment.
