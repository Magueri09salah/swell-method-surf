import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/server/db";
import type { CoachingOfferData } from "@/lib/validation/admin";
import { CACHE_TAGS, type CoachingOfferDTO } from "./types";
import { safeRead } from "./safe-read";

type Row = Awaited<ReturnType<typeof prisma.coachingOffer.findMany>>[number];

/** Prisma Decimal -> number happens here, at the service boundary. */
function toDTO(row: Row): CoachingOfferDTO {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.shortDescription,
    description: row.description,
    level: row.level,
    format: row.format,
    durationMinutes: row.durationMinutes,
    price: Number(row.price),
    currency: row.currency,
    maxParticipants: row.maxParticipants,
    includes: row.includes,
    imageUrl: row.imageUrl,
    imageAlt: row.imageAlt,
    featured: row.featured,
    active: row.active,
    sortOrder: row.sortOrder,
  };
}

async function readActiveOffers(): Promise<CoachingOfferDTO[]> {
  const rows = await safeRead("coaching:active", () => prisma.coachingOffer.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  }), []);
  return rows.map(toDTO);
}

export const getActiveOffers = unstable_cache(readActiveOffers, ["coaching-active"], {
  tags: [CACHE_TAGS.coaching],
  revalidate: 3600,
});

async function readFeaturedOffers(): Promise<CoachingOfferDTO[]> {
  return safeRead(
    "coaching:featured",
    async () => {
      const rows = await prisma.coachingOffer.findMany({
        where: { active: true, featured: true },
        orderBy: [{ sortOrder: "asc" }],
        take: 3,
      });
      // Fall back to the first few active offers so the homepage is never empty
      // just because nobody has ticked "featured" yet.
      if (rows.length > 0) return rows.map(toDTO);

      const fallback = await prisma.coachingOffer.findMany({
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }],
        take: 3,
      });
      return fallback.map(toDTO);
    },
    [],
  );
}

export const getFeaturedOffers = unstable_cache(readFeaturedOffers, ["coaching-featured"], {
  tags: [CACHE_TAGS.coaching],
  revalidate: 3600,
});

/** Admin listing — includes inactive offers. */
export async function listAllOffers(): Promise<CoachingOfferDTO[]> {
  const rows = await prisma.coachingOffer.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(toDTO);
}

export async function getOfferById(id: string): Promise<CoachingOfferDTO | null> {
  const row = await prisma.coachingOffer.findUnique({ where: { id } });
  return row ? toDTO(row) : null;
}

/** Newline-separated textarea -> string[]. Blank lines dropped. */
function parseIncludes(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export async function createOffer(data: CoachingOfferData): Promise<string> {
  const created = await prisma.coachingOffer.create({
    data: {
      title: data.title,
      slug: data.slug,
      shortDescription: data.shortDescription,
      description: data.description ?? "",
      level: data.level,
      format: data.format,
      durationMinutes: data.durationMinutes,
      price: data.price,
      currency: data.currency,
      maxParticipants: data.maxParticipants,
      includes: parseIncludes(data.includes),
      imageUrl: data.imageUrl || null,
      imageAlt: data.imageAlt || null,
      featured: data.featured,
      active: data.active,
      sortOrder: data.sortOrder,
    },
    select: { id: true },
  });
  return created.id;
}

export async function updateOffer(id: string, data: CoachingOfferData): Promise<void> {
  await prisma.coachingOffer.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      shortDescription: data.shortDescription,
      description: data.description ?? "",
      level: data.level,
      format: data.format,
      durationMinutes: data.durationMinutes,
      price: data.price,
      currency: data.currency,
      maxParticipants: data.maxParticipants,
      includes: parseIncludes(data.includes),
      imageUrl: data.imageUrl || null,
      imageAlt: data.imageAlt || null,
      featured: data.featured,
      active: data.active,
      sortOrder: data.sortOrder,
    },
  });
}

export async function deleteOffer(id: string): Promise<void> {
  // Bookings reference offers with onDelete: SetNull, so historical bookings
  // survive the deletion of an offer that is no longer sold.
  await prisma.coachingOffer.delete({ where: { id } });
}

export async function setOfferFlag(
  id: string,
  field: "active" | "featured",
  value: boolean,
): Promise<void> {
  await prisma.coachingOffer.update({ where: { id }, data: { [field]: value } });
}

/**
 * Swaps sortOrder with the adjacent offer. Doing it as a transaction keeps the
 * list consistent if two reorders race.
 */
export async function reorderOffer(id: string, direction: "up" | "down"): Promise<void> {
  const all = await prisma.coachingOffer.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, sortOrder: true },
  });

  const index = all.findIndex((row) => row.id === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  const current = all[index];
  const target = all[swapIndex];
  if (!current || !target) return;

  await prisma.$transaction([
    prisma.coachingOffer.update({ where: { id: current.id }, data: { sortOrder: swapIndex } }),
    prisma.coachingOffer.update({ where: { id: target.id }, data: { sortOrder: index } }),
  ]);
}

export async function slugExists(slug: string, exceptId?: string): Promise<boolean> {
  const row = await prisma.coachingOffer.findUnique({ where: { slug }, select: { id: true } });
  return Boolean(row && row.id !== exceptId);
}
