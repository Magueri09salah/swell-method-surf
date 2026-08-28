"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { GALLERY_CATEGORY_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { GalleryImageDTO } from "@/server/services/types";

/**
 * Editorial gallery with filtering and a lightbox.
 *
 * Layout is an intentional rhythm, not a uniform grid: every fourth image spans
 * two columns on desktop, so the wall reads as a spread rather than a contact
 * sheet.
 *
 * The lightbox is a Radix Dialog, so focus trap, Escape, background inert and
 * focus restoration all come for free. Arrow-key navigation is added on top.
 */
export function GalleryGrid({ images }: { images: GalleryImageDTO[] }) {
  const [category, setCategory] = useState<string>("ALL");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const categories = useMemo(() => {
    const present = new Set(images.map((image) => image.category));
    return ["ALL", ...Object.keys(GALLERY_CATEGORY_LABELS).filter((key) => present.has(key as GalleryImageDTO["category"]))];
  }, [images]);

  const filtered = useMemo(
    () => (category === "ALL" ? images : images.filter((image) => image.category === category)),
    [images, category],
  );

  const active = activeIndex === null ? null : (filtered[activeIndex] ?? null);

  const step = useCallback(
    (delta: number) => {
      setActiveIndex((current) => {
        if (current === null || filtered.length === 0) return current;
        return (current + delta + filtered.length) % filtered.length;
      });
    },
    [filtered.length],
  );

  useEffect(() => {
    if (activeIndex === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, step]);

  return (
    <div className="flex flex-col gap-8">
      {categories.length > 2 && (
        <div
          role="group"
          aria-label="Filter photographs by category"
          className="hide-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0"
        >
          {categories.map((key) => {
            const selected = category === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setCategory(key);
                  setActiveIndex(null);
                }}
                aria-pressed={selected}
                className={cn(
                  "h-11 shrink-0 cursor-pointer rounded-[4px] border px-4 text-[0.875rem] font-medium transition-colors duration-200",
                  selected
                    ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                    : "border-[var(--color-line-strong)] text-[var(--text-primary)] hover:border-[var(--color-ink)]",
                )}
              >
                {key === "ALL"
                  ? "All"
                  : GALLERY_CATEGORY_LABELS[key as keyof typeof GALLERY_CATEGORY_LABELS]}
              </button>
            );
          })}
        </div>
      )}

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {filtered.map((image, index) => (
          <li
            key={image.id}
            className={cn(
              "relative",
              // Break the uniform grid — every 4th tile runs wide and tall.
              index % 4 === 0 && "md:col-span-2 md:row-span-2",
            )}
          >
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group relative block size-full cursor-pointer overflow-hidden rounded-[4px] border border-[var(--color-line)] transition-colors duration-200 hover:border-[var(--color-ink)]"
            >
              <span className={cn("block", index % 4 === 0 ? "aspect-square" : "aspect-[4/5]")}>
                <Image
                  src={image.imageUrl}
                  alt={image.altText}
                  fill
                  loading="lazy"
                  sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 25vw"
                  className="object-cover transition-transform duration-[560ms] ease-[cubic-bezier(0.16,0.84,0.24,1)] group-hover:scale-[1.04]"
                />
              </span>
              <span className="sr-only">View larger: {image.title}</span>
            </button>
          </li>
        ))}
      </ul>

      <Dialog.Root
        open={activeIndex !== null}
        onOpenChange={(open) => !open && setActiveIndex(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgba(20,20,20,0.92)]" />
          <Dialog.Content className="fixed inset-0 z-50 flex flex-col p-4 md:p-8">
            <Dialog.Title className="sr-only">{active?.title ?? "Photograph"}</Dialog.Title>
            <Dialog.Description className="sr-only">
              {active?.altText ?? ""}
            </Dialog.Description>

            <div className="flex justify-end">
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close"
                  className="grid size-11 cursor-pointer place-items-center rounded-[4px] text-[var(--color-paper)] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.12)]"
                >
                  <X aria-hidden="true" className="size-6" />
                </button>
              </Dialog.Close>
            </div>

            {active && (
              <div className="flex min-h-0 flex-1 items-center gap-2 md:gap-4">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous photograph"
                  className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-[var(--color-paper)] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.12)]"
                >
                  <ChevronLeft aria-hidden="true" className="size-6" />
                </button>

                <figure className="flex min-h-0 flex-1 flex-col items-center gap-3">
                  <div className="relative min-h-0 w-full flex-1">
                    <Image
                      src={active.imageUrl}
                      alt={active.altText}
                      fill
                      sizes="90vw"
                      className="object-contain"
                    />
                  </div>
                  <figcaption className="text-center">
                    <p className="type-body-sm font-semibold text-[var(--color-paper)]">
                      {active.title}
                    </p>
                    {active.caption && (
                      <p className="type-caption text-[var(--text-on-inverse-dim)]">
                        {active.caption}
                      </p>
                    )}
                    <p className="type-caption mt-1 text-[var(--text-on-inverse-dim)]">
                      {activeIndex !== null ? activeIndex + 1 : 0} of {filtered.length}
                    </p>
                  </figcaption>
                </figure>

                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next photograph"
                  className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-[var(--color-paper)] transition-colors duration-200 hover:bg-[rgba(255,255,255,0.12)]"
                >
                  <ChevronRight aria-hidden="true" className="size-6" />
                </button>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
