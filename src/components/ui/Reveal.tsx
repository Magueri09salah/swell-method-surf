"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll reveal (docs/DECISIONS.md D-009).
 *
 * Deliberately NOT a motion library — ~40 lines and zero dependencies for what
 * is a fade-and-rise.
 *
 * SAFETY PROPERTY: content is visible by default. The hidden state is only
 * applied after this component has mounted AND confirmed IntersectionObserver
 * support (which sets data-reveal="on" on <html>). If JavaScript fails, the
 * observer never fires, or hydration is delayed, the content is simply there.
 * An animation must never be able to hide content.
 *
 * IMPLEMENTATION NOTE: this drives the DOM through a ref rather than React
 * state. Reveal is a pure visual side-effect on an external system (the DOM),
 * so routing it through state would trigger cascading re-renders on every
 * element that scrolls into view — for zero benefit, since React never needs
 * to know the value. It also keeps the server-rendered markup free of any
 * reveal attribute, so there is nothing to hydrate-mismatch.
 *
 * `prefers-reduced-motion` is handled entirely in globals.css, so the CSS
 * stays the single source of truth for motion policy.
 */

type RevealProps = {
  children: ReactNode;
  /** Stagger offset in ms. Cap at ~6 children before grouping instead. */
  delay?: number;
  as?: ElementType;
  className?: string;
};

export function Reveal({ children, delay = 0, as: Tag = "div", className }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    // Signals to the stylesheet that hiding is now safe, because JS is running.
    document.documentElement.dataset.reveal = "on";
    node.dataset.reveal = "pending";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.dataset.reveal = "shown";
            observer.disconnect();
          }
        }
      },
      // Fire slightly before the element is fully in view, so the motion is
      // already settling by the time the reader reaches it.
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
      className={cn("will-change-[opacity,transform]", className)}
    >
      {children}
    </Tag>
  );
}
