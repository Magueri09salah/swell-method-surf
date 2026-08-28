# Design System — Swell Method Surf

**Version** 2.0 · Source of truth for every visual decision in this repository.
Runtime implementation: `src/app/globals.css` (Tailwind v4 `@theme`).
Machine-readable tokens: `design-system/tokens/`. **Keep all three in sync.**

Version 2.0 adopts the client's Figma design — see `docs/DECISIONS.md` D-013 for
what changed and why. The structure, routes and architecture are unchanged.

---

## 1. Brand

**Swell Method Surf** — Surf Coaching, Imsouane, Morocco.

A bright, high-contrast, slightly zine-like identity: a vivid yellow doing the
shouting, near-black type doing the talking, and the coach's own photography
carrying the place.

### Principles

1. **Yellow is a surface, never text on light.** This is the single most
   important rule in the system — see §2.2.
2. **Contrast is the aesthetic.** Black on yellow is 14.54:1. The design is
   loud and accessible at the same time, which is rare and worth protecting.
3. **Monospace for everything except headlines.** It is what makes the interface
   read as considered rather than generic.
4. **Real photography, always.** No stock, no illustration.
5. **Borders and colour blocks before shadows.** Shadows are nearly absent.
6. **Motion is swell, not spring.** Long, soft, single-direction.

### Banned

Glassmorphism · purple/blue gradients · heavy shadows · grids of identical
cards · neon · generic SaaS dashboard chrome · emoji as icons · dark mode
(D-006).

---

## 2. Colour

### 2.1 Primitives

| Token                  | Hex       | Role                                        |
| ---------------------- | --------- | ------------------------------------------- |
| `--color-yellow`       | `#F2E959` | The signature. Surfaces and accents only.   |
| `--color-yellow-deep`  | `#E4D93F` | Hover/pressed on yellow                     |
| `--color-butter`       | `#FDF8E0` | Soft card surface                           |
| `--color-paper`        | `#FCFCF7` | Page background                             |
| `--color-white`        | `#FFFFFF` | Raised surfaces, header                     |
| `--color-ink`          | `#141414` | Primary text, buttons, inverse surfaces     |
| `--color-ink-soft`     | `#4A4A45` | Secondary text                              |
| `--color-ink-muted`    | `#5E5E58` | Tertiary text                               |
| `--color-terracotta`   | `#BF7047` | **Heritage — the logo mark only**           |

### 2.2 Contrast — measured, not assumed

Every value below was computed against WCAG 2.1. **Three findings shaped the build.**

> **Finding 1 — yellow can never be text on a light ground.**
> Yellow on paper is **1.23:1**. On white, **1.27:1**. Both are unreadable.
> Yellow is therefore only ever a *surface* (with ink on it) or a label on ink.
> `--accent` changed meaning in v2: it used to be terracotta, which could carry
> text. Every `text-[var(--accent)]` was migrated to a neutral tone.

> **Finding 2 — the logo's terracotta fails on the brand yellow.**
> **2.95:1** — below even the 3:1 graphics floor. The footer logo therefore
> renders in ink (`tone="ink"`). Terracotta is kept on light neutral surfaces,
> where it is 3.63:1.

> **Finding 3 — the hero scrim is structural.**
> The yellow headline over the brightest sky region of the hero photograph is
> **1.21:1** raw. `.hero-scrim` applies a 42–60% black gradient, lifting it past
> 3:1 for large display type everywhere and white sub-copy past 4.5:1.
> Removing the scrim breaks accessibility, not just aesthetics.

| Foreground   | Background | Ratio     | Verdict                     |
| ------------ | ---------- | --------- | --------------------------- |
| ink          | yellow     | **14.54** | AAA — the signature pairing |
| ink          | butter     | **17.26** | AAA                         |
| ink          | paper      | **17.90** | AAA                         |
| ink          | white      | **18.42** | AAA                         |
| white        | ink        | **18.42** | AAA                         |
| ink-soft     | paper      | **8.66**  | AAA body                    |
| ink-soft     | yellow     | **7.03**  | AAA body                    |
| ink-muted    | paper      | **6.34**  | AA body                     |
| terracotta   | paper      | 3.63      | Graphics/large only         |
| terracotta   | yellow     | 2.95      | ✗ **Banned**                |
| **yellow**   | **paper**  | **1.23**  | ✗ **Banned**                |

### 2.3 Semantic tokens

| Semantic                | Value                | Notes                        |
| ----------------------- | -------------------- | ---------------------------- |
| `--surface-page`        | paper                | Body background              |
| `--surface-raised`      | white                | Header, cards, form fields   |
| `--surface-soft`        | butter               | Card bodies, quiet sections  |
| `--surface-accent`      | yellow               | CTA band, footer, level card |
| `--surface-inverse`     | ink                  | Testimonials, admin sidebar  |
| `--text-primary`        | ink                  |                              |
| `--text-secondary`      | ink-soft             | Light surfaces only          |
| `--text-tertiary`       | ink-muted            | Eyebrows, meta               |
| `--text-on-accent`      | ink                  | On yellow                    |
| `--text-on-inverse`     | paper                | On ink                       |
| `--text-on-inverse-dim` | `#B8B8B0`            | Secondary on ink             |
| `--interactive`         | ink                  | Button fills                 |
| `--focus-ring`          | ink                  | Flipped to paper by `.on-inverse` |

### 2.4 State colours

Verified ≥ 4.5:1 on paper **and** as a fill behind white text.

| State   | Hex       |
| ------- | --------- |
| Success | `#2F6B3F` |
| Warning | `#8A5A11` |
| Danger  | `#B3261E` |
| Info    | `#37505F` |

Colour is never the sole carrier of meaning — every state pairs with an icon
and a text label.

### 2.5 Dark mode

Not implemented, deliberately (D-006). `color-scheme: light` is declared.
Section-level inversion provides contrast rhythm instead.

---

## 3. Typography

### 3.1 Families — exactly two

| Role        | Family            | Weights       | Why                                                                 |
| ----------- | ----------------- | ------------- | ------------------------------------------------------------------- |
| **Display** | **Poppins**       | 600, 700, 800 | Wide, geometric, heavy. Carries the oversized uppercase headlines.  |
| **UI/Body** | **IBM Plex Mono** | 400, 500, 600 | The design's monospace treatment. Neutral, excellent at small sizes, real tabular figures for the admin. |

Both self-hosted via `next/font/google` — **zero external font requests**, so the
CSP needs no font-host exception. Only the weights actually used are loaded.

> **Inferred, not extracted.** These were identified from a screenshot, not a
> Figma file. They match the letterforms closely. If the design uses different
> faces, it is a two-line change in `src/app/layout.tsx`.

### 3.2 Scale

Fluid via `clamp()`. Body never drops below 15px mobile / 16px desktop.

| Token         | Size                     | Family | Weight | Line height | Tracking |
| ------------- | ------------------------ | ------ | ------ | ----------- | -------- |
| `display-xl`  | clamp(3 → 8rem)          | Poppins| 800    | 0.92        | -0.03em  |
| `display-l`   | clamp(2.125 → 3.75rem)   | Poppins| 700    | 1.06        | -0.02em  |
| `h1`          | clamp(1.875 → 3rem)      | Poppins| 700    | 1.10        | -0.02em  |
| `h2`          | clamp(1.5 → 2.25rem)     | Poppins| 700    | 1.18        | -0.015em |
| `h3`          | clamp(1.125 → 1.375rem)  | Poppins| 600    | 1.30        | -0.01em  |
| `body-lg`     | clamp(1 → 1.0625rem)     | Mono   | 400    | 1.80        | 0        |
| `body`        | 0.9375rem                | Mono   | 400    | 1.80        | 0        |
| `body-sm`     | 0.875rem                 | Mono   | 400    | 1.70        | 0        |
| `caption`     | 0.75rem                  | Mono   | 400    | 1.55        | 0.01em   |
| `label`       | 0.6875rem                | Mono   | 500    | 1.40        | 0.16em   |

`display-xl` is uppercase by default — it is the hero treatment.

`label` is the signature detail: tracked uppercase mono, used for eyebrows,
prices, meta rows, buttons and nav. It is the connective tissue of the design.

### 3.3 Rules

- **Measure is 58ch, not 65–75ch.** Monospace sets wider per character, so the
  usual proportional measure runs too long. `.measure-tight` is 46ch.
- Line-height is raised to 1.75–1.8 for the same reason.
- Headings follow strict `h1 → h6` order; no level skipped for styling.
- Admin numerals use `font-variant-numeric: tabular-nums`.

---

## 4. Spacing

8px base. 4px only for icon/text optical alignment.

**Section rhythm:**

| Tier      | Mobile | Desktop |
| --------- | ------ | ------- |
| `tight`   | 48px   | 64px    |
| `section` | 80px   | 120px   |
| `major`   | 96px   | 160px   |

## 5. Layout

| Container | Max width | Use                          |
| --------- | --------- | ---------------------------- |
| `prose`   | 62ch      | Long-form reading            |
| `narrow`  | 880px     | Forms                        |
| `default` | 1240px    | Standard content             |
| `wide`    | 1480px    | Galleries, editorial spreads |

Gutters: 20px (≤767) · 32px (768–1279) · 48px (≥1280).
Breakpoints: `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`.

## 6. Radius

| Token  | Value  | Use                                  |
| ------ | ------ | ------------------------------------ |
| `xs`   | 4px    | Small surfaces                       |
| `sm`   | 8px    | Inputs, banners                      |
| `md`   | 12px   | Cards, media frames — the default    |
| `lg`   | 20px   | Large media blocks                   |
| `pill` | 9999px | **Buttons, tags, nav pills**         |

Fully-rounded pills are the design's signature interactive shape.

## 7. Shadows

Near-absent. Structure comes from borders and colour blocks.

## 8. Motion

Unchanged from v1 — long, soft, single-direction. No spring, no bounce.

| Token     | Value | Use                          |
| --------- | ----- | ---------------------------- |
| `instant` | 120ms | Focus ring                   |
| `fast`    | 200ms | Hover, colour transitions    |
| `base`    | 320ms | Buttons, small state changes |
| `slow`    | 560ms | Section reveals, image fades |
| `swell`   | 900ms | Hero entrance                |

Easing: `out` `0.22,1,0.36,1` · `in` `0.55,0,1,0.45` · `swell` `0.16,0.84,0.24,1`.

Only `transform` and `opacity` are animated. `prefers-reduced-motion` sets all
durations to `0.01ms` and renders reveals at final state. **Content is visible by
default** — the reveal system can never hide content if JS fails (D-009).

---

## 9. Components

Every interactive component defines all eight states:
**default · hover · focus-visible · active · disabled · loading · error · success.**

### Button

| Variant     | Fill        | Text  | Hover                    |
| ----------- | ----------- | ----- | ------------------------ |
| `primary`   | ink         | white | → `#2E2E2E`              |
| `accent`    | yellow      | ink   | → yellow-deep            |
| `secondary` | transparent | ink   | → fills ink, text white  |
| `ghost`     | transparent | ink   | → line-subtle            |
| `inverse`   | white       | ink   | → yellow                 |
| `danger`    | `#B3261E`   | white | → `#8E1E17`              |

All buttons are **pills** with tracked uppercase mono labels.
Sizes: `sm` 36px · `md` 44px · `lg` 52px. **`md` is the mobile minimum** so every
target clears 44×44. Icon-only buttons are 44×44 with `aria-label`.

Focus: `outline: 2px solid var(--focus-ring); outline-offset: 2px`. Never removed.
Loading: spinner replaces the label, width preserved to prevent layout shift,
`aria-busy` set and the button disabled.

### Input / Textarea / Select

White surface, 1px border, radius `sm`, 44px minimum height, 16px text (prevents
iOS auto-zoom). Visible label above — **never placeholder-only**. Helper text
persists. Errors appear *below the field* with an alert icon, wired via
`aria-describedby` + `aria-invalid` + `role="alert"`. Validation on **blur**.

Selects are native `<select>` elements, styled (D-008).

### Card

White or butter, 1px border, radius `md`, no shadow at rest. Hover darkens the
border and scales the contained image — **the card never moves**. Whole card is
one tab stop via a stretched link.

Full specs: `design-system/components.md`.

---

## 10. Accessibility contract

- WCAG 2.1 AA minimum; most body text clears AAA.
- Skip-to-content link, first tab stop on every page.
- Focus visible on everything focusable; ring flips on inverse surfaces.
- Landmarks: one `<main>`, `<nav aria-label>`, `<header>`, `<footer>` per page.
- Mobile menu is a focus-trapped dialog, Escape closes, focus restored.
- All meaningful images carry descriptive alt text; decorative use `alt=""`.
- Forms move focus to the first invalid field on submit failure.
- `prefers-reduced-motion` fully honoured.
- Zoom to 200% without loss of content or horizontal scroll.

## 11. Admin variance

Same tokens, denser scale. The admin **may** use tighter spacing, `body-sm` as
its base, more borders and tables, and an ink sidebar. It **may not** introduce
new colours, change type family, add gradients or heavy shadows, or drift toward
blue/purple SaaS chrome. Poppins is reserved for page titles and KPI figures;
everything else is mono.
