import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/server/db";
import { SITE } from "@/lib/constants";
import { CACHE_TAGS } from "./types";
import { safeRead } from "./safe-read";

/**
 * Flat key/value site settings. One row per key so adding a setting never needs
 * a migration.
 */

export type SiteSettings = {
  businessName: string;
  email: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  location: string;
  mapsUrl: string;
  currency: string;
  timezone: string;
  seoTitle: string;
  seoDescription: string;
};

export const SETTINGS_DEFAULTS: SiteSettings = {
  businessName: SITE.name,
  email: "",
  phone: "",
  whatsapp: "",
  instagram: "",
  location: `${SITE.locality}, ${SITE.country}`,
  mapsUrl: "",
  currency: SITE.defaultCurrency,
  timezone: SITE.timezone,
  seoTitle: `${SITE.name} — ${SITE.tagline}`,
  seoDescription:
    "Private, semi-private and small-group surf coaching in Imsouane, Morocco. Technique-led sessions on one of the country's longest right-hand waves.",
};

async function readSettings(): Promise<SiteSettings> {
  const rows = await safeRead("settings", () => prisma.siteSetting.findMany(), []);
  const stored = Object.fromEntries(rows.map((row) => [row.key, row.value]));

  // Merge over defaults so a missing or newly added key always has a value.
  const merged = { ...SETTINGS_DEFAULTS };
  for (const key of Object.keys(SETTINGS_DEFAULTS) as (keyof SiteSettings)[]) {
    const value = stored[key];
    if (typeof value === "string" && value.length > 0) merged[key] = value;
  }
  return merged;
}

export const getSettings = unstable_cache(readSettings, ["site-settings"], {
  tags: [CACHE_TAGS.settings],
  revalidate: 3600,
});

/** Uncached — the admin form must see the true stored values. */
export async function getSettingsForEdit(): Promise<SiteSettings> {
  return readSettings();
}

export async function saveSettings(values: Partial<SiteSettings>): Promise<void> {
  const entries = Object.entries(values).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      }),
    ),
  );
}
