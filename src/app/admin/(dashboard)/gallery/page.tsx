import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { AdminHeading } from "@/components/admin/ui";
import { Badge, EmptyState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { ConfirmSubmit, InlineSubmit } from "@/components/admin/ConfirmSubmit";
import { listAllGalleryImages } from "@/server/services/gallery";
import {
  deleteGalleryImage,
  reorderGalleryImage,
  toggleGalleryFlag,
} from "@/server/actions/admin";
import { GALLERY_CATEGORY_LABELS } from "@/lib/constants";

/**
 * Gallery admin uses a card grid rather than a table — for images, the
 * thumbnail IS the identifying information, so a text row would be worse.
 */
export default async function GalleryAdminPage() {
  const images = await listAllGalleryImages();

  return (
    <>
      <AdminHeading
        title="Gallery"
        description="Photographs shown on the gallery page and in the homepage preview."
        action={
          <ButtonLink href="/admin/gallery/new" size="sm">
            <Plus aria-hidden="true" className="size-3.5" />
            Add image
          </ButtonLink>
        }
      />

      {images.length === 0 ? (
        <EmptyState
          title="No images yet"
          description="Add photographs of the bay, the coaching and the coastline. Every image needs alt text so it works for people using a screen reader."
          action={<ButtonLink href="/admin/gallery/new">Add the first image</ButtonLink>}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {images.map((image) => (
            <li
              key={image.id}
              className="flex flex-col overflow-hidden rounded-[8px] border border-[var(--color-line)] bg-[var(--surface-raised)]"
            >
              <div className="relative aspect-[4/3] border-b border-[var(--color-line)]">
                <Image
                  src={image.imageUrl}
                  alt={image.altText}
                  fill
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                  className="object-cover"
                />
                {!image.published && (
                  <span className="absolute left-2 top-2">
                    <Badge tone="muted">Hidden</Badge>
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-2 p-4">
                <Link
                  href={`/admin/gallery/${image.id}`}
                  className="type-body-sm font-semibold text-[var(--color-ink)] underline-offset-4 hover:underline"
                >
                  {image.title}
                </Link>

                <p className="line-clamp-2 type-caption text-[var(--text-secondary)]">
                  {image.altText}
                </p>

                <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
                  <Badge tone="neutral" withIcon={false}>
                    {GALLERY_CATEGORY_LABELS[image.category]}
                  </Badge>
                  {image.featured && <Badge tone="warning">Featured</Badge>}
                </div>

                <div className="flex items-center justify-between border-t border-[var(--color-line-subtle)] pt-2">
                  <div className="flex items-center gap-0.5">
                    <form action={reorderGalleryImage}>
                      <input type="hidden" name="id" value={image.id} />
                      <input type="hidden" name="direction" value="up" />
                      <InlineSubmit label={`Move ${image.title} earlier`}>
                        <ArrowUp aria-hidden="true" className="size-4" />
                      </InlineSubmit>
                    </form>
                    <form action={reorderGalleryImage}>
                      <input type="hidden" name="id" value={image.id} />
                      <input type="hidden" name="direction" value="down" />
                      <InlineSubmit label={`Move ${image.title} later`}>
                        <ArrowDown aria-hidden="true" className="size-4" />
                      </InlineSubmit>
                    </form>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <form action={toggleGalleryFlag}>
                      <input type="hidden" name="id" value={image.id} />
                      <input type="hidden" name="field" value="published" />
                      <input
                        type="hidden"
                        name="value"
                        value={image.published ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        className="h-11 cursor-pointer rounded-[4px] px-2.5 type-caption font-semibold text-[var(--text-secondary)] transition-colors duration-200 hover:bg-[var(--color-line-subtle)] hover:text-[var(--color-ink)]"
                      >
                        {image.published ? "Hide" : "Show"}
                      </button>
                    </form>

                    <form action={deleteGalleryImage}>
                      <input type="hidden" name="id" value={image.id} />
                      <ConfirmSubmit
                        iconOnly
                        label={`Delete ${image.title}`}
                        message={`Delete "${image.title}" from the gallery? This cannot be undone.`}
                      />
                    </form>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
