# Swell Method Surf

Marketing site and private business console for an independent surf coach in
**Imsouane, Morocco**.

Two jobs: convert visitors into booking requests, and give the coach one place to run the
business.

---

## Quick start

```bash
npm install
cp .env.example .env          # then fill in the Neon URLs and AUTH_SECRET
npm run db:push               # or db:migrate once you have a migration history
SEED_ADMIN_PASSWORD='choose-a-real-password' npm run db:seed
npm run dev
```

Public site → http://localhost:3000
Admin → http://localhost:3000/admin

## Stack

Next.js 16 (App Router) · React 19 · TypeScript 5.7 strict · Tailwind CSS v4 ·
Prisma 6 → Neon PostgreSQL · Zod 4 · `jose` + `bcryptjs` · Radix Dialog · Vitest · Vercel.

## Commands

| Command             | What it does                                    |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Development server                              |
| `npm run build`     | `prisma generate` then `next build`             |
| `npm run typecheck` | `tsc --noEmit`                                  |
| `npm run lint`      | ESLint                                          |
| `npm test`          | Vitest                                          |
| `npm run db:migrate`| Create and apply a migration (dev)              |
| `npm run db:seed`   | Seed — requires `SEED_ADMIN_PASSWORD`           |
| `npm run db:studio` | Browse the data                                 |

**All four gates must pass before shipping:** `typecheck`, `lint`, `test`, `build`.

## Documentation

| Document                     | Contents                                                |
| ---------------------------- | ------------------------------------------------------- |
| `CLAUDE.md`                  | Conventions and rules for anyone working in the repo     |
| `docs/PRD.md`                | Vision, personas, requirements, scope                    |
| `docs/ARCHITECTURE.md`       | Layering, rendering, auth, extensibility                 |
| `docs/DESIGN_SYSTEM.md`      | Brand, colour (with measured contrast), type, motion     |
| `docs/DATABASE.md`           | Schema conventions, relations, migrations                |
| `docs/USER_FLOWS.md`         | Booking path, admin triage, failure paths                |
| `docs/ADMIN.md`              | Console IA and behaviour                                 |
| `docs/SEO.md`                | Metadata, structured data, launch checklist              |
| `docs/DEPLOYMENT.md`         | Vercel + Neon, env vars, verification, rollback          |
| `docs/QA.md`                 | What was tested, results, and what was **not** tested    |
| `docs/DECISIONS.md`          | Every judgement call, with reasoning                     |
| `design-system/`             | Machine-readable tokens, component specs, guidelines     |

**Read `docs/DECISIONS.md` before changing anything that looks unusual** — it is probably
deliberate and the reasoning is recorded.

## Architecture in one diagram

```
Server Component → Server Action → Service layer → Prisma → Neon
```

Prisma is imported in exactly two places: `src/server/db.ts` and `src/server/services/*`.
`server-only` enforces this at build time. Services return DTOs, never Prisma models.

Every admin server action independently calls `requireAdminOrFail()`. Middleware is UX
only — it is not the security boundary.

## Before launch

1. Replace placeholder photography in `src/lib/media.ts` (D-010).
2. Delete the seeded sample testimonials and add real ones.
3. Set `NEXT_PUBLIC_SITE_URL` to the production origin — this drives every canonical and
   OG URL.
4. Enter real contact details in Admin → Settings.
5. Work through `docs/DEPLOYMENT.md` §4 and `docs/QA.md` §8.

## Things this project will not do

Fabricated testimonials, invented business facts in structured data, fake surf statistics,
invented coach credentials, or lorem ipsum in shipped UI. The seed enforces the first of
these by writing sample reviews as unpublished. See `CLAUDE.md` § Honesty rules.
