import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "@/server/db";
import type { TestimonialData } from "@/lib/validation/admin";
import { toDateOnly } from "@/lib/utils";
import { CACHE_TAGS, type TestimonialDTO } from "./types";
import { safeRead } from "./safe-read";

type Row = Awaited<ReturnType<typeof prisma.testimonial.findMany>>[number];

function toDTO(row: Row): TestimonialDTO {
  return {
    id: row.id,
    clientName: row.clientName,
    origin: row.origin,
    quote: row.quote,
    rating: row.rating,
    avatarUrl: row.avatarUrl,
    sessionDate: row.sessionDate ? row.sessionDate.toISOString() : null,
    featured: row.featured,
    published: row.published,
    sortOrder: row.sortOrder,
  };
}

async function readPublished(): Promise<TestimonialDTO[]> {
  const rows = await safeRead(
    "testimonials:published",
    () =>
      prisma.testimonial.findMany({
        where: { published: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      }),
    [],
  );
  return rows.map(toDTO);
}

export const getPublishedTestimonials = unstable_cache(readPublished, ["testimonials-published"], {
  tags: [CACHE_TAGS.testimonials],
  revalidate: 3600,
});

async function readFeatured(): Promise<TestimonialDTO[]> {
  return safeRead(
    "testimonials:featured",
    async () => {
      const rows = await prisma.testimonial.findMany({
        where: { published: true, featured: true },
        orderBy: [{ sortOrder: "asc" }],
        take: 3,
      });
      if (rows.length > 0) return rows.map(toDTO);

      const fallback = await prisma.testimonial.findMany({
        where: { published: true },
        orderBy: [{ sortOrder: "asc" }],
        take: 3,
      });
      return fallback.map(toDTO);
    },
    [],
  );
}

export const getFeaturedTestimonials = unstable_cache(readFeatured, ["testimonials-featured"], {
  tags: [CACHE_TAGS.testimonials],
  revalidate: 3600,
});

export async function listAllTestimonials(): Promise<TestimonialDTO[]> {
  const rows = await prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(toDTO);
}

export async function getTestimonialById(id: string): Promise<TestimonialDTO | null> {
  const row = await prisma.testimonial.findUnique({ where: { id } });
  return row ? toDTO(row) : null;
}

export async function createTestimonial(data: TestimonialData): Promise<void> {
  await prisma.testimonial.create({
    data: {
      clientName: data.clientName,
      origin: data.origin || null,
      quote: data.quote,
      rating: data.rating,
      avatarUrl: data.avatarUrl || null,
      sessionDate: data.sessionDate ? toDateOnly(data.sessionDate) : null,
      featured: data.featured,
      published: data.published,
      sortOrder: data.sortOrder,
    },
  });
}

export async function updateTestimonial(id: string, data: TestimonialData): Promise<void> {
  await prisma.testimonial.update({
    where: { id },
    data: {
      clientName: data.clientName,
      origin: data.origin || null,
      quote: data.quote,
      rating: data.rating,
      avatarUrl: data.avatarUrl || null,
      sessionDate: data.sessionDate ? toDateOnly(data.sessionDate) : null,
      featured: data.featured,
      published: data.published,
      sortOrder: data.sortOrder,
    },
  });
}

export async function deleteTestimonial(id: string): Promise<void> {
  await prisma.testimonial.delete({ where: { id } });
}

export async function setTestimonialFlag(
  id: string,
  field: "published" | "featured",
  value: boolean,
): Promise<void> {
  await prisma.testimonial.update({ where: { id }, data: { [field]: value } });
}
