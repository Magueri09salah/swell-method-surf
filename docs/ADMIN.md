# Admin Console — Swell Method Surf

Private business console at `/admin`. Built for one person doing a real job, not for a
dashboard screenshot.

## 1. Information architecture

```
Dashboard              what needs attention, what is coming up
│
├── Bookings           all · filter by status · search · paginated
│   └── [id]           detail, status, scheduling, notes, contact
├── Clients            searchable, paginated
│   └── [id]           record + editable details + booking history
├── Coaching           CRUD, reorder, activate/deactivate
├── Availability       mark days, add time slots
├── Testimonials       CRUD, publish/unpublish, feature
├── Gallery            CRUD, reorder, publish/unpublish
├── Content            typed section editors
├── Messages           general enquiries (read/archive/delete)
└── Settings           business, contact, booking, SEO defaults
```

Navigation is organised by **business task**, not by database table. "Availability" and
"Content" are not entities the coach thinks about — they are jobs.

## 2. Dashboard

The brief asks the dashboard to answer five questions immediately. It answers exactly
those and adds nothing else:

| Question                         | Answered by                                   |
| -------------------------------- | --------------------------------------------- |
| What needs attention?            | "New requests" KPI, outlined when > 0          |
| What sessions are coming up?     | "Upcoming sessions" list, date-ordered         |
| How many clients do I have?      | "Clients" KPI                                  |
| What inquiries are new?          | "Recent requests" table                        |
| What is happening this week?     | Upcoming list + quoted-this-month figure       |

**No charts.** A single coach with a handful of bookings a week gains nothing from a
sparkline and loses the only thing that matters — what to do today. The brief explicitly
warns against "unnecessary charts"; this is that instruction taken seriously.

The revenue figure is labelled **"Quoted this month"**, not "Revenue". The system knows
what was quoted; it does not know what was collected. Labelling it "revenue" would be a
quietly false claim.

## 3. Bookings

Search covers reference, client name and client email — the three things a coach actually
has to hand. Filters are status chips. Sort is newest / oldest / by session date.

**Status model.** Enforced in `src/server/services/booking.ts` and unit-tested:

```
PENDING ──► CONFIRMED ──► COMPLETED
   │             │
   └──► CANCELLED / REJECTED ◄──┘
```

- Terminal states (`COMPLETED`, `CANCELLED`, `REJECTED`) are final.
- `PENDING → COMPLETED` is refused — you cannot complete a session you never confirmed.
- A same-status "transition" is allowed, so other fields can be saved without a status change.
- Bookings are **never deleted**, so the history stays truthful.

Confirming with an assigned offer snapshots `priceQuoted`, so later price changes never
rewrite what a past client was told.

## 4. Clients

Created automatically on first booking request, keyed on lowercased email, so a returning
surfer accretes history instead of forking into duplicates. Subsequent requests refresh
contact details but never blank out a field the coach filled in manually.

Private `notes` are for injuries, goals and what you worked on last time. They are never
rendered on the public site.

## 5. Content

Typed section editors, not a page builder (DECISIONS.md D-011). Each section maps to a
Zod schema; repeatable groups (method pillars, Imsouane blocks) can be added, reordered by
editing, and removed. The coach can rewrite every word on the site and cannot break the
layout.

## 6. Gallery

Presented as a card grid rather than a table, because for images the thumbnail *is* the
identifying information. Alt text is a required field — the form will not submit without
it.

## 7. Availability

Records intent. It does **not** currently gate the booking form (DECISIONS.md D-007):
surf sessions depend on swell, tide and wind, so auto-blocking a date the ocean might
still deliver would be worse service, not better. The tables are the foundation a future
automated flow reads from.

A day with no row means "not yet decided" — deliberately distinct from `UNAVAILABLE`.

## 8. Design constraints

Same tokens as the public site, different priorities (DESIGN_SYSTEM.md §12).

**The admin may:** use tighter spacing, `body-sm` as its base size, tables and borders,
an inverse sidebar, and serif for page titles and KPI figures.

**The admin may not:** introduce new colours, change type family, add gradients or heavy
shadows, or drift toward generic blue/purple SaaS chrome.

Adaptive navigation: persistent sidebar at ≥1024px, slide-over below it.

## 9. Security

Three independent guards (ARCHITECTURE.md §5):

1. `middleware.ts` — edge redirect. **UX only; never trusted as the boundary.**
2. `(dashboard)/layout.tsx` — `requireAdmin()` before any admin page renders.
3. **Every server action** — `requireAdminOrFail()` at the point of work.

Layer 3 is the real boundary, because a server action is directly invocable and does not
necessarily traverse a page's middleware.

Verified: all ten top-level admin routes return `307 → /admin/login` when signed out.

Other measures: bcrypt cost 12; constant-work password comparison against a dummy hash so
unknown emails cost the same time as known ones; generic failure messages; login rate
limited 5 per IP per 10 minutes; `httpOnly` `sameSite=lax` session cookie; `noindex` on
every admin route and `Disallow: /admin` in robots.

## 10. Operational notes

- The admin account is provisioned by `npm run db:seed`. Re-running the seed resets the
  password to the current `SEED_ADMIN_PASSWORD`, which is the usual reason to re-run it.
- There is **no password reset flow** in MVP. Recovery is: change `SEED_ADMIN_PASSWORD`
  and re-run the seed.
- Rotating `AUTH_SECRET` invalidates every outstanding session immediately. That is the
  emergency "sign everyone out" lever.
