import "server-only";
import { prisma } from "@/server/db";

/**
 * Uploaded image library.
 *
 * Bytes are stored in Postgres and served by `GET /api/media/[id]`.
 * See docs/DECISIONS.md D-014 for why, and the swap path to object storage.
 */

/** Formats we accept. Kept narrow on purpose — no SVG. */
export const ACCEPTED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

/**
 * SVG is deliberately excluded: it is an executable document, and serving
 * user-uploaded SVG from our own origin is a stored-XSS vector.
 */
export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;

export type MediaAssetDTO = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  altText: string;
  createdAt: string;
};

/** The public reference for an uploaded asset. */
export function mediaUrl(id: string): string {
  return `/api/media/${id}`;
}

type Row = {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  altText: string;
  createdAt: Date;
};

function toDTO(row: Row): MediaAssetDTO {
  return {
    id: row.id,
    url: mediaUrl(row.id),
    filename: row.filename,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    width: row.width,
    height: row.height,
    altText: row.altText,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Metadata only — never selects `data`, which would pull megabytes per row. */
const META_SELECT = {
  id: true,
  filename: true,
  mimeType: true,
  sizeBytes: true,
  width: true,
  height: true,
  altText: true,
  createdAt: true,
} as const;

export async function listMedia(limit = 60): Promise<MediaAssetDTO[]> {
  const rows = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: META_SELECT,
  });
  return rows.map(toDTO);
}

export async function createMedia(input: {
  filename: string;
  mimeType: string;
  width: number;
  height: number;
  altText: string;
  data: Uint8Array<ArrayBuffer>;
}): Promise<MediaAssetDTO> {
  const row = await prisma.mediaAsset.create({
    data: {
      filename: input.filename,
      mimeType: input.mimeType,
      sizeBytes: input.data.byteLength,
      width: input.width,
      height: input.height,
      altText: input.altText,
      data: input.data,
    },
    select: META_SELECT,
  });
  return toDTO(row);
}

/** Full row including bytes. Only the serving route calls this. */
export async function getMediaBytes(
  id: string,
): Promise<{ data: Uint8Array<ArrayBuffer>; mimeType: string; createdAt: Date } | null> {
  const row = await prisma.mediaAsset.findUnique({
    where: { id },
    select: { data: true, mimeType: true, createdAt: true },
  });
  if (!row) return null;
  return { data: new Uint8Array(row.data), mimeType: row.mimeType, createdAt: row.createdAt };
}

export async function deleteMedia(id: string): Promise<void> {
  await prisma.mediaAsset.delete({ where: { id } });
}

/**
 * Which records still point at an asset. Checked before deleting, so the coach
 * cannot silently blank an image that is live on the site.
 */
export async function countMediaUsage(id: string): Promise<number> {
  const url = mediaUrl(id);
  const [gallery, offers, testimonials] = await Promise.all([
    prisma.galleryImage.count({ where: { imageUrl: url } }),
    prisma.coachingOffer.count({ where: { imageUrl: url } }),
    prisma.testimonial.count({ where: { avatarUrl: url } }),
  ]);
  return gallery + offers + testimonials;
}
