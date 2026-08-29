"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminOrFail } from "@/server/auth";
import {
  clientSchema,
  coachingOfferSchema,
  deleteByIdSchema,
  galleryImageSchema,
  reorderSchema,
  siteSettingsSchema,
  packageSchema,
  toggleSchema,
} from "@/lib/validation/admin";
import {
  addBookingNoteSchema,
  updateBookingSchema,
} from "@/lib/validation/booking";
import { CONTENT_SCHEMAS, type ContentKey } from "@/lib/validation/content";
import * as coaching from "@/server/services/coaching";
import * as packages from "@/server/services/package";
import * as gallery from "@/server/services/gallery";
import * as bookings from "@/server/services/booking";
import * as clients from "@/server/services/client";
import * as messages from "@/server/services/message";
import { saveContent } from "@/server/services/content";
import { saveSettings } from "@/server/services/settings";
import { CACHE_TAGS, fail, ok, type ActionResult } from "@/server/services/types";

/**
 * Admin mutations.
 *
 * EVERY action below begins with `requireAdminOrFail()`. Middleware and the
 * dashboard layout also guard these routes, but a server action is directly
 * invocable and does not necessarily traverse a page's middleware — so this
 * check, at the point of work, is the actual security boundary.
 * See docs/ARCHITECTURE.md §5.
 */

type Guard = { ok: true; userId: string } | { ok: false; result: ActionResult<never> };

async function guard(): Promise<Guard> {
  const auth = await requireAdminOrFail();
  if (!auth.ok) return { ok: false, result: fail(auth.error) };
  return { ok: true, userId: auth.user.id };
}

function flatten(error: { flatten: () => { fieldErrors: Record<string, unknown> } }) {
  return error.flatten().fieldErrors as Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Coaching offers
// ---------------------------------------------------------------------------

export async function saveCoachingOffer(
  _prev: ActionResult<undefined> | null,
  formData: FormData,
): Promise<ActionResult<undefined>> {
  const auth = await guard();
  if (!auth.ok) return auth.result;

  const raw = Object.fromEntries(formData);
  const parsed = coachingOfferSchema.safeParse({
    ...raw,
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
  });

  if (!parsed.success) return fail("Please check the highlighted fields.", flatten(parsed.error));

  const id = typeof raw.id === "string" && raw.id.length > 0 ? raw.id : undefined;

  if (await coaching.slugExists(parsed.data.slug, id)) {
    return fail("Please check the highlighted fields.", {
      slug: ["Another offer already uses this slug."],
    });
  }

  try {
    if (id) await coaching.updateOffer(id, parsed.data);
    else await coaching.createOffer(parsed.data);
  } catch (error) {
    console.error("[admin] saveCoachingOffer", error);
    return fail("Could not save this coaching offer.");
  }

  updateTag(CACHE_TAGS.coaching);
  revalidatePath("/admin/coaching");
  redirect("/admin/coaching");
}

export async function deleteCoachingOffer(formData: FormData): Promise<void> {
  const auth = await guard();
  if (!auth.ok) return;

  const parsed = deleteByIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  await coaching.deleteOffer(parsed.data.id);
  updateTag(CACHE_TAGS.coaching);
  revalidatePath("/admin/coaching");
}

export async function toggleCoachingFlag(formData: FormData): Promise<void> {
  const auth = await guard();
  if (!auth.ok) return;

  const parsed = toggleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success || parsed.data.field === "published") return;

  await coaching.setOfferFlag(parsed.data.id, parsed.data.field, parsed.data.value);
  updateTag(CACHE_TAGS.coaching);
  revalidatePath("/admin/coaching");
}

export async function reorderCoachingOffer(formData: FormData): Promise<void> {
  const auth = await guard();
  if (!auth.ok) return;

  const parsed = reorderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  await coaching.reorderOffer(parsed.data.id, parsed.data.direction);
  updateTag(CACHE_TAGS.coaching);
  revalidatePath("/admin/coaching");
}

// ---------------------------------------------------------------------------
// Packages
// ---------------------------------------------------------------------------

export async function savePackage(
  _prev: ActionResult<undefined> | null,
  formData: FormData,
): Promise<ActionResult<undefined>> {
  const auth = await guard();
  if (!auth.ok) return auth.result;

  const raw = Object.fromEntries(formData);
  const parsed = packageSchema.safeParse({
    ...raw,
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
  });

  if (!parsed.success) return fail("Please check the highlighted fields.", flatten(parsed.error));

  const id = typeof raw.id === "string" && raw.id.length > 0 ? raw.id : undefined;

  if (await packages.packageSlugExists(parsed.data.slug, id)) {
    return fail("Please check the highlighted fields.", {
      slug: ["Another package already uses this slug."],
    });
  }

  try {
    if (id) await packages.updatePackage(id, parsed.data);
    else await packages.createPackage(parsed.data);
  } catch (error) {
    console.error("[admin] savePackage", error);
    return fail("Could not save this package.");
  }

  updateTag(CACHE_TAGS.packages);
  revalidatePath("/admin/packages");
  redirect("/admin/packages");
}

export async function deletePackage(formData: FormData): Promise<void> {
  const auth = await guard();
  if (!auth.ok) return;

  const parsed = deleteByIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  await packages.deletePackage(parsed.data.id);
  updateTag(CACHE_TAGS.packages);
  revalidatePath("/admin/packages");
}

export async function togglePackageFlag(formData: FormData): Promise<void> {
  const auth = await guard();
  if (!auth.ok) return;

  const parsed = toggleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success || parsed.data.field === "published") return;

  await packages.setPackageFlag(parsed.data.id, parsed.data.field, parsed.data.value);
  updateTag(CACHE_TAGS.packages);
  revalidatePath("/admin/packages");
}

export async function reorderPackageAction(formData: FormData): Promise<void> {
  const auth = await guard();
  if (!auth.ok) return;

  const parsed = reorderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  await packages.reorderPackage(parsed.data.id, parsed.data.direction);
  updateTag(CACHE_TAGS.packages);
  revalidatePath("/admin/packages");
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------

export async function saveGalleryImage(
  _prev: ActionResult<undefined> | null,
  formData: FormData,
): Promise<ActionResult<undefined>> {
  const auth = await guard();
  if (!auth.ok) return auth.result;

  const raw = Object.fromEntries(formData);
  const parsed = galleryImageSchema.safeParse({
    ...raw,
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    width: raw.width || undefined,
    height: raw.height || undefined,
  });

  if (!parsed.success) return fail("Please check the highlighted fields.", flatten(parsed.error));

  const id = typeof raw.id === "string" && raw.id.length > 0 ? raw.id : undefined;

  try {
    if (id) await gallery.updateGalleryImage(id, parsed.data);
    else await gallery.createGalleryImage(parsed.data);
  } catch (error) {
    console.error("[admin] saveGalleryImage", error);
    return fail("Could not save this image.");
  }

  updateTag(CACHE_TAGS.gallery);
  revalidatePath("/admin/gallery");
  redirect("/admin/gallery");
}

export async function deleteGalleryImage(formData: FormData): Promise<void> {
  const auth = await guard();
  if (!auth.ok) return;

  const parsed = deleteByIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  await gallery.deleteGalleryImage(parsed.data.id);
  updateTag(CACHE_TAGS.gallery);
  revalidatePath("/admin/gallery");
}

export async function toggleGalleryFlag(formData: FormData): Promise<void> {
  const auth = await guard();
  if (!auth.ok) return;

  const parsed = toggleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success || parsed.data.field === "active") return;

  await gallery.setGalleryFlag(parsed.data.id, parsed.data.field, parsed.data.value);
  updateTag(CACHE_TAGS.gallery);
  revalidatePath("/admin/gallery");
}

export async function reorderGalleryImage(formData: FormData): Promise<void> {
  const auth = await guard();
  if (!auth.ok) return;

  const parsed = reorderSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  await gallery.reorderGalleryImage(parsed.data.id, parsed.data.direction);
  updateTag(CACHE_TAGS.gallery);
  revalidatePath("/admin/gallery");
}

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------

export async function updateBookingAction(
  _prev: ActionResult<undefined> | null,
  formData: FormData,
): Promise<ActionResult<undefined>> {
  const auth = await guard();
  if (!auth.ok) return auth.result;

  const parsed = updateBookingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Please check the highlighted fields.", flatten(parsed.error));

  const result = await bookings.updateBooking(parsed.data.id, {
    status: parsed.data.status,
    coachingOfferId: parsed.data.coachingOfferId || null,
    scheduledAt: parsed.data.scheduledAt || null,
    priceQuoted: parsed.data.priceQuoted ?? null,
    ...(parsed.data.participants ? { participants: parsed.data.participants } : {}),
  });

  if (!result.ok) return fail(result.error);

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${parsed.data.id}`);
  revalidatePath("/admin");
  return ok();
}

export async function addBookingNoteAction(
  _prev: ActionResult<undefined> | null,
  formData: FormData,
): Promise<ActionResult<undefined>> {
  const auth = await guard();
  if (!auth.ok) return auth.result;

  const parsed = addBookingNoteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Please check the highlighted fields.", flatten(parsed.error));

  await bookings.addBookingNote(parsed.data.bookingId, parsed.data.body, auth.userId);
  revalidatePath(`/admin/bookings/${parsed.data.bookingId}`);
  return ok();
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

export async function saveClientAction(
  _prev: ActionResult<undefined> | null,
  formData: FormData,
): Promise<ActionResult<undefined>> {
  const auth = await guard();
  if (!auth.ok) return auth.result;

  const parsed = clientSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Please check the highlighted fields.", flatten(parsed.error));

  try {
    await clients.updateClient(parsed.data.id, parsed.data);
  } catch (error) {
    console.error("[admin] saveClientAction", error);
    return fail("Could not save this client. The email address may already be in use.");
  }

  revalidatePath(`/admin/clients/${parsed.data.id}`);
  revalidatePath("/admin/clients");
  return ok();
}

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export async function setMessageStatusAction(formData: FormData): Promise<void> {
  const auth = await guard();
  if (!auth.ok) return;

  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string") return;
  if (status !== "UNREAD" && status !== "READ" && status !== "ARCHIVED") return;

  await messages.setMessageStatus(id, status);
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  const auth = await guard();
  if (!auth.ok) return;

  const parsed = deleteByIdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  await messages.deleteMessage(parsed.data.id);
  revalidatePath("/admin/messages");
}

// ---------------------------------------------------------------------------
// Content and settings
// ---------------------------------------------------------------------------

export async function saveContentAction(
  _prev: ActionResult<undefined> | null,
  formData: FormData,
): Promise<ActionResult<undefined>> {
  const auth = await guard();
  if (!auth.ok) return auth.result;

  const key = formData.get("__key");
  if (typeof key !== "string" || !(key in CONTENT_SCHEMAS)) {
    return fail("Unknown content section.");
  }

  const contentKey = key as ContentKey;
  const payloadRaw = formData.get("__payload");

  if (typeof payloadRaw !== "string") return fail("Nothing was submitted.");

  let payload: unknown;
  try {
    payload = JSON.parse(payloadRaw);
  } catch {
    return fail("That content could not be read. Please reload and try again.");
  }

  const parsed = CONTENT_SCHEMAS[contentKey].safeParse(payload);
  if (!parsed.success) return fail("Please check the highlighted fields.", flatten(parsed.error));

  try {
    // The schema union is keyed, so the parsed shape matches the key by
    // construction; the cast is confined to this single call.
    await saveContent(contentKey, parsed.data as never);
  } catch (error) {
    console.error("[admin] saveContentAction", error);
    return fail("Could not save this content.");
  }

  updateTag(CACHE_TAGS.content);
  // Content sections are rendered on several pages — the hero and intro on "/",
  // the pillars on "/" and "/method", the Imsouane guide on "/" and "/imsouane".
  // Revalidating the root LAYOUT refreshes every route beneath it, so an edit
  // is never left visible on one page and stale on another.
  revalidatePath("/", "layout");
  return ok();
}

export async function saveSettingsAction(
  _prev: ActionResult<undefined> | null,
  formData: FormData,
): Promise<ActionResult<undefined>> {
  const auth = await guard();
  if (!auth.ok) return auth.result;

  const parsed = siteSettingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Please check the highlighted fields.", flatten(parsed.error));

  try {
    await saveSettings(parsed.data);
  } catch (error) {
    console.error("[admin] saveSettingsAction", error);
    return fail("Could not save your settings.");
  }

  updateTag(CACHE_TAGS.settings);
  revalidatePath("/");
  return ok();
}
