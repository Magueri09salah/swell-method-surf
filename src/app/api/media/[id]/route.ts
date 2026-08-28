import { NextResponse } from "next/server";
import { getMediaBytes } from "@/server/services/media";

/**
 * Serves an uploaded image.
 *
 * PUBLIC by design — these are the photographs on the marketing site, and
 * `next/image` fetches them without a session. The id is a cuid, so it is not
 * enumerable, and only images the coach chose to upload live here.
 *
 * Content is immutable: an asset's bytes never change after upload (editing an
 * image means uploading a new one), so it can be cached hard and revalidated
 * with an ETag.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const asset = await getMediaBytes(id);
  if (!asset) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Strong validator: bytes are immutable, so id + upload time fully identify
  // this representation.
  const etag = `"${id}-${asset.createdAt.getTime()}"`;

  return new NextResponse(new Uint8Array(asset.data), {
    status: 200,
    headers: {
      "Content-Type": asset.mimeType,
      "Content-Length": String(asset.data.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: etag,
      // Belt and braces: never let a browser sniff an uploaded file into
      // something executable.
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline",
    },
  });
}
