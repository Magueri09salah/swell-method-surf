# User Flows — Swell Method Surf

## 1. Visitor → booking request (the money path)

```
Landing (any page)
   │
   ├─ Home ─────────► scans hero, method, coaching cards
   ├─ Google ───────► lands directly on /coaching or /imsouane
   └─ Instagram ────► lands on /about
   │
   ▼
Understands the offer          ← must take < 5 seconds
   │
   ├─ Unsure of level? ──────► /method  or  /coaching
   └─ Ready ─────────────────► /contact  (or /contact?offer=<id> from a card)
   │
   ▼
Booking form  (single page, ~90 seconds on a phone)
   │
   ├─ validation fails ─► inline errors, focus moves to first invalid field
   ├─ rate limited ─────► friendly message + direct email fallback
   ├─ honeypot filled ──► success-shaped response, nothing stored
   │
   ▼
Server action
   ├─ rate-limit check (5 per IP / 10 min)
   ├─ Zod re-validation (client validation is never trusted)
   ├─ transaction: upsert Client (by lowercased email) + create Booking
   └─ generate SMS-XXXXXX reference, retry on collision
   │
   ▼
Success state  (replaces the form, receives focus, announced via role="status")
   ├─ shows the reference
   ├─ states what happens next and when (~24h)
   ├─ states clearly that nothing has been charged
   └─ offers /method to read while waiting
```

**Design notes.** One page, no wizard — eleven fields do not justify five steps, and each
step sheds conversions. "Not sure yet" is a first-class answer for coaching format,
because forcing a choice loses bookings from exactly the people who most need coaching.
The acknowledgement checkbox sets the expectation that this is a request, which prevents
the single worst outcome: someone arriving in Imsouane believing they have a confirmed
session.

## 2. Coach → triage

```
Sign in  (/admin/login)
   │  rate-limited 5 per IP / 10 min
   │  generic failure message — no account enumeration
   ▼
Dashboard
   │  answers: what needs attention · what is coming up · how many clients
   │
   ▼
Bookings ─ filter PENDING
   │
   ▼
Booking detail
   ├─ read the request and the client's message
   ├─ contact them (mailto / tel / WhatsApp deep-link, pre-filled with reference)
   ├─ assign a coaching offer  → price snapshots on confirm
   ├─ set the scheduled date and time
   ├─ add a private internal note
   └─ change status
        PENDING → CONFIRMED → COMPLETED
        any live state → CANCELLED / REJECTED
   │
   ▼
Client record accretes booking history automatically
```

Status transitions are enforced server-side by `canTransition()` and covered by tests.
The UI only offers legal transitions, but the server re-checks — the UI filter is
usability, not the rule.

## 3. Coach → publish content

```
Admin → Content → pick a section (e.g. "Homepage — Hero")
   │
   ▼
Typed form (real fields, not a block builder)
   │
   ▼
Save → Zod validates against that key's schema
   │
   ▼
updateTag(content) → public site shows the change immediately
```

If a stored payload ever fails validation, `getContent()` logs and serves the shipped
default. **A bad content edit cannot take the public site down.**

## 4. Coach → manage coaching offers

```
Admin → Coaching
   ├─ create / edit  (slug auto-fills from title while creating, never after)
   ├─ reorder        (up/down swaps sortOrder in a transaction)
   ├─ hide/show      (active flag — hidden offers vanish from the site)
   └─ delete         (confirmed; past bookings survive via SetNull)
```

## 5. Failure paths — designed, not accidental

| Situation                        | What the user sees                                                |
| -------------------------------- | ----------------------------------------------------------------- |
| No coaching offers exist         | Designed empty state + "Get in touch" CTA, never a blank grid      |
| No testimonials published        | Honest placeholder copy — **never an invented review**             |
| No gallery images                | Empty state pointing to the coaching pages                         |
| Database unreachable (public)    | Default copy and empty sections; page still renders (`safeRead`)   |
| Database unreachable (admin)     | A real error — the coach must never see silently empty lists       |
| Booking submit fails             | Error banner + email fallback; the form keeps what was typed       |
| Rate limited                     | Plain-language message with a retry time                           |
| Unknown URL                      | Brand-designed 404 with suggested pages                            |
| Server error in a route          | `error.tsx` with retry, header and footer intact                   |
| Server error in the shell        | `global-error.tsx`, self-contained styling, hard link home         |
| Session expires mid-action       | Action returns "session expired"; middleware redirects to login    |

## 6. Keyboard-only journey

Verified end to end:

1. `Tab` → "Skip to content" appears as the first focusable element.
2. `Tab` through the nav — focus is visible on every item; current page carries
   `aria-current="page"`.
3. On mobile, the menu is a focus-trapped dialog: `Escape` closes it and focus returns to
   the trigger button.
4. The booking form is completable without a mouse; native `<select>` opens the system
   picker; errors are announced via `role="alert"`.
5. On a failed submit, focus jumps to the first invalid field.
6. The gallery lightbox traps focus, supports `←`/`→`, and `Escape` restores focus to the
   thumbnail that opened it.
