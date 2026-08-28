import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/server/db";
import {
  CONTENT_DEFAULTS,
  CONTENT_LABELS,
  CONTENT_SCHEMAS,
  type ContentData,
  type ContentKey,
} from "@/lib/validation/content";
import { CACHE_TAGS } from "./types";
import { safeRead } from "./safe-read";

/**
 * Typed CMS reads.
 *
 * `getContent` NEVER fails and never returns partial data. If the row is
 * missing, or was written by an older schema version, or the JSON no longer
 * parses, it falls back to the shipped default. A content edit can therefore
 * never take the public site down or render an empty section.
 */
async function readContent<K extends ContentKey>(key: K): Promise<ContentData<K>> {
  const row = await safeRead(`content:${key}`, () => prisma.contentSection.findUnique({ where: { key } }), null);
  if (!row) return CONTENT_DEFAULTS[key];

  const parsed = CONTENT_SCHEMAS[key].safeParse(row.data);
  if (!parsed.success) {
    console.warn(`[content] Row "${key}" failed validation; serving default.`, parsed.error.issues);
    return CONTENT_DEFAULTS[key];
  }

  return parsed.data as ContentData<K>;
}

export const getContent = unstable_cache(readContent, ["content-section"], {
  tags: [CACHE_TAGS.content],
  revalidate: 3600,
}) as <K extends ContentKey>(key: K) => Promise<ContentData<K>>;

/** Admin listing: every editable section with its current value. */
export async function listContentSections(): Promise<
  { key: ContentKey; label: string; updatedAt: string | null }[]
> {
  const rows = await prisma.contentSection.findMany({ select: { key: true, updatedAt: true } });
  const updatedByKey = new Map(rows.map((r) => [r.key, r.updatedAt.toISOString()]));

  return (Object.keys(CONTENT_SCHEMAS) as ContentKey[]).map((key) => ({
    key,
    label: CONTENT_LABELS[key],
    updatedAt: updatedByKey.get(key) ?? null,
  }));
}

/** Uncached read for the admin edit form, which must see the true stored value. */
export async function getContentForEdit<K extends ContentKey>(key: K): Promise<ContentData<K>> {
  return readContent(key);
}

export async function saveContent<K extends ContentKey>(
  key: K,
  data: ContentData<K>,
): Promise<void> {
  await prisma.contentSection.upsert({
    where: { key },
    create: { key, label: CONTENT_LABELS[key], data: data as object },
    update: { data: data as object, label: CONTENT_LABELS[key] },
  });
}
