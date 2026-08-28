/**
 * Skeletons.
 *
 * Dimensions deliberately match the real content they stand in for, so the
 * swap does not shift layout (protects CLS). Marked aria-hidden with a polite
 * status message alongside, so screen readers hear "Loading" rather than a
 * fence of empty boxes.
 */
export function SkeletonRows({ rows = 6 }: { rows?: number }) {
  return (
    <div>
      <p className="sr-only" role="status">
        Loading…
      </p>
      <div
        aria-hidden="true"
        className="overflow-hidden rounded-[8px] border border-[var(--color-line)] bg-[var(--surface-raised)]"
      >
        <div className="h-11 border-b border-[var(--color-line)] bg-[var(--surface-sunken)]" />
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b border-[var(--color-line-subtle)] px-4 py-4 last:border-b-0"
          >
            <div className="h-4 w-40 animate-pulse rounded-[2px] bg-[var(--color-line)]" />
            <div className="h-4 w-24 animate-pulse rounded-[2px] bg-[var(--color-line)] opacity-70" />
            <div className="ml-auto h-6 w-20 animate-pulse rounded-[2px] bg-[var(--color-line)] opacity-60" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonHeading() {
  return (
    <div aria-hidden="true" className="mb-8 flex flex-col gap-3">
      <div className="h-9 w-56 animate-pulse rounded-[2px] bg-[var(--color-line)]" />
      <div className="h-4 w-80 max-w-full animate-pulse rounded-[2px] bg-[var(--color-line)] opacity-70" />
    </div>
  );
}

export function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-[8px] border border-[var(--color-line)] bg-[var(--surface-raised)] p-5"
        >
          <div className="h-3 w-24 animate-pulse rounded-[2px] bg-[var(--color-line)] opacity-70" />
          <div className="h-11 w-16 animate-pulse rounded-[2px] bg-[var(--color-line)]" />
        </div>
      ))}
    </div>
  );
}
