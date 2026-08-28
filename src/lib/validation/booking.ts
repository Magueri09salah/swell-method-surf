import { z } from "zod";

/**
 * Booking + contact validation.
 *
 * These schemas are the contract between the client form and the server action.
 * The client uses them for immediate feedback; the server ALWAYS re-parses.
 * Client-side validation is a convenience, never a security control.
 */

export const EXPERIENCE_LEVELS = [
  "FIRST_TIME",
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
] as const;

export const COACHING_FORMATS = ["PRIVATE", "SEMI_PRIVATE", "GROUP", "NOT_SURE"] as const;

/** A single session, or a multi-day package. */
export const BOOKING_KINDS = ["SESSION", "PACKAGE"] as const;

/** Upper bound on how far ahead a request may be made. */
const MAX_DAYS_AHEAD = 365;

const todayInBusinessTz = (): Date => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

export const bookingRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please tell us your name.")
    .max(80, "That name is too long."),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "We need an email address to reply to you.")
    .max(160, "That email address is too long.")
    .email("That does not look like a valid email address."),

  phone: z
    .string()
    .trim()
    .max(40, "That number is too long.")
    .optional()
    .or(z.literal("")),

  country: z
    .string()
    .trim()
    .max(60, "That is too long.")
    .optional()
    .or(z.literal("")),

  preferredDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a date.")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Please choose a valid date.")
    .refine((value) => new Date(value) >= todayInBusinessTz(), "Please choose a date in the future.")
    .refine((value) => {
      const limit = new Date(todayInBusinessTz());
      limit.setUTCDate(limit.getUTCDate() + MAX_DAYS_AHEAD);
      return new Date(value) <= limit;
    }, "Please choose a date within the next year."),


  participants: z.coerce
    .number({ message: "Please enter how many of you there are." })
    .int("Please enter a whole number.")
    .min(1, "There must be at least one surfer.")
    .max(8, "For groups larger than eight, please send a message instead."),

  experienceLevel: z.enum(EXPERIENCE_LEVELS, {
    message: "Please choose your experience level.",
  }),

  /**
   * Which half of the form was filled in. Defaults to SESSION so a payload
   * without it — an older client, or a no-JS submit — still validates.
   */
  bookingType: z.enum(BOOKING_KINDS).default("SESSION"),

  /** Required when bookingType is PACKAGE, ignored otherwise. */
  packageId: z.string().trim().max(40).optional().or(z.literal("")),

  coachingFormat: z.enum(COACHING_FORMATS, {
    message: "Please choose a coaching format.",
  }),

  /** Optional: the visitor may arrive from a specific offer page. */
  coachingOfferId: z.string().trim().max(40).optional().or(z.literal("")),

  message: z
    .string()
    .trim()
    .max(2000, "Please keep your message under 2000 characters.")
    .optional()
    .or(z.literal("")),

  /**
   * Sets the expectation that this is a request, not a confirmed session —
   * which prevents the worst possible outcome: someone flying to Imsouane
   * believing they have a booking.
   *
   * Validated HERE rather than relying on the input's `required` attribute,
   * because the form sets `noValidate` in order to use our own error
   * presentation.
   *
   * An unchecked box is absent from FormData entirely. Note that
   * `.optional().refine()` does NOT work for this: Zod skips refinements when
   * the value is `undefined`, so an absent box would silently pass. Preprocess
   * to a boolean first, then require literal `true`.
   */
  acknowledged: z.preprocess(
    (value) => value === "on",
    z.literal(true, {
      message: "Please confirm you understand this is a request, not a confirmed booking.",
    }),
  ),

  /**
   * Honeypot. Real users never see or fill this field, so any value means a bot.
   * Chosen name looks plausible to a naive scraper.
   */
  website: z.string().max(0, "Submission rejected.").optional().or(z.literal("")),
})
  /**
   * The two halves of the form are mutually exclusive, so the requirement is
   * conditional rather than field-level. Doing it here — not just in the UI —
   * means a hand-crafted POST cannot save a package booking with no package,
   * which would leave the coach with a request they cannot price.
   */
  .superRefine((data, ctx) => {
    if (data.bookingType === "PACKAGE" && !data.packageId) {
      ctx.addIssue({
        code: "custom",
        path: ["packageId"],
        message: "Please choose a package.",
      });
    }
  });

export type BookingRequestInput = z.input<typeof bookingRequestSchema>;
export type BookingRequestData = z.output<typeof bookingRequestSchema>;

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name.").max(80),
  email: z.string().trim().toLowerCase().email("That does not look like a valid email address.").max(160),
  subject: z.string().trim().max(140).optional().or(z.literal("")),
  body: z
    .string()
    .trim()
    .min(10, "Please add a little more detail.")
    .max(2000, "Please keep your message under 2000 characters."),
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactMessageData = z.output<typeof contactMessageSchema>;

// ---------------------------------------------------------------------------
// Admin-side booking mutations
// ---------------------------------------------------------------------------

export const BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
] as const;

export const updateBookingSchema = z.object({
  id: z.string().min(1),
  status: z.enum(BOOKING_STATUSES),
  coachingOfferId: z.string().optional().or(z.literal("")),
  scheduledAt: z.string().optional().or(z.literal("")),
  priceQuoted: z.coerce.number().min(0).max(1_000_000).optional(),
  participants: z.coerce.number().int().min(1).max(8).optional(),
});

export const addBookingNoteSchema = z.object({
  bookingId: z.string().min(1),
  body: z.string().trim().min(1, "A note cannot be empty.").max(2000),
});

export const bookingFilterSchema = z.object({
  status: z.enum(BOOKING_STATUSES).optional(),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  sort: z.enum(["newest", "oldest", "date"]).default("newest"),
});

export type BookingFilter = z.output<typeof bookingFilterSchema>;
