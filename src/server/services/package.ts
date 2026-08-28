import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/server/db";
import type { PackageData } from "@/lib/validation/admin";
import { CACHE_TAGS } from "./types";
import { safeRead } from "./safe-read";

/** Multi-day packages: several sessions bundled at a per-person price. */

export type PackageDTO = {
  id: string;
  title: string;
  slug: string;
  features: string[];
  price: number;
  currency: string;
  days: number;
  imageUrl: string | null;
  featured: boolean;
  active: boolean;
  sortOrder: number;
};

type Row = Awaited<ReturnType<typeof prisma.package.findMany>>[number];

/** Prisma Decimal -> number happens here, at the service boundary. */
function toDTO(row: Row): PackageDTO {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    features: row.features,
    price: Number(row.price),
    currency: row.currency,
    days: row.days,
    imageUrl: row.imageUrl,
    featured: row.featured,
    active: row.active,
    sortOrder: row.sortOrder,
  };
}

async function readActive(): Promise<PackageDTO[]> {
  const rows = await safeRead(
    "packages:active",
    () =>
      prisma.package.findMany({
        where: { active: true },
        orderBy: [{ sortOrder: "asc" }, { days: "asc" }],
      }),
    [],
  );
  return rows.map(toDTO);
}

export const getActivePackages = unstable_cache(readActive, ["packages-active"], {
  tags: [CACHE_TAGS.packages],
  revalidate: 3600,
});

/** Admin listing — includes inactive packages. */
export async function listAllPackages(): Promise<PackageDTO[]> {
  const rows = await prisma.package.findMany({
    orderBy: [{ sortOrder: "asc" }, { days: "asc" }],
  });
  return rows.map(toDTO);
}

export async function getPackageById(id: string): Promise<PackageDTO | null> {
  const row = await prisma.package.findUnique({ where: { id } });
  return row ? toDTO(row) : null;
}

/** Newline-separated textarea -> string[]. Blank lines dropped. */
function parseFeatures(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function toRow(data: PackageData) {
  return {
    title: data.title,
    slug: data.slug,
    features: parseFeatures(data.features),
    price: data.price,
    currency: data.currency,
    days: data.days,
    imageUrl: data.imageUrl || null,
    featured: data.featured,
    active: data.active,
    sortOrder: data.sortOrder,
  };
}

export async function createPackage(data: PackageData): Promise<void> {
  await prisma.package.create({ data: toRow(data) });
}

export async function updatePackage(id: string, data: PackageData): Promise<void> {
  await prisma.package.update({ where: { id }, data: toRow(data) });
}

export async function deletePackage(id: string): Promise<void> {
  await prisma.package.delete({ where: { id } });
}

export async function setPackageFlag(
  id: string,
  field: "active" | "featured",
  value: boolean,
): Promise<void> {
  await prisma.package.update({ where: { id }, data: { [field]: value } });
}

export async function reorderPackage(id: string, direction: "up" | "down"): Promise<void> {
  const all = await prisma.package.findMany({
    orderBy: [{ sortOrder: "asc" }, { days: "asc" }],
    select: { id: true },
  });

  const index = all.findIndex((row) => row.id === id);
  if (index === -1) return;

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  const current = all[index];
  const target = all[swapIndex];
  if (!current || !target) return;

  await prisma.$transaction([
    prisma.package.update({ where: { id: current.id }, data: { sortOrder: swapIndex } }),
    prisma.package.update({ where: { id: target.id }, data: { sortOrder: index } }),
  ]);
}

export async function packageSlugExists(slug: string, exceptId?: string): Promise<boolean> {
  const row = await prisma.package.findUnique({ where: { slug }, select: { id: true } });
  return Boolean(row && row.id !== exceptId);
}
