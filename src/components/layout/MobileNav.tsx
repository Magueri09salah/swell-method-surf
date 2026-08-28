"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

/**
 * Mobile navigation.
 *
 * Radix Dialog gives the accessibility behaviour for free and correctly:
 * focus trap, Escape to close, focus restored to the trigger, background
 * inert, and scroll lock. Hand-rolling this is where mobile menus usually
 * break for keyboard and screen-reader users.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="grid size-11 cursor-pointer place-items-center rounded-[4px] text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--color-line-subtle)] lg:hidden"
        >
          <Menu aria-hidden="true" className="size-5" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgba(20,20,20,0.55)] lg:hidden" />

        <Dialog.Content
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-[min(88vw,26rem)] flex-col",
            "border-l border-[var(--color-line)] bg-[var(--surface-page)] lg:hidden",
          )}
        >
          <Dialog.Title className="sr-only">Site navigation</Dialog.Title>
          <Dialog.Description className="sr-only">
            Links to the main pages of the Swell Method Surf website.
          </Dialog.Description>

          <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
            <Logo variant="compact" />
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close menu"
                className="grid size-11 cursor-pointer place-items-center rounded-[4px] transition-colors duration-200 hover:bg-[var(--color-line-subtle)]"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </Dialog.Close>
          </div>

          <nav aria-label="Mobile" className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-6">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center rounded-[4px] px-3 font-display text-2xl transition-colors duration-200",
                    active
                      ? "text-[var(--color-ink)]"
                      : "text-[var(--text-primary)] hover:bg-[var(--color-line-subtle)]",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-[var(--color-line)] p-4">
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="flex h-13 min-h-12 items-center justify-center rounded-[4px] bg-[var(--color-ink)] px-6 font-semibold text-white transition-colors duration-200 hover:bg-[var(--interactive-hover)]"
            >
              Book a session
            </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
