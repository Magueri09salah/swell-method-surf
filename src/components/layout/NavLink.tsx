"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Desktop nav link with an underline that wipes in from the left on hover and
 * stays put on the current page. `aria-current="page"` carries the state for
 * assistive tech — the underline alone never does.
 */
export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative inline-flex h-11 items-center rounded-[4px] px-3 text-[0.9375rem] font-medium transition-colors duration-200",
        active ? "text-[var(--color-ink)]" : "text-[var(--text-primary)] hover:text-[var(--color-ink)]",
      )}
    >
      {children}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-3 bottom-2 h-px origin-left bg-[var(--color-yellow)] transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
        )}
      />
    </Link>
  );
}
