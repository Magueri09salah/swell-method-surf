/**
 * Static, non-editable application constants.
 *
 * Anything the coach should be able to change at runtime (phone number, social
 * links, hero copy) lives in the database as a SiteSetting or ContentSection —
 * NOT here. This file holds structure, not content.
 */

export const SITE = {
  name: "Swell Method Surf",
  shortName: "Swell Method",
  tagline: "Surf Coaching — Imsouane, Morocco",
  locality: "Imsouane",
  region: "Souss-Massa",
  country: "Morocco",
  countryCode: "MA",
  timezone: "Africa/Casablanca",
  defaultCurrency: "MAD",
  locale: "en_GB",
} as const;

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

/** Primary navigation. Order is deliberate: it follows the decision journey. */
export const NAV_LINKS = [
  { href: "/method", label: "The Method" },
  { href: "/coaching", label: "Coaching" },
  { href: "/imsouane", label: "Imsouane" },
  { href: "/about", label: "The Coach" },
  { href: "/gallery", label: "Gallery" },
] as const;

/** Secondary links that appear in the footer but not the main bar. */
export const FOOTER_LINKS = [
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Book a Session" },
] as const;

export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard", exact: true },
  { href: "/admin/bookings", label: "Bookings", icon: "CalendarCheck" },
  { href: "/admin/clients", label: "Clients", icon: "Users" },
  { href: "/admin/coaching", label: "Coaching", icon: "Waves" },
  { href: "/admin/packages", label: "Packages", icon: "Package" },
  { href: "/admin/gallery", label: "Gallery", icon: "Images" },
  { href: "/admin/content", label: "Content", icon: "FileText" },
  { href: "/admin/messages", label: "Messages", icon: "Mail" },
  { href: "/admin/settings", label: "Settings", icon: "Settings" },
] as const;

// ---------------------------------------------------------------------------
// Enum display labels.
// The database stores stable SCREAMING_CASE; humans never see it.
// ---------------------------------------------------------------------------

export const EXPERIENCE_LEVEL_LABELS = {
  FIRST_TIME: "First time",
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
} as const;

export const COACHING_FORMAT_LABELS = {
  PRIVATE: "Private",
  SEMI_PRIVATE: "Semi-private",
  GROUP: "Group",
  NOT_SURE: "Not sure yet",
} as const;

export const COACHING_LEVEL_LABELS = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  ALL_LEVELS: "All levels",
} as const;

export const BOOKING_STATUS_LABELS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REJECTED: "Declined",
} as const;

export const GALLERY_CATEGORY_LABELS = {
  SURF: "Surf",
  COACHING: "Coaching",
  IMSOUANE: "Imsouane",
  OCEAN: "Ocean",
  LIFESTYLE: "Lifestyle",
} as const;

export const DAY_STATUS_LABELS = {
  AVAILABLE: "Available",
  LIMITED: "Limited",
  UNAVAILABLE: "Unavailable",
} as const;

export const MESSAGE_STATUS_LABELS = {
  UNREAD: "Unread",
  READ: "Read",
  ARCHIVED: "Archived",
} as const;

/**
 * Booking status → badge tone. Tone maps to a semantic color AND an icon in the
 * Badge component, so status is never communicated by color alone.
 */
export const BOOKING_STATUS_TONE = {
  PENDING: "warning",
  CONFIRMED: "success",
  COMPLETED: "neutral",
  CANCELLED: "muted",
  REJECTED: "danger",
} as const;

/**
 * The Swell Method pillars. Structural rather than editorial — the prose for
 * each lives in the `method.pillars` ContentSection so the coach can rewrite it.
 */
export const METHOD_PILLARS = [
  { id: "read", number: "01", title: "Read" },
  { id: "position", number: "02", title: "Position" },
  { id: "paddle", number: "03", title: "Paddle" },
  { id: "take-off", number: "04", title: "Take Off" },
  { id: "ride", number: "05", title: "Ride" },
  { id: "progress", number: "06", title: "Progress" },
] as const;

/** Fallback contact details, used only until the coach saves real settings. */
export const CONTACT_FALLBACK = {
  email: "hello@swellmethodsurf.com",
  phone: "",
  whatsapp: "",
  instagram: "",
} as const;

export const PAGE_SIZE = 20;
