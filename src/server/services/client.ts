import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { PAGE_SIZE } from "@/lib/constants";
import type { ClientListItemDTO, Paginated } from "./types";

export async function listClients(
  q: string | undefined,
  page: number,
): Promise<Paginated<ClientListItemDTO>> {
  const where: Prisma.ClientWhereInput = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { country: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [rows, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        country: true,
        experienceLevel: true,
        createdAt: true,
        _count: { select: { bookings: true } },
      },
    }),
    prisma.client.count({ where }),
  ]);

  return {
    items: rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      country: row.country,
      experienceLevel: row.experienceLevel,
      bookingCount: row._count.bookings,
      createdAt: row.createdAt.toISOString(),
    })),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export type ClientDetail = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  country: string | null;
  experienceLevel: "FIRST_TIME" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | null;
  notes: string | null;
  createdAt: string;
  bookings: {
    id: string;
    reference: string;
    status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "REJECTED";
    preferredDate: string;
    offerTitle: string | null;
    participants: number;
  }[];
};

export async function getClientById(id: string): Promise<ClientDetail | null> {
  const row = await prisma.client.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      whatsapp: true,
      country: true,
      experienceLevel: true,
      notes: true,
      createdAt: true,
      bookings: {
        orderBy: { preferredDate: "desc" },
        select: {
          id: true,
          reference: true,
          status: true,
          preferredDate: true,
          participants: true,
          coachingOffer: { select: { title: true } },
        },
      },
    },
  });

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    whatsapp: row.whatsapp,
    country: row.country,
    experienceLevel: row.experienceLevel,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    bookings: row.bookings.map((booking) => ({
      id: booking.id,
      reference: booking.reference,
      status: booking.status,
      preferredDate: booking.preferredDate.toISOString(),
      offerTitle: booking.coachingOffer?.title ?? null,
      participants: booking.participants,
    })),
  };
}

export async function updateClient(
  id: string,
  data: {
    name: string;
    email: string;
    phone?: string;
    whatsapp?: string;
    country?: string;
    experienceLevel?: string;
    notes?: string;
  },
): Promise<void> {
  await prisma.client.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      country: data.country || null,
      experienceLevel:
        data.experienceLevel && data.experienceLevel.length > 0
          ? (data.experienceLevel as "FIRST_TIME" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED")
          : null,
      notes: data.notes || null,
    },
  });
}

export async function countClients(): Promise<number> {
  return prisma.client.count();
}
