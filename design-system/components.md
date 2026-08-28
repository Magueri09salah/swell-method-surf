# Component Specifications

Behavioural contracts for every shared component. Visual tokens are in
`design-system/tokens/`; the rationale is in `docs/DESIGN_SYSTEM.md`.

**Every interactive component defines all eight states:**
default · hover · focus-visible · active · disabled · loading · error · success.

---

## Button — `src/components/ui/Button.tsx`

| Variant     | Fill              | Text        | Border                | Hover                          |
| ----------- | ----------------- | ----------- | --------------------- | ------------------------------ |
| `primary`   | `--interactive`   | `--shell`   | none                  | → `--interactive-hover`        |
| `secondary` | transparent       | `--text-primary` | 1px `--border-strong` | bg raised, border interactive |
| `ghost`     | transparent       | `--text-primary` | none              | `rgba(191,112,71,0.08)`        |
| `inverse`   | `--cream`         | `--brown`   | none                  | bg `--sand`                    |
| `danger`    | `#A33A2A`         | `--shell`   | none                  | `#8C3123`                      |

Sizes: `sm` 36px (admin desktop only) · `md` 44px (mobile minimum) · `lg` 52px.

- **`primary` uses `--interactive` (`#8A4E35`), not brand terracotta.** Cream on `#BF7047`
  is 3.18:1 and fails AA for labels.
- **Loading:** the label stays in flow but becomes `invisible` while a spinner overlays it,
  so the button keeps its exact width and cannot shift surrounding layout. Sets
  `aria-busy` and `disabled`, with an `sr-only` "Working…".
- **Disabled:** real `disabled` attribute, `opacity: 0.45`, `cursor: not-allowed`.
- **Focus:** global `:focus-visible` ring, 2px, 2px offset. Never removed.
- `ButtonLink` renders `next/link`, or `<a>` with `rel="noopener noreferrer"` when
  `external`.

## Form fields — `src/components/ui/Field.tsx`

`TextField` · `TextAreaField` · `SelectField` · `CheckboxField` · `HoneypotField`.

Accessibility contract, enforced by construction:

- A visible `<label>` — **never placeholder-only**.
- Helper text persists; it does not vanish on focus.
- Errors render **below** the field, in danger colour, prefixed with an `AlertCircle` icon
  (never colour alone), wired via `aria-describedby` and `aria-invalid`, announced with
  `role="alert"`.
- Required fields show `*` plus an `sr-only` "(required)".
- 44px minimum height, 16px text (prevents iOS auto-zoom).
- Validation runs **on blur**, not per keystroke.
- `SelectField` uses a styled native `<select>` (D-008): system picker on mobile, free
  accessibility, zero JS.
- `HoneypotField` is positioned off-screen and `aria-hidden`, so humans and assistive tech
  never encounter it.

## Card — `src/components/ui/primitives.tsx`

Raised surface, 1px border, `md` radius, **no shadow at rest**. When `interactive`, hover
darkens the border and (in composed cards) scales the inner image 1.03 — **the card itself
never moves**. `focus-within` mirrors hover. Whole-card links use `.stretched-link`, giving
one tab stop rather than several.

## Badge

Tones: `neutral` · `success` · `warning` · `danger` · `info` · `muted`. **Every tone pairs
with an icon**, so status is never carried by colour alone (WCAG 1.4.1).

## StarRating

The five glyphs are `aria-hidden`; the wrapper is `role="img"` with an accessible name of
"N out of 5". A screen reader hears the value, not five icons.

## Eyebrow

The brand's signature detail: a hairline rule, then uppercase 0.14em-tracked terracotta
label. `EyebrowInverse` is its dark-surface counterpart using `--terracotta-lift`.

## Reveal — `src/components/ui/Reveal.tsx`

IntersectionObserver at 15% threshold, fires once, `-40px` bottom root margin.

- **Content is visible by default.** The hidden state applies only after mount confirms
  observer support (`html[data-reveal="on"]`). A JS failure can never hide content.
- Drives the DOM through a ref, not React state — reveal is a pure visual side-effect, and
  routing it through state would cascade re-renders on every element that scrolls in.
- Server markup carries no reveal attribute, so there is nothing to hydrate-mismatch.
- `prefers-reduced-motion` is handled in `globals.css`, keeping CSS the single source of
  truth for motion policy.

## Navigation

**Header** — server component; sticky; only the mobile sheet and active-link detection are
client-side.

**NavLink** — underline wipes in from the left on hover and stays on the current page.
`aria-current="page"` carries the state; the underline alone never does.

**MobileNav** — Radix Dialog: focus trap, `Escape`, focus restored to trigger, background
inert, scroll lock. Hand-rolling this is where mobile menus usually break for keyboard and
screen-reader users.

## GalleryGrid — `src/components/gallery/GalleryGrid.tsx`

- Every fourth tile spans two columns and rows on desktop, so the wall reads as an
  editorial spread rather than a contact sheet.
- Category filters are `aria-pressed` toggle buttons, horizontally scrollable on mobile.
- Lightbox is a Radix Dialog with `←`/`→` navigation, a position counter, and caption.
  Focus returns to the thumbnail that opened it.

## BookingForm — `src/components/booking/BookingForm.tsx`

Single page, no wizard. Server action + `useActionState`, so it works without JS and
progressively enhances to inline errors.

- Field errors return keyed from the **same Zod schema the server used**, so client and
  server cannot disagree about validity.
- On failure, focus moves to the first invalid field.
- On success, the form is replaced by a confirmation that receives focus, is announced via
  `role="status"`, shows the booking reference, states what happens next and when, and
  states plainly that nothing has been charged.
- Grouped in `<fieldset>`/`<legend>`: About you · Your surfing · When.

## Admin components

**AdminShell** — adaptive navigation: persistent sidebar ≥1024px, slide-over below.
Inverse surface, its own skip link.

**StatCard** — display serif, tabular figure. `tone="attention"` outlines the card and
colours the figure when the value is above zero, so "needs action" is visible at a glance.

**TableWrap** — the overflow container sits on the table, so wide data scrolls inside its
own region and the page body never scrolls horizontally.

**ConfirmSubmit** — destructive submit using `useFormStatus` (disables during the action,
preventing double submission) plus `window.confirm`. The native dialog is deliberate: it
is fully accessible, cannot be styled into ambiguity, and is unmissable.

**Skeleton** — dimensions match the real content to protect CLS; `aria-hidden` with a
polite "Loading…" alongside.

## Feedback

**ErrorBanner / SuccessBanner** — `role="alert"` / `role="status"`, icon plus text, never
colour alone.

**EmptyState** — dashed border, icon, title, one-sentence explanation, and an action. Every
list has one. A site with zero testimonials must still look finished — and must never
invent one to fill the space.
