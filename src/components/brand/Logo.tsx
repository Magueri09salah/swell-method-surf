import { cn } from "@/lib/utils";

/**
 * Brand lockups, rendered from the supplied artwork (`logo-master.png`).
 *
 * DELIVERY: the artwork is a flat shape on transparency, applied as a CSS mask
 * (`.brand-lockup` in globals.css) with `background-color: currentColor`. One
 * asset therefore renders in any colour the surface requires.
 *
 * COLOUR, and why it is a prop rather than fixed: the logo's own terracotta
 * measures **2.95:1 on the brand yellow** — below even the 3:1 floor for
 * graphics. So on yellow surfaces the mark renders in ink instead. Terracotta
 * is kept for light neutral surfaces, where it is 3.63:1 and carries the
 * heritage of the original identity.
 *
 * ASSETS, both derived from the master with no redrawing:
 *   /brand/logo-emblem.png   sun, village and wave      (384x303, 16KB)
 *   /brand/logo-full.png     complete stacked lockup    (512x618, 36KB)
 */

type Tone = "brand" | "ink" | "light";

const TONE_MARK: Record<Tone, string> = {
  brand: "text-[var(--color-terracotta)]",
  ink: "text-[var(--color-ink)]",
  light: "text-white",
};

const TONE_TITLE: Record<Tone, string> = {
  brand: "text-[var(--text-primary)]",
  ink: "text-[var(--text-primary)]",
  light: "text-white",
};

const TONE_SUB: Record<Tone, string> = {
  brand: "text-[var(--text-tertiary)]",
  ink: "text-[rgba(20,20,20,0.66)]",
  light: "text-[var(--text-on-inverse-dim)]",
};

type LogoProps = {
  /**
   * `full`     emblem + live-text wordmark — header, footer, admin
   * `compact`  emblem only — narrow bars
   * `stacked`  the complete supplied lockup — hero, splash, print
   */
  variant?: "full" | "compact" | "stacked";
  /** Surface the mark sits on. Drives colour; see the contrast note above. */
  tone?: Tone;
  className?: string;
};

export function Logo({ variant = "full", tone = "brand", className }: LogoProps) {
  if (variant === "stacked") {
    return (
      <span
        role="img"
        aria-label="Swell Method Surf — Surf Coaching, Imsouane, Morocco"
        className={cn("brand-lockup brand-lockup-full block w-56", TONE_MARK[tone], className)}
      />
    );
  }

  if (variant === "compact") {
    return (
      <span
        role="img"
        aria-label="Swell Method Surf"
        className={cn("brand-lockup brand-lockup-emblem block w-11", TONE_MARK[tone], className)}
      />
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {/* Decorative: the adjacent wordmark already names the brand, so labelling
          both would make a screen reader announce it twice. */}
      <span
        aria-hidden="true"
        className={cn("brand-lockup brand-lockup-emblem block w-10 shrink-0", TONE_MARK[tone])}
      />

      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[0.9375rem] font-700 tracking-[0.16em] uppercase",
            TONE_TITLE[tone],
          )}
          style={{ fontWeight: 700 }}
        >
          Swell Method
        </span>
        <span className={cn("type-label mt-1 text-[0.5625rem] tracking-[0.24em]", TONE_SUB[tone])}>
          Surf · Imsouane
        </span>
      </span>
    </span>
  );
}
