# Brand assets

All derived from the supplied artwork. Nothing here was redrawn.

| File | Purpose | Notes |
| --- | --- | --- |
| `logo-master.png` | Master artwork as supplied | 781x940 RGBA, transparent background. Source of every other file here. Keep it. |
| `logo-emblem.png` | Emblem, alpha-only **mask** | 384x303. Used by `.brand-lockup-emblem`; recolours via `currentColor`. |
| `logo-full.png` | Complete stacked lockup, alpha-only **mask** | 512x618. Used by `.brand-lockup-full`. |
| `logo-emblem-color.png` | Emblem in terracotta on transparency | 300x237. For contexts that cannot use a CSS mask, e.g. the Open Graph card. |

The two mask files are greyscale+alpha PNGs: only the alpha channel matters for
a CSS mask, so the colour plane is a constant, which compresses to almost
nothing. That took them from 151KB and 267KB down to 16KB and 36KB.

The favicon and Apple touch icon are `src/app/icon.png` and
`src/app/apple-icon.png` — Next.js file conventions, detected and hashed
automatically.

## Regenerating

The crops were taken on the artwork's own blank rows, so the bounds come from
the design rather than from eyeballing. If `logo-master.png` is ever replaced,
regenerate the derived files rather than editing them by hand.
