"use server";

import { headers } from "next/headers";
import {
  bookingRequestSchema,
  contactMessageSchema,
  type BookingRequestData,
} from "@/lib/validation/booking";
import { createBookingRequest } from "@/server/services/booking";
import { createContactMessage } from "@/server/services/message";
import { checkRateLimit, clientIp, RATE_LIMITS } from "@/server/rate-limit";
import { getSettings } from "@/server/services/settings";
import { getActivePackages } from "@/server/services/package";
import { COACHING_FORMAT_LABELS, EXPERIENCE_LEVEL_LABELS } from "@/lib/constants";
import { formatDate, whatsappHref } from "@/lib/utils";
import { fail, ok, type ActionResult } from "@/server/services/types";

/**
 * Public (unauthenticated) mutations.
 *
 * Every one of these:
 *   1. rate-limits by IP
 *   2. checks the honeypot
 *   3. re-validates with Zod (client validation is never trusted)
 *   4. returns a typed result — it never throws across the action boundary
 */

/**
 * Builds a wa.me link that opens WhatsApp with the request already written out.
 *
 * There is no WhatsApp Business API here, so the server cannot *push* a message.
 * This is the honest equivalent: the visitor taps once and their own WhatsApp
 * opens with a complete summary addressed to the coach. It reaches the coach
 * instantly, it comes from the visitor's real number (so the coach can reply),
 * and it needs no credentials or third-party account.
 *
 * Returns null when no WhatsApp number is configured, and the UI simply omits
 * the button.
 */
async function buildWhatsappLink(
  data: BookingRequestData,
  reference: string,
): Promise<string | null> {
  const settings = await getSettings();
  if (!settings.whatsapp) return null;

  const packageTitle =
    data.bookingType === "PACKAGE" && data.packageId
      ? ((await getActivePackages()).find((p) => p.id === data.packageId)?.title ?? null)
      : null;

  const lines = [
    `Hi! I have just sent a booking request on the website.`,
    ``,
    `Reference: ${reference}`,
    `Name: ${data.name}`,
    `Date: ${formatDate(data.preferredDate)}`,
    `Surfers: ${data.participants}`,
    `Level: ${EXPERIENCE_LEVEL_LABELS[data.experienceLevel]}`,
    packageTitle
      ? `Package: ${packageTitle}`
      : `Format: ${COACHING_FORMAT_LABELS[data.coachingFormat]}`,
  ];

  if (data.message) lines.push(``, data.message);

  return whatsappHref(settings.whatsapp, lines.join("\n"));
}

/** Guards against oversized bodies before Zod does structural work. */
const MAX_FIELD_BYTES = 4000;

function tooLarge(formData: FormData): boolean {
  for (const value of formData.values()) {
    if (typeof value === "string" && value.length > MAX_FIELD_BYTES) return true;
  }
  return false;
}

export type BookingSuccess = { reference: string; whatsappUrl: string | null };

export async function submitBookingRequest(
  _prev: ActionResult<BookingSuccess> | null,
  formData: FormData,
): Promise<ActionResult<BookingSuccess>> {
  const requestHeaders = await headers();
  const ip = clientIp(requestHeaders);

  const limit = checkRateLimit(`booking:${ip}`, RATE_LIMITS.booking.limit, RATE_LIMITS.booking.windowMs);
  if (!limit.ok) {
    const minutes = Math.ceil(limit.retryAfter / 60);
    return fail(
      `You have sent several requests already. Please try again in about ${minutes} minute${minutes === 1 ? "" : "s"}, or email us directly.`,
    );
  }

  if (tooLarge(formData)) return fail("That submission was too large. Please shorten your message.");

  const parsed = bookingRequestSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    return fail("Please check the highlighted fields.", fieldErrors as Record<string, string[]>);
  }

  // Honeypot: a real browser never fills this. Return a success-shaped response
  // so a bot cannot tell it was caught.
  if (parsed.data.website) {
    return ok({ reference: "SMS-000000", whatsappUrl: null });
  }

  try {
    const { reference } = await createBookingRequest(parsed.data, { sourceIp: ip });
    const whatsappUrl = await buildWhatsappLink(parsed.data, reference);
    return ok({ reference, whatsappUrl });
  } catch (error) {
    console.error("[booking] Failed to create booking request", error);
    return fail("Something went wrong on our side. Please try again, or email us directly.");
  }
}

export async function submitContactMessage(
  _prev: ActionResult<undefined> | null,
  formData: FormData,
): Promise<ActionResult<undefined>> {
  const requestHeaders = await headers();
  const ip = clientIp(requestHeaders);

  const limit = checkRateLimit(`contact:${ip}`, RATE_LIMITS.contact.limit, RATE_LIMITS.contact.windowMs);
  if (!limit.ok) {
    return fail("You have sent several messages already. Please try again shortly.");
  }

  if (tooLarge(formData)) return fail("That message was too long. Please shorten it.");

  const parsed = contactMessageSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    return fail("Please check the highlighted fields.", fieldErrors as Record<string, string[]>);
  }

  if (parsed.data.website) return ok();

  try {
    await createContactMessage(parsed.data, { sourceIp: ip });
    return ok();
  } catch (error) {
    console.error("[contact] Failed to store message", error);
    return fail("Something went wrong on our side. Please try again.");
  }
}
