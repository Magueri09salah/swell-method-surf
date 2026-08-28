/**
 * Shared service-layer contracts.
 *
 * Services return DTOs, never Prisma models. Decimal is converted to number and
 * Date to ISO string at this boundary, so nothing non-serialisable can cross
 * into a client component. See docs/ARCHITECTURE.md §2.
 */

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export function ok(): ActionResult<undefined>;
export function ok<T>(data: T): ActionResult<T>;
export function ok<T>(data?: T): ActionResult<T | undefined> {
  return { ok: true, data };
}

export function fail(
  error: string,
  fieldErrors?: Record<string, string[]>,
): ActionResult<never> {
  return { ok: false, error, ...(fieldErrors ? { fieldErrors } : {}) };
}

/** Cache tags. Admin mutations revalidate these so the public site updates. */
export const CACHE_TAGS = {
  coaching: "coaching",
  packages: "packages",
  testimonials: "testimonials",
  gallery: "gallery",
  content: "content",
  settings: "settings",
} as const;

export type CoachingOfferDTO = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
  format: "PRIVATE" | "SEMI_PRIVATE" | "GROUP" | "NOT_SURE";
  durationMinutes: number;
  price: number;
  currency: string;
  maxParticipants: number;
  includes: string[];
  imageUrl: string | null;
  imageAlt: string | null;
  featured: boolean;
  active: boolean;
  sortOrder: number;
};

export type TestimonialDTO = {
  id: string;
  clientName: string;
  origin: string | null;
  quote: string;
  rating: number;
  avatarUrl: string | null;
  sessionDate: string | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
};

export type GalleryImageDTO = {
  id: string;
  title: string;
  imageUrl: string;
  altText: string;
  caption: string | null;
  category: "SURF" | "COACHING" | "IMSOUANE" | "OCEAN" | "LIFESTYLE";
  width: number | null;
  height: number | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
};

export type BookingListItemDTO = {
  id: string;
  reference: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "REJECTED";
  clientName: string;
  clientEmail: string;
  offerTitle: string | null;
  /** What was asked for: a single session, or a multi-day package. */
  bookingType: "SESSION" | "PACKAGE";
  packageTitle: string | null;
  requestedFormat: "PRIVATE" | "SEMI_PRIVATE" | "GROUP" | "NOT_SURE";
  experienceLevel: "FIRST_TIME" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  preferredDate: string;
  preferredTime: string | null;
  participants: number;
  createdAt: string;
};

export type BookingDetailDTO = BookingListItemDTO & {
  clientId: string;
  clientPhone: string | null;
  clientWhatsapp: string | null;
  clientCountry: string | null;
  coachingOfferId: string | null;
  message: string | null;
  priceQuoted: number | null;
  currency: string;
  scheduledAt: string | null;
  notes: { id: string; body: string; authorName: string | null; createdAt: string }[];
};

export type ClientListItemDTO = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  experienceLevel: "FIRST_TIME" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | null;
  bookingCount: number;
  createdAt: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageCount: number;
};
