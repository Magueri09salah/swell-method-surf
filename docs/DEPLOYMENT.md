# Deployment — Swell Method Surf

Target: **Vercel** + **Neon PostgreSQL**.

## 1. Environment variables

Every variable, what it is for, and where it comes from. Full annotated copy in
`.env.example`.

| Variable               | Required   | Scope             | Source                                          |
| ---------------------- | ---------- | ----------------- | ----------------------------------------------- |
| `DATABASE_URL`         | Yes        | Runtime           | Neon → Connection string → **Pooled**           |
| `DIRECT_URL`           | Yes        | Migrations only   | Neon → Connection string → **unpooled**        |
| `AUTH_SECRET`          | Yes        | Runtime           | `openssl rand -base64 32` (≥ 32 chars)          |
| `NEXT_PUBLIC_SITE_URL` | Yes        | Build + runtime   | Production origin, **no trailing slash**        |
| `SEED_ADMIN_EMAIL`     | Seed only  | Local/one-off     | The coach's login email                         |
| `SEED_ADMIN_PASSWORD`  | Seed only  | Local/one-off     | Chosen by the coach, ≥ 10 chars                 |

Notes:

- `AUTH_SECRET` shorter than 32 characters makes the app **throw on boot**, deliberately.
  A weak signing key is a forgeable session cookie, not a degraded mode.
- The two seed variables are read only by `prisma/seed.ts`. Do **not** add them to Vercel
  runtime environment unless you are running the seed from CI.
- `NEXT_PUBLIC_SITE_URL` is baked into canonicals, OG tags and the sitemap at build time.
  Getting it wrong points the whole site at localhost.

## 2. Neon setup

1. Create a project (region **eu-central-1** is closest to Morocco of the common Neon
   regions — pick the nearest available to minimise round-trip latency).
2. Copy **both** connection strings — pooled and direct. Both are needed; see
   `docs/DATABASE.md` §1.
3. Append `?sslmode=require&pgbouncer=true` to the pooled URL.
4. Enable autosuspend for cost control; the first request after a suspend pays a cold
   start of roughly a second.

## 3. First deployment

```bash
# 1 — push the schema and seed, from your machine, against production
#     (set DATABASE_URL / DIRECT_URL to the Neon values in .env first)
npm run db:deploy          # or db:push if you have no migration history yet
SEED_ADMIN_PASSWORD='<a real password>' npm run db:seed

# 2 — deploy
vercel --prod
```

Vercel settings:

| Setting          | Value                                            |
| ---------------- | ------------------------------------------------ |
| Framework        | Next.js (auto-detected)                          |
| Build command    | `npm run build` (runs `prisma generate` first)   |
| Install command  | `npm ci`                                         |
| Node version     | 22.x                                             |
| Region           | `fra1` or `cdg1` — keep it near the Neon region  |

**`prisma generate` must run in the build.** It is already wired into the `build` script,
because Vercel's dependency cache can otherwise serve a stale Prisma client.

## 4. Post-deployment verification

Run this list against the live domain, in order:

1. `/` returns 200 and shows real content from the database, not the shipped defaults.
   (Defaults appearing means the app cannot reach Neon — check `DATABASE_URL`.)
2. `/sitemap.xml` and `/robots.txt` return 200 and reference the **production** domain.
3. `/admin` redirects to `/admin/login`.
4. Signing in works; the dashboard loads.
5. Submit a real booking request from `/contact`; confirm it appears in Admin → Bookings.
6. Edit Admin → Content → Homepage Hero; confirm the change appears on `/` immediately.
7. Check response headers include HSTS, `X-Frame-Options: DENY` and `nosniff`.
8. Confirm `X-Powered-By` is absent.
9. Run Lighthouse on `/` — mobile, throttled.
10. Set the real contact details in Admin → Settings, or the footer stays in its
    (designed, but empty) fallback state.

## 5. Rollback

Vercel keeps immutable deployments — promote a previous one to roll back application code
instantly.

**Database changes do not roll back with it.** Never edit an applied migration; always
roll forward with a new one. Before any destructive migration, take a Neon branch or
snapshot.

## 6. Operational levers

| Situation                        | Action                                                        |
| -------------------------------- | ------------------------------------------------------------- |
| Sign every session out           | Rotate `AUTH_SECRET` and redeploy                             |
| Coach forgot the password        | Re-run the seed with a new `SEED_ADMIN_PASSWORD`              |
| Public site showing default copy | Database unreachable — check Neon status and `DATABASE_URL`   |
| Content edit not appearing       | Confirm the save succeeded; `updateTag` fires on success only |
| Booking form rejecting everyone  | Check the rate limiter is not keyed on a shared proxy IP      |

## 7. Known limitations at launch

Stated plainly so they are decisions rather than surprises:

- **Rate limiting is in-memory** and does not hold across serverless instances
  (DECISIONS.md D-005). Swap in Upstash Redis inside `src/server/rate-limit.ts` — one file.
- **No transactional email.** The coach is notified by checking the dashboard. Hook a
  provider into `createBookingRequest()` — the single funnel for inbound bookings.
- **No password reset flow.** Recovery is via re-seeding.
- **Photography is placeholder.** Replace the map in `src/lib/media.ts` and the seeded
  gallery URLs before launch (DECISIONS.md D-010).
- ~~Logo is a stand-in~~ — **resolved.** The supplied artwork is in use across header,
  footer, admin, favicon, touch icon and the Open Graph card (DECISIONS.md D-001).
- **Sample testimonials ship unpublished** and must be deleted and replaced with real
  feedback.
