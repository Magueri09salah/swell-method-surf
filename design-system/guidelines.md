# Design Guidelines

How to make new work look like it belongs to Swell Method Surf.

## The six principles

1. **Let the ocean be the only blue.** The interface palette is sun-faded earth — cream,
   terracotta, sand, deep brown. Blue appears exclusively inside photography. This is the
   single decision that stops the site looking like every other surf school.

2. **Type carries the brand, not decoration.** Big editorial serif, a lot of air, very few
   boxes. If a section feels weak, the answer is usually larger type and more whitespace,
   not another card or another icon.

3. **Borders before shadows.** Hairline sand rules define structure. Shadows are warm-tinted
   and nearly invisible. If you reach for elevation to separate two things, try a rule.

4. **Asymmetry over grids of identical cards.** The Method is a numbered editorial list.
   The Imsouane blocks offset every second item. The gallery runs every fourth tile wide.
   Twelve equal tiles is the failure mode the brief explicitly names.

5. **Motion is swell, not bounce.** Long, soft, single-direction. Nothing springs, nothing
   overshoots. Cards do not lift on hover — their border darkens and their image breathes.

6. **The logo already has an identity. Do not compete with it.** The site's job is to make
   the mark feel like one artefact of a larger, calmer world.

## Before you add a component, ask

- Is this reusable, or is it page-specific? Page-specific sections live with the page.
- Does an existing primitive already do this? Prefer composing to creating.
- Does it need a new colour? It almost certainly does not — check the semantic tokens.
- Does it introduce a shadow? Try a border first.
- Is it a card because it should be, or because cards are easy?

## Writing copy

Voice: calm, confident, knowledgeable, welcoming, human, concise, authentic. The coach
should sound like an experienced surfer talking to another person.

**Do:** be specific ("a wave long enough to feel a correction land"), admit trade-offs
("including when a cheaper format would serve you better"), use plain sentences.

**Do not:** use "unforgettable adventure", "world-class", "unleash your potential", or any
superlative that could appear on any surf camp's homepage. Do not invent statistics,
credentials, or wave measurements. Do not use exclamation marks.

**Test:** could a competitor paste this sentence onto their site unchanged? If yes, rewrite
it.

## Accessibility is a build requirement

Not a review-stage polish pass. Every new component ships with:

- A visible label if it takes input, and errors below the field with `role="alert"`.
- A visible focus state. Never remove the ring.
- 44×44 minimum touch target.
- An icon or text alongside any colour that carries meaning.
- Meaningful `alt`, or `alt=""` if genuinely decorative.
- Correct behaviour under `prefers-reduced-motion`.

When accessibility conflicts with an aesthetic instruction, **accessibility wins** and the
conflict gets an entry in `docs/DECISIONS.md`. That has already happened once — see D-012,
where the brand's primary terracotta was demoted from button fill to decoration because it
measured 3.18:1.

## Colour rules you must not break

- **Never put text on `--brand-terracotta`.** Use `--interactive` (`#8A4E35`).
- **Never use `--brand-muted` on a dark surface.** Use `--text-on-inverse-dim`.
- **Never write a raw hex in a component.** Reference a semantic token.
- Terracotta is for hairlines, eyebrows, icons, numerals and display type ≥ 24px.

## Responsive

Mobile-first, and **mobile is not a stacked desktop**. Every layout should have a reason
for its mobile arrangement: the hero flips to a 4:5 portrait crop, the Method numerals move
inline beside the title, the gallery filters become a horizontal scroller, the admin sidebar
becomes a slide-over.

Check 375 first. If it works at 375 and 1440, the middle usually follows.

## Images

- Every photograph goes through `src/lib/media.ts`.
- Always `next/image` with explicit `sizes`.
- Only the hero is `priority`; everything else is lazy.
- Full-bleed photography gets the `photo-warm` multiply layer, keeping it inside the
  palette rather than introducing a competing blue.
- The `arch` frame is reserved — hero portrait, coach photo, occasional gallery tile. It
  stops being a signature if it is everywhere.

## The admin

Same tokens, different priorities: efficient, clear, structured, data-focused.

**May:** tighter spacing, `body-sm` base, tables and borders, inverse sidebar, serif for
page titles and KPI figures.

**May not:** new colours, a different type family, gradients, heavy shadows, or generic
blue/purple SaaS chrome.

## Final quality gate

Before calling any screen finished:

- Does it look like a premium surf coaching brand, or like a template?
- Could a visitor understand the service in five seconds?
- Does the mobile layout look designed, or merely reflowed?
- Can you complete every action with a keyboard, with focus always visible?
- Is there a designed empty state?
- Is there real copy — no lorem, no "John Doe", no invented facts?
