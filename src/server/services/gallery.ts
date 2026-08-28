import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/server/db";
import type { GalleryImageData } from "@/lib/validation/admin";
import { CACHE_TAGS, type GalleryImageDTO } from "./types";
import { safeRead } from "./safe-read";

type Row = Awaited<ReturnType<typeof prisma.galleryImage.findMany>>[number];

function toDTO(row: Row): GalleryImageDTO {
  return {
    id: row.id,
    title: row.title,
    imageUrl: row.imageUrl,
    altText: row.altText,
    caption: row.caption,
    category: row.category,
    width: row.width,
    height: row.height,
    featured: row.featured,
    published: row.published,
    sortOrder: row.sortOrder,
  };
}

async function readPublished(): Promise<GalleryImageDTO[]> {
  const rows = await safeRead(
    "gallery:published",
    () =>
      prisma.galleryImage.findMany({
        where: { published: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      }),
    [],
  );
  return rows.map(toDTO);
}

export const getPublishedGallery = unstable_cache(readPublished, ["gallery-published"], {
  tags: [CACHE_TAGS.gallery],
  revalidate: 3600,
});

async function readFeatured(limit: number): Promise<GalleryImageDTO[]> {
  const rows = await safeRead(
    "gallery:preview",
    () =>
      prisma.galleryImage.findMany({
        where: { published: true },
        orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
        take: limit,
      }),
    [],
  );
  return rows.map(toDTO);
}

export const getGalleryPreview = unstable_cache(readFeatured, ["gallery-preview"], {
  tags: [CACHE_TAGS.gallery],
  revalidate: 3600,
});

export async function listAllGalleryImages(): Promise<GalleryImageDTO[]> {
  const rows = await prisma.galleryImage.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(toDTO);
}

export async function getGalleryImageById(id: string): Promise<GalleryImageDTO | null> {
  const row = await prisma.galleryImage.findUnique({ where: { id } });
  return row ? toDTO(row) : null;
}

export async function createGalleryImage(data: GalleryImageData): Promise<void> {
  await prisma.galleryImage.create({
    data: {
      title: data.title,
      imageUrl: data.imageUrl,
      altText: data.altText,
      caption: data.caption || null,
      category: data.category,
      width: data.width ?? null,
      height: data.height ?? null,
      featured: data.featured,
      published: data.published,
      sortOrder: data.sortOrder,
    },
  });
}

export async function updateGalleryImage(id: string, data: GalleryImageData): Promise<void> {
  await prisma.galleryImage.update({
    where: { id },
    data: {
      title: data.title,
      imageUrl: data.imageUrl,
      altText: data.altText,
      caption: data.caption || null,
      category: data.category,
      width: data.width ?? null,
      height: data.height ?? null,
      featured: data.featured,
      published: data.published,
      sortOrder: data.sortOrder,
    },
  });
}

export async function deleteGalleryImage(id: string): Promise<void> {
  await prisma.galleryImage.delete({ where: { id } });
}

export async function setGalleryFlag(
  id: string,
  field: "published" | "featured",
  value: boolean,
): Promise<void> {
  await prisma.galleryImage.update({ where: { id }, data: { [field]: value } });
}

export async function reorderGalleryImage(id: string, direction: "up" | "down"): Promise<void> {
  const all = await prisma.galleryImage.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: { id: true },
  });

  const index = all.findIndex((row) => row.id === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  const current = all[index];
  const target = all[swapIndex];
  if (!current || !target) return;

  await prisma.$transaction([
    prisma.galleryImage.update({ where: { id: current.id }, data: { sortOrder: swapIndex } }),
    prisma.galleryImage.update({ where: { id: target.id }, data: { sortOrder: index } }),
  ]);
}
