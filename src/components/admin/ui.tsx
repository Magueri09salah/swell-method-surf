import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared admin building blocks. Same tokens as the public site, denser scale. */

export function AdminHeading({
  title,
  description,
  action,
  back,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:mb-8">
      {back && (
        <Link
          href={back.href}
          className="inline-flex w-fit items-center gap-1.5 type-caption font-semibold text-[var(--text-secondary)] transition-colors duration-200 hover:text-[var(--color-ink)]"
        >
          <ChevronLeft aria-hidden="true" className="size-3.5" />
          {back.label}
        </Link>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          {/* Serif is reserved for page titles and KPI figures in the admin. */}
          <h1 className="type-h2 text-[var(--text-primary)]">{title}</h1>
          {description && (
            <p className="measure type-body-sm text-[var(--text-secondary)]">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[8px] border border-[var(--color-line)] bg-[var(--surface-raised)]",
        className,
      )}
    >
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-[var(--color-line)] px-5 py-3.5">
          <h2 className="type-h3 text-[1.0625rem]">{title}</h2>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

/**
 * KPI stat. The figure is display serif and tabular — the one place the admin
 * borrows the editorial voice, because these numbers are the point of the page.
 */
export function StatCard({
  label,
  value,
  hint,
  href,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
  tone?: "default" | "attention";
}) {
  const body = (
    <>
      <p className="type-label text-[var(--text-secondary)]">{label}</p>
      <p
        data-numeric
        className={cn(
          "font-display text-[2.75rem] leading-none",
          tone === "attention" && Number(value) > 0
            ? "text-[var(--color-ink)]"
            : "text-[var(--text-primary)]",
        )}
      >
        {value}
      </p>
      {hint && <p className="type-caption text-[var(--text-secondary)]">{hint}</p>}
    </>
  );

  const classes = cn(
    "relative flex flex-col gap-2 rounded-[8px] border bg-[var(--surface-raised)] p-5 transition-colors duration-200",
    tone === "attention" && Number(value) > 0
      ? "border-[var(--color-ink)]"
      : "border-[var(--color-line)]",
    href && "hover:border-[var(--color-ink)]",
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    );
  }

  return <div className={classes}>{body}</div>;
}

/**
 * Table wrapper. The overflow container is on the table only, so wide data
 * scrolls inside its own region and the page body never scrolls horizontally.
 */
export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-[8px] border border-[var(--color-line)] bg-[var(--surface-raised)]">
      <table className="w-full min-w-[44rem] border-collapse text-left">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-[var(--color-line)] bg-[var(--surface-sunken)] px-4 py-3 type-label text-[var(--text-primary)]",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <td
      className={cn(
        "border-b border-[var(--color-line-subtle)] px-4 py-3 type-body-sm align-middle",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function Pagination({
  page,
  pageCount,
  baseHref,
}: {
  page: number;
  pageCount: number;
  baseHref: string;
}) {
  if (pageCount <= 1) return null;

  const join = (target: number) =>
    `${baseHref}${baseHref.includes("?") ? "&" : "?"}page=${target}`;

  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-3">
      {page > 1 ? (
        <Link
          href={join(page - 1)}
          rel="prev"
          className="inline-flex h-11 items-center gap-1.5 rounded-[4px] border border-[var(--color-line-strong)] px-4 type-body-sm font-semibold transition-colors duration-200 hover:border-[var(--color-ink)]"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          Previous
        </Link>
      ) : (
        <span />
      )}

      <p aria-live="polite" className="type-caption text-[var(--text-secondary)]">
        Page {page} of {pageCount}
      </p>

      {page < pageCount ? (
        <Link
          href={join(page + 1)}
          rel="next"
          className="inline-flex h-11 items-center gap-1.5 rounded-[4px] border border-[var(--color-line-strong)] px-4 type-body-sm font-semibold transition-colors duration-200 hover:border-[var(--color-ink)]"
        >
          Next
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
