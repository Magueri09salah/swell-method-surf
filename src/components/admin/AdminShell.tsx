"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  FileText,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Settings,
  Users,
  Waves,
  X,
} from "lucide-react";
import { ADMIN_NAV } from "@/lib/constants";
import { Logo } from "@/components/brand/Logo";
import { logoutAction } from "@/server/actions/auth";
import { cn } from "@/lib/utils";

/**
 * Admin chrome.
 *
 * Same tokens as the public site, different priorities: denser spacing, sans
 * throughout, an inverse sidebar. No new colours, no gradients, no SaaS blue
 * (DESIGN_SYSTEM.md §12).
 *
 * Adaptive navigation: a persistent sidebar at >=1024px, a slide-over below it.
 */

const ICONS = {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Waves,
  Package,
  Images,
  FileText,
  Mail,
  Settings,
} as const;

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-0.5">
      {ADMIN_NAV.map((item) => {
        const Icon = ICONS[item.icon];
        const active =
          "exact" in item && item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-[4px] px-3 text-[0.9375rem] font-medium transition-colors duration-200",
                active
                  ? "bg-[rgba(242,233,89,0.20)] text-[var(--color-yellow)]"
                  : "text-[var(--color-paper)] hover:bg-[rgba(255,255,255,0.08)]",
              )}
            >
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SidebarBody({
  userName,
  onNavigate,
}: {
  userName: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-[var(--surface-inverse)]">
      <div className="border-b border-[rgba(255,255,255,0.14)] p-5">
        <Link href="/admin" onClick={onNavigate} className="inline-block">
          <Logo tone="light" />
        </Link>
      </div>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto p-3">
        <NavItems onNavigate={onNavigate} />
      </nav>

      <div className="border-t border-[rgba(255,255,255,0.14)] p-3">
        <p className="px-3 pb-2 type-caption text-[var(--text-on-inverse-dim)]">
          Signed in as {userName}
        </p>

        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 items-center gap-3 rounded-[4px] px-3 type-body-sm text-[var(--color-paper)] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.08)]"
        >
          <Waves aria-hidden="true" className="size-4" />
          View the website
        </Link>

        <form action={logoutAction}>
          <button
            type="submit"
            className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-[4px] px-3 type-body-sm text-[var(--color-paper)] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.08)]"
          >
            <LogOut aria-hidden="true" className="size-4" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

export function AdminShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-[var(--surface-page)]">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[4px] focus:bg-[var(--color-ink)] focus:px-4 focus:py-2.5 focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 hidden w-64 lg:block">
        <SidebarBody userName={userName} />
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-pointer bg-[rgba(20,20,20,0.55)]"
          />
          <div className="absolute inset-y-0 left-0 w-[min(80vw,17rem)]">
            <SidebarBody userName={userName} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[var(--color-line)] bg-[var(--surface-page)] px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid size-11 cursor-pointer place-items-center rounded-[4px] transition-colors duration-200 hover:bg-[var(--color-line-subtle)]"
          >
            {open ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <Menu aria-hidden="true" className="size-5" />
            )}
          </button>
          <Logo variant="compact" />
        </header>

        <main id="admin-main" className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
