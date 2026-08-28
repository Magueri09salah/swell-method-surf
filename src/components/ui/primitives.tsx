import type { ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  CircleDashed,
  Clock,
  Info,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared primitives: eyebrow, rule, container, badge, card, states, rating. */

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("type-label text-[var(--text-tertiary)]", className)}>{children}</p>
  );
}

export function EyebrowInverse({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("type-label text-[var(--color-yellow)]", className)}>{children}</p>
  );
}

export function Rule({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-[var(--color-line)]", className)} />;
}

export function Container({
  size = "default",
  children,
  className,
}: {
  size?: "narrow" | "default" | "wide" | "prose";
  children: ReactNode;
  className?: string;
}) {
  const widths = {
    prose: "max-w-[62ch]",
    narrow: "max-w-[880px]",
    default: "max-w-[1240px]",
    wide: "max-w-[1480px]",
  } as const;

  return (
    <div className={cn("mx-auto w-full px-5 md:px-8 xl:px-12", widths[size], className)}>
      {children}
    </div>
  );
}

type Tone = "neutral" | "success" | "warning" | "danger" | "muted" | "info" | "accent";

const toneStyles: Record<Tone, string> = {
  neutral: "bg-[var(--color-ink)] text-white",
  accent: "bg-[var(--color-yellow)] text-[var(--text-on-accent)]",
  success: "bg-[rgba(47,107,63,0.12)] text-[var(--color-success)]",
  warning: "bg-[rgba(138,90,17,0.12)] text-[var(--color-warning)]",
  danger: "bg-[rgba(179,38,30,0.10)] text-[var(--color-danger)]",
  info: "bg-[rgba(55,80,95,0.10)] text-[var(--color-info)]",
  muted: "bg-[var(--color-line-subtle)] text-[var(--text-secondary)]",
};

/**
 * Badge always pairs its tone with an icon, so status is never carried by
 * colour alone (WCAG 1.4.1).
 */
const toneIcons: Record<Tone, typeof Info> = {
  neutral: CheckCircle2,
  accent: CheckCircle2,
  success: CheckCircle2,
  warning: Clock,
  danger: XCircle,
  info: Info,
  muted: CircleDashed,
};

export function Badge({
  tone = "neutral",
  children,
  withIcon = true,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  withIcon?: boolean;
  className?: string;
}) {
  const Icon = toneIcons[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[9999px] px-2.5 py-1 type-label",
        toneStyles[tone],
        className,
      )}
    >
      {withIcon && <Icon aria-hidden="true" className="size-3" />}
      {children}
    </span>
  );
}

export function Card({
  children,
  className,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-[12px] border border-[var(--color-line)] bg-[var(--surface-raised)]",
        interactive &&
          "transition-colors duration-200 hover:border-[var(--color-ink)] focus-within:border-[var(--color-ink)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = CircleDashed,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: typeof Info;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[12px] border border-dashed border-[var(--color-line-strong)] bg-[var(--surface-soft)] px-6 py-14 text-center">
      <Icon aria-hidden="true" className="size-7 text-[var(--text-tertiary)]" />
      <h3 className="type-h3">{title}</h3>
      <p className="measure-tight type-body-sm text-[var(--text-secondary)]">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorBanner({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-[8px] border border-[var(--color-danger)] bg-[rgba(179,38,30,0.07)] px-4 py-3"
    >
      <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--color-danger)]" />
      <p className="type-body-sm font-medium text-[var(--color-danger)]">{children}</p>
    </div>
  );
}

export function SuccessBanner({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="flex items-start gap-2.5 rounded-[8px] border border-[var(--color-success)] bg-[rgba(47,107,63,0.07)] px-4 py-3"
    >
      <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--color-success)]" />
      <p className="type-body-sm font-medium text-[var(--color-success)]">{children}</p>
    </div>
  );
}

/**
 * Star rating. The stars are decorative; the accessible name carries the value,
 * so a screen reader hears "4 out of 5" rather than five icons.
 */
export function StarRating({ value, className }: { value: number; className?: string }) {
  const clamped = Math.max(0, Math.min(5, Math.round(value)));

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${clamped} out of 5`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <svg
          key={index}
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={cn(
            "size-3.5",
            index < clamped ? "fill-[var(--color-ink)]" : "fill-[var(--color-line-strong)]",
          )}
        >
          <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3 6.2 20.4l1.1-6.5L2.6 9.3l6.5-.9z" />
        </svg>
      ))}
    </span>
  );
}

/** Decorative wave rule — a brand motif, hidden from assistive tech. */
export function WaveRule({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 12"
      preserveAspectRatio="none"
      className={cn("h-3 w-28 text-[var(--color-ink)]", className)}
    >
      <path
        d="M0 6c10-6 20-6 30 0s20 6 30 0 20-6 30 0 20 6 30 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}
