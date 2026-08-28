import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Button. All eight states defined (DESIGN_SYSTEM.md §10).
 *
 * `primary` is the Figma's black pill: white on ink measures 18.42:1.
 * `accent` is black on yellow at 14.54:1.
 *
 * Yellow is NEVER used as a label colour on a light surface — yellow on paper
 * is 1.23:1. It is a surface, or a label on ink. See DECISIONS.md D-013.
 */

type Variant = "primary" | "secondary" | "ghost" | "inverse" | "accent" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 " +
  "font-mono uppercase tracking-[0.14em] text-[0.6875rem] font-medium " +
  "rounded-[9999px] whitespace-nowrap cursor-pointer select-none " +
  "transition-[background-color,border-color,color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] " +
  "disabled:opacity-45 disabled:cursor-not-allowed disabled:pointer-events-none " +
  "aria-busy:cursor-wait";

const variants: Record<Variant, string> = {
  primary: "bg-[var(--color-ink)] text-white hover:bg-[var(--interactive-hover)]",
  accent:
    "bg-[var(--color-yellow)] text-[var(--text-on-accent)] hover:bg-[var(--color-yellow-deep)]",
  secondary:
    "bg-transparent text-[var(--text-primary)] border border-[var(--color-ink)] " +
    "hover:bg-[var(--color-ink)] hover:text-white",
  ghost: "bg-transparent text-[var(--text-primary)] hover:bg-[var(--color-line-subtle)]",
  inverse: "bg-white text-[var(--color-ink)] hover:bg-[var(--color-yellow)]",
  danger: "bg-[var(--color-danger)] text-white hover:bg-[#8E1E17]",
};

/**
 * `md` (44px) is the mobile minimum so every target clears 44x44.
 * `sm` is admin-desktop only, where pointer precision is available.
 */
const sizes: Record<Size, string> = {
  sm: "h-9 px-4",
  md: "h-11 px-6",
  lg: "h-[52px] px-8 text-[0.75rem]",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
  className?: string;
};

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

export type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading = false, children, className, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      // Real `disabled` attribute, not just styling — so it is announced and
      // genuinely unfocusable.
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {/* Label stays in flow but goes invisible, so the button keeps its exact
          width while loading and cannot shift the layout around it. */}
      <span className={cn("inline-flex items-center gap-2", loading && "invisible")}>
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner />
          <span className="sr-only">Working…</span>
        </span>
      )}
    </button>
  );
});

export type ButtonLinkProps = CommonProps & {
  href: string;
  external?: boolean;
  "aria-label"?: string;
};

export function ButtonLink({
  href,
  external = false,
  variant = "primary",
  size = "md",
  children,
  className,
  ...props
}: ButtonLinkProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}
