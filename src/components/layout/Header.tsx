import Link from "next/link";
import { NAV_LINKS } from "@/lib/constants";
import { Logo } from "@/components/brand/Logo";
import { MobileNav } from "./MobileNav";
import { NavLink } from "./NavLink";

/**
 * Site header — white bar, mono nav, black booking pill, as in the Figma.
 *
 * A server component: only the mobile sheet and the active-link detection are
 * client-side, so the bar itself ships no JavaScript.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-line)] bg-[var(--surface-raised)]">
      <div className="mx-auto flex h-[68px] w-full max-w-[1480px] items-center justify-between gap-6 px-5 md:px-8 xl:px-12">
        <Link
          href="/"
          className="rounded-[4px] transition-opacity duration-200 hover:opacity-70"
          aria-label="Swell Method Surf — home"
        >
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className="hidden h-11 items-center rounded-[9999px] bg-[var(--color-ink)] px-6 type-label text-white transition-colors duration-200 hover:bg-[var(--color-yellow)] hover:text-[var(--color-ink)] sm:inline-flex"
          >
            Book now
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
