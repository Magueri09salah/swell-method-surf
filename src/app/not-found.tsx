import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";

/**
 * 404. Brand-designed rather than a bare Next.js default — this page is
 * reachable from search results and mistyped links, so it is a real entry
 * point and gets treated like one.
 */
export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-20">
      <div className="flex w-full max-w-[54ch] flex-col items-start gap-6">
        <p className="type-label flex items-center gap-3 text-[var(--text-tertiary)]">
          <span aria-hidden="true" className="h-px w-8 bg-[var(--color-yellow)]" />
          404
        </p>

        <h1 className="type-display-l text-[var(--text-primary)]">
          That one got away.
        </h1>

        <p className="measure type-body-lg text-[var(--text-secondary)]">
          The page you were looking for is not here. It may have moved, or the link may have been
          mistyped.
        </p>

        <nav aria-label="Suggested pages" className="flex flex-col gap-3">
          <p className="type-label text-[var(--text-secondary)]">Try one of these</p>
          <ul className="flex flex-wrap gap-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex h-11 items-center rounded-[4px] border border-[var(--color-line-strong)] px-4 text-[0.9375rem] font-medium transition-colors duration-200 hover:border-[var(--color-ink)] hover:bg-[var(--surface-raised)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href="/"
          className="mt-2 inline-flex h-11 items-center rounded-[4px] bg-[var(--color-ink)] px-5 font-semibold text-white transition-colors duration-200 hover:bg-[var(--interactive-hover)]"
        >
          Back to the home page
        </Link>
      </div>
    </main>
  );
}
