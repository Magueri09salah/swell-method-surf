import { z } from "zod";

/** Validation for every admin CRUD surface. Mirrors prisma/schema.prisma. */

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(160),
  password: z.string().min(1, "Enter your password.").max(200),
});

export type LoginData = z.output<typeof loginSchema>;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * An image reference.
 *
 * Deliberately NOT `z.string().url()`. Images now live in three places:
 *   /api/media/<id>        uploaded through the admin
 *   /photography/name.jpg  shipped in public/
 *   https://host/path      an allow-listed remote host
 *
 * `.url()` rejects the first two outright, which is exactly the bug that made
 * every coaching offer unsaveable once photography moved local.
 *
 * A leading `//` is rejected because it is protocol-relative: it looks like a
 * local path but resolves to a third-party host.
 */
export const imageRef = z
  .string()
  .trim()
  .max(500, "That address is too long.")
  .refine(
    (v) =>
      v === "" ||
      (v.startsWith("/") && !v.startsWith("//")) ||
      /^https:\/\//.test(v),
    "Enter a path inside this site (starting with /) or an https:// address.",
  );

export const coachingOfferSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2, "Give this offer a title.").max(90),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "A slug is required.")
    .max(90)
    .regex(slugPattern, "Use lowercase letters, numbers and hyphens only."),
  shortDescription: z
    .string()
    .trim()
    .min(10, "Add a short summary — it appears on cards.")
    .max(220, "Keep the summary under 220 characters."),
  /**
   * Optional. The long description was removed from the admin form at the
   * client's request — cards only ever show `shortDescription`, so requiring a
   * second body of copy was asking for work nothing rendered.
   */
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]),
  format: z.enum(["PRIVATE", "SEMI_PRIVATE", "GROUP", "NOT_SURE"]),
  durationMinutes: z.coerce
    .number()
    .int()
    .min(15, "A session must be at least 15 minutes.")
    .max(600, "That is longer than a full day."),
  price: z.coerce.number().min(0, "Price cannot be negative.").max(1_000_000),
  currency: z.string().trim().length(3, "Use a 3-letter currency code.").toUpperCase(),
  maxParticipants: z.coerce.number().int().min(1).max(20),
  /** Newline-separated in the form, split to an array before persisting. */
  includes: z.string().max(2000).optional().or(z.literal("")),
  imageUrl: imageRef.optional().or(z.literal("")),
  imageAlt: z.string().trim().max(200).optional().or(z.literal("")),
  featured: z.coerce.boolean().default(false),
  active: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export type CoachingOfferData = z.output<typeof coachingOfferSchema>;

export const testimonialSchema = z.object({
  id: z.string().optional(),
  clientName: z.string().trim().min(2, "Add the reviewer's name.").max(80),
  origin: z.string().trim().max(80).optional().or(z.literal("")),
  quote: z.string().trim().min(10, "Add the review text.").max(1200),
  rating: z.coerce.number().int().min(1, "Rating must be 1–5.").max(5, "Rating must be 1–5."),
  avatarUrl: imageRef.optional().or(z.literal("")),
  sessionDate: z.string().optional().or(z.literal("")),
  featured: z.coerce.boolean().default(false),
  published: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export type TestimonialData = z.output<typeof testimonialSchema>;

export const galleryImageSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2, "Give the image a title.").max(120),
  imageUrl: imageRef.refine((v) => v.length > 0, "An image is required."),
  /** Required, not optional — every meaningful image needs alt text (WCAG 1.1.1). */
  altText: z
    .string()
    .trim()
    .min(4, "Alt text is required. Describe what is in the photograph.")
    .max(300),
  caption: z.string().trim().max(300).optional().or(z.literal("")),
  category: z.enum(["SURF", "COACHING", "IMSOUANE", "OCEAN", "LIFESTYLE"]),
  width: z.coerce.number().int().min(1).max(20000).optional(),
  height: z.coerce.number().int().min(1).max(20000).optional(),
  featured: z.coerce.boolean().default(false),
  published: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export type GalleryImageData = z.output<typeof galleryImageSchema>;

export const packageSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2, "Give this package a title.").max(90),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "A slug is required.")
    .max(90)
    .regex(slugPattern, "Use lowercase letters, numbers and hyphens only."),
  days: z.coerce
    .number()
    .int()
    .min(1, "A package is at least one day.")
    .max(60, "That is longer than a season."),
  price: z.coerce.number().min(0, "Price cannot be negative.").max(1_000_000),
  currency: z.string().trim().length(3, "Use a 3-letter currency code.").toUpperCase(),
  /** Newline-separated in the form, split to an array before persisting. */
  features: z.string().max(2000).optional().or(z.literal("")),
  imageUrl: imageRef.optional().or(z.literal("")),
  featured: z.coerce.boolean().default(false),
  active: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export type PackageData = z.output<typeof packageSchema>;

export const clientSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(160),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
  country: z.string().trim().max(60).optional().or(z.literal("")),
  experienceLevel: z
    .enum(["FIRST_TIME", "BEGINNER", "INTERMEDIATE", "ADVANCED"])
    .optional()
    .or(z.literal("")),
  notes: z.string().trim().max(4000).optional().or(z.literal("")),
});

export const siteSettingsSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(160),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(40).optional().or(z.literal("")),
  instagram: z.string().trim().max(200).optional().or(z.literal("")),
  location: z.string().trim().max(160).optional().or(z.literal("")),
  mapsUrl: z.string().trim().url("Enter a valid URL.").max(500).optional().or(z.literal("")),
  currency: z.string().trim().length(3).toUpperCase(),
  timezone: z.string().trim().max(60),
  seoTitle: z.string().trim().max(70, "Search engines truncate beyond ~60 characters.").optional().or(z.literal("")),
  seoDescription: z
    .string()
    .trim()
    .max(170, "Search engines truncate beyond ~160 characters.")
    .optional()
    .or(z.literal("")),
});

export type SiteSettingsData = z.output<typeof siteSettingsSchema>;

export const deleteByIdSchema = z.object({ id: z.string().min(1) });

export const reorderSchema = z.object({
  id: z.string().min(1),
  direction: z.enum(["up", "down"]),
});

export const toggleSchema = z.object({
  id: z.string().min(1),
  field: z.enum(["published", "featured", "active"]),
  value: z.coerce.boolean(),
});
