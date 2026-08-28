"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

/**
 * Route-level error boundary for the public site. Keeps the header and footer
 * intact so the visitor is never dumped onto a chromeless page.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The message itself stays server-side; only the digest is surfaced.
    console.error("[site] Route error", error.digest);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center px-5 py-20">
      <div className="flex max-w-[52ch] flex-col items-start gap-5">
        <p className="type-label flex items-center gap-3 text-[var(--text-tertiary)]">
          <span aria-hidden="true" className="h-px w-8 bg-[var(--color-yellow)]" />
          Something went wrong
        </p>

        <h1 className="type-h1 text-[var(--text-primary)]">This page did not load.</h1>

        <p className="measure type-body-lg text-[var(--text-secondary)]">
          Something failed while loading this section. Trying again usually fixes it.
        </p>

        {error.digest && (
          <p className="type-caption text-[var(--text-secondary)]">
            Reference: <code>{error.digest}</code>
          </p>
        )}

        <div className="mt-2 flex flex-wrap gap-3">
          <Button onClick={reset}>Try again</Button>
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-[4px] border border-[var(--color-line-strong)] px-5 text-[0.9375rem] font-semibold transition-colors duration-200 hover:border-[var(--color-ink)]"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
