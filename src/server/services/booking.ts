import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import type { BookingRequestData, BookingFilter } from "@/lib/validation/booking";
import { generateBookingReference, toDateOnly } from "@/lib/utils";
import { PAGE_SIZE } from "@/lib/constants";
import type { BookingDetailDTO, BookingListItemDTO, Paginated } from "./types";

/**
 * Booking business logic.
 *
 * Bookings are never hard-deleted — cancellation is a status — so the coach
 * keeps a truthful history of what was asked for and when.
 */

/** Terminal states that any booking may always move to. */
const TERMINAL: BookingStatus[] = ["CANCELLED", "REJECTED"];

export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "REJECTED";

/**
 * Allowed forward transitions. Encoded rather than implied so the rule is
 * testable and cannot drift between the UI and the server.
 */
const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["CONFIRMED", ...TERMINAL],
  CONFIRMED: ["COMPLETED", ...TERMINAL],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  if (from === to) return true;
  return TRANSITIONS[from].includes(to);
}

/**
 * Creates a booking request and, atomically, the Client record behind it.
 *
 * THE single funnel for inbound bookings — the one place a future email or
 * WhatsApp notification hooks into (docs/ARCHITECTURE.md §9).
 *
 * Client identity is keyed on lowercased email so a returning surfer accretes
 * booking history instead of creating a duplicate record.
 */
export async function createBookingRequest(
  data: BookingRequestData,
  meta: { sourceIp?: string } = {},
): Promise<{ reference: string }> {
  const email = data.email.toLowerCase();

  return prisma.$transaction(async (tx) => {
    const client = await tx.client.upsert({
      where: { email },
      create: {
        email,
        name: data.name,
        phone: data.phone || null,
        whatsapp: data.phone || null,
        country: data.country || null,
        experienceLevel: data.experienceLevel,
      },
      update: {
        // Refresh contact details from the newest submission, but never blank
        // out a value the coach may have filled in manually.
        name: data.name,
        ...(data.phone ? { phone: data.phone, whatsapp: data.phone } : {}),
        ...(data.country ? { country: data.country } : {}),
        experienceLevel: data.experienceLevel,
      },
      select: { id: true },
    });

    // cuid collisions are vanishingly unlikely, but the reference is only 6
    // chars from a 32-char alphabet, so retry on the unique constraint.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const reference = generateBookingReference();
      try {
        await tx.booking.create({
          data: {
            reference,
            clientId: client.id,
            bookingType: data.bookingType,
            // Only one of these is ever meaningful; the other is cleared so a
            // booking can never claim to be both.
            coachingOfferId: data.bookingType === "SESSION" ? data.coachingOfferId || null : null,
            packageId: data.bookingType === "PACKAGE" ? data.packageId || null : null,
            requestedFormat: data.coachingFormat,
            experienceLevel: data.experienceLevel,
            preferredDate: toDateOnly(data.preferredDate),
            participants: data.participants,
            message: data.message || null,
            sourceIp: meta.sourceIp ?? null,
          },
        });
        return { reference };
      } catch (error) {
        const isDuplicate =
          error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
        if (!isDuplicate) throw error;
      }
    }

    throw new Error("Could not allocate a unique booking reference.");
  });
}

function toListItem(row: {
  id: string;
  reference: string;
  status: BookingStatus;
  requestedFormat: BookingListItemDTO["requestedFormat"];
  experienceLevel: BookingListItemDTO["experienceLevel"];
  preferredDate: Date;
  preferredTime: string | null;
  participants: number;
  createdAt: Date;
  bookingType: BookingListItemDTO["bookingType"];
  client: { name: string; email: string };
  coachingOffer: { title: string } | null;
  package: { title: string } | null;
}): BookingListItemDTO {
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    clientName: row.client.name,
    clientEmail: row.client.email,
    offerTitle: row.coachingOffer?.title ?? null,
    bookingType: row.bookingType,
    packageTitle: row.package?.title ?? null,
    requestedFormat: row.requestedFormat,
    experienceLevel: row.experienceLevel,
    preferredDate: row.preferredDate.toISOString(),
    preferredTime: row.preferredTime,
    participants: row.participants,
    createdAt: row.createdAt.toISOString(),
  };
}

const LIST_SELECT = {
  id: true,
  reference: true,
  status: true,
  bookingType: true,
  requestedFormat: true,
  experienceLevel: true,
  preferredDate: true,
  preferredTime: true,
  participants: true,
  createdAt: true,
  client: { select: { name: true, email: true } },
  coachingOffer: { select: { title: true } },
  package: { select: { title: true } },
} as const;

export async function listBookings(filter: BookingFilter): Promise<Paginated<BookingListItemDTO>> {
  const where: Prisma.BookingWhereInput = {};

  if (filter.status) where.status = filter.status;

  if (filter.q) {
    // Search across reference and client identity — the three things a coach
    // actually has to hand when looking a booking up.
    where.OR = [
      { reference: { contains: filter.q, mode: "insensitive" } },
      { client: { name: { contains: filter.q, mode: "insensitive" } } },
      { client: { email: { contains: filter.q, mode: "insensitive" } } },
    ];
  }

  const orderBy: Prisma.BookingOrderByWithRelationInput =
    filter.sort === "oldest"
      ? { createdAt: "asc" }
      : filter.sort === "date"
        ? { preferredDate: "asc" }
        : { createdAt: "desc" };

  const [rows, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy,
      select: LIST_SELECT,
      skip: (filter.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    items: rows.map(toListItem),
    total,
    page: filter.page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getBookingById(id: string): Promise<BookingDetailDTO | null> {
  const row = await prisma.booking.findUnique({
    where: { id },
    select: {
      ...LIST_SELECT,
      clientId: true,
      coachingOfferId: true,
      message: true,
      priceQuoted: true,
      currency: true,
      scheduledAt: true,
      client: {
        select: { name: true, email: true, phone: true, whatsapp: true, country: true },
      },
      notes: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          body: true,
          createdAt: true,
          author: { select: { name: true } },
        },
      },
    },
  });

  if (!row) return null;

  return {
    ...toListItem(row),
    clientId: row.clientId,
    clientPhone: row.client.phone,
    clientWhatsapp: row.client.whatsapp,
    clientCountry: row.client.country,
    coachingOfferId: row.coachingOfferId,
    message: row.message,
    priceQuoted: row.priceQuoted === null ? null : Number(row.priceQuoted),
    currency: row.currency,
    scheduledAt: row.scheduledAt ? row.scheduledAt.toISOString() : null,
    notes: row.notes.map((note) => ({
      id: note.id,
      body: note.body,
      authorName: note.author?.name ?? null,
      createdAt: note.createdAt.toISOString(),
    })),
  };
}

export type UpdateBookingInput = {
  status: BookingStatus;
  coachingOfferId?: string | null;
  scheduledAt?: string | null;
  priceQuoted?: number | null;
  participants?: number;
};

export async function updateBooking(
  id: string,
  input: UpdateBookingInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const existing = await prisma.booking.findUnique({
    where: { id },
    select: { status: true, coachingOfferId: true, priceQuoted: true },
  });

  if (!existing) return { ok: false, error: "That booking no longer exists." };

  if (!canTransition(existing.status, input.status)) {
    return {
      ok: false,
      error: `A ${existing.status.toLowerCase()} booking cannot be moved to ${input.status.toLowerCase()}.`,
    };
  }

  // Snapshot the price at confirmation time so later edits to the coaching
  // offer never rewrite what this client was actually quoted.
  let priceQuoted = input.priceQuoted ?? null;
  if (priceQuoted === null && input.status === "CONFIRMED" && input.coachingOfferId) {
    const offer = await prisma.coachingOffer.findUnique({
      where: { id: input.coachingOfferId },
      select: { price: true },
    });
    if (offer) priceQuoted = Number(offer.price);
  }

  await prisma.booking.update({
    where: { id },
    data: {
      status: input.status,
      coachingOfferId: input.coachingOfferId || null,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      priceQuoted,
      ...(input.participants ? { participants: input.participants } : {}),
    },
  });

  return { ok: true };
}

export async function addBookingNote(
  bookingId: string,
  body: string,
  authorId: string,
): Promise<void> {
  await prisma.bookingNote.create({ data: { bookingId, body, authorId } });
}

export async function countByStatus(): Promise<Record<BookingStatus, number>> {
  const grouped = await prisma.booking.groupBy({ by: ["status"], _count: { _all: true } });

  const base: Record<BookingStatus, number> = {
    PENDING: 0,
    CONFIRMED: 0,
    COMPLETED: 0,
    CANCELLED: 0,
    REJECTED: 0,
  };

  for (const row of grouped) base[row.status] = row._count._all;
  return base;
}
