# CLAUDE.md — Swell Method Surf

Guidance for any AI agent or developer working in this repository.

## Project

Marketing site and private business console for **Swell Method Surf**, an independent surf
coach in **Imsouane, Morocco**. It has two jobs: convert visitors into booking requests,
and give the coach one place to run the business.

Full requirements: `docs/PRD.md`.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript 5.7 strict · Tailwind CSS v4 ·
Prisma 6 → Neon PostgreSQL · Zod 4 · `jose` + `bcryptjs` auth · Radix Dialog ·
`lucide-react` · Vitest · Vercel.

## Commands

```bash
npm run dev          # development server
npm run build        # prisma generate + next build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm test             # vitest run
npm run db:migrate   # create + apply a migration (dev)
npm run db:seed      # seed (requires SEED_ADMIN_PASSWORD)
npm run db:studio    # browse data
```

**Before calling any change done, all four must pass:** `typecheck`, `lint`, `test`,
`build`.

## Architecture — the rules that matter

```
Server Component → Server Action → Service layer → Prisma → Neon
```

1. **Prisma is imported in exactly two places:** `src/server/db.ts` and
   `src/server/services/*`. Never in `src/app/` or `src/components/`. `server-only` is
   installed and enforces this at build time.
2. **Services return DTOs, not Prisma models.** `Decimal → number` and `Date → ISO string`
   happen at the service boundary, so nothing non-serialisable reaches a client component.
3. **Every admin server action starts with `requireAdminOrFail()`.** Middleware is UX
   only — a server action is directly invocable and does not necessarily traverse a page's
   middleware. The check at the point of work is the real boundary.
4. **Server actions return `ActionResult<T>`; they never throw across the boundary.**
5. **Client components are the exception.** Add `"use client"` only for genuine
   interaction. Everything else stays a server component.

Detail: `docs/ARCHITECTURE.md`.

## Design system

`docs/DESIGN_SYSTEM.md` is the source of truth. Runtime tokens: `src/app/globals.css`
(Tailwind v4 `@theme`). Machine-readable: `design-system/tokens/`. **Keep all three in
sync.**

The palette and typography come from the client's Figma design (DECISIONS.md D-013).

Non-negotiables:

- **Never use `--color-yellow` as text on a light surface.** Yellow on paper measures
  **1.23:1**. It is a SURFACE (with ink on it) or a label on ink — never text on white,
  paper or butter.
- **Never use `--color-terracotta` on yellow** — 2.95:1, below even the graphics floor.
  The logo goes `tone="ink"` on yellow surfaces.
- **Never remove `.hero-scrim`.** The yellow hero headline over the photograph is
  **1.21:1** without it. The scrim is structural, not decoration.
- Reference **semantic tokens** (`--text-primary`, `--surface-soft`), not raw hex.
- Two font families only: Poppins (display, 600/700/800) and IBM Plex Mono (all body
  and UI). Body text is monospace by design.
- Measure is **58ch**, not 65–75ch — monospace sets wider per character.
- Buttons and tags are **pills** with tracked uppercase mono labels.
- Borders and colour blocks before shadows. Shadows are near-absent.
- Motion is swell, not spring: long, soft, single-direction, `transform`/`opacity` only.

**Banned** (from the brief and design review): glassmorphism, purple/blue gradients,
heavy shadows, grids of identical cards, generic SaaS dashboard chrome, emoji as icons,
neon, dark mode (D-006).

## Conventions

**Content.** Anything the coach can edit lives in the database (`ContentSection`,
`SiteSetting`), never hardcoded in a component. `src/lib/constants.ts` holds structure;
content defaults live in `src/lib/validation/content.ts`.

**Validation.** Zod schemas in `src/lib/validation/` are shared by client and server. The
server **always** re-parses. Client validation is UX only.

**Images.** All photography flows through `src/lib/media.ts` — one map, one place to swap
files. The photographs are the coach's own, in `public/photography/`, with intrinsic
dimensions recorded so `next/image` reserves the right box. Alt text must describe what is
genuinely in the frame. Remote hosts must be allow-listed in `next.config.ts`.

**Accessibility is a build requirement, not a polish pass.** Visible labels, errors below
the field with `role="alert"`, focus never removed, 44px touch targets, status never
carried by colour alone, `prefers-reduced-motion` honoured.

**Empty states are designed.** Every list renders something intentional when empty.

**JSON-LD goes through `<JsonLd>`** (`src/components/seo/JsonLd.tsx`), which escapes
`<`, `>` and `&`. Never call `dangerouslySetInnerHTML` directly — structured data embeds
admin-authored strings.

**Naming.** Components PascalCase; utilities camelCase; routes kebab-case; database enums
SCREAMING_CASE with human labels in `constants.ts`.

## Honesty rules — do not break these

The brief forbids fabricated content, and the codebase enforces it:

- **No invented testimonials.** Seeded samples are `published: false` so they cannot reach
  the public site.
- **No fabricated business facts** in structured data — no `aggregateRating`, no invented
  address, no invented opening hours. Omit rather than guess.
- **No invented surf statistics, wave heights, water temperatures, or coach credentials.**
- **No lorem ipsum or "John Doe" in shipped UI.**

If asked to add any of the above, say so and propose the honest alternative.

## Known limitations

Documented with rationale in `docs/DECISIONS.md`:

- D-001 the supplied logo was missing; `Logo.tsx` holds a stand-in SVG.
- D-005 rate limiting is in-memory and does not survive scale-out.
- D-007 booking is an inquiry; availability does not gate it.
- D-010 photography is placeholder, replaceable via `src/lib/media.ts`.
- No transactional email; no password reset; no dark mode; no multilingual.

## Skills used

`ui-ux-pro-max` was consulted for the design system. Its generated recommendation —
*Liquid Glass* style, green accent, Calistoga display — was **rejected**; see DECISIONS.md
D-002. Its accessibility rules, touch-target minimums and motion timings were adopted.

## Working style

- Read `docs/DECISIONS.md` before changing anything that looks odd — it is probably
  deliberate and the reasoning is recorded.
- When accessibility and the brief's aesthetic instructions conflict, accessibility wins,
  and the conflict gets a DECISIONS entry.
- Prefer deleting to adding. This codebase has no dead code and should keep it that way.
