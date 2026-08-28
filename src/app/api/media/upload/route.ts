import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireAdminOrFail } from "@/server/auth";
import { checkRateLimit, clientIp } from "@/server/rate-limit";
import {
  ACCEPTED_MIME,
  MAX_UPLOAD_BYTES,
  createMedia,
} from "@/server/services/media";

/**
 * Image upload.
 *
 * A Route Handler rather than a Server Action: server actions carry a body-size
 * limit intended for form fields, and streaming a multipart file through one is
 * fighting the tool. This also returns JSON the picker can use immediately.
 *
 * SECURITY — the declared MIME type is attacker-controlled, so it is never
 * trusted. The real format is read from the file's magic bytes and must both be
 * on the allow-list AND agree with what the client claimed.
 */

/** Magic-byte signatures for the formats we accept. */
function sniffImageType(buf: Buffer): string | null {
  if (buf.length < 12) return null;

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return "image/png";
  }

  // RIFF....WEBP
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp";
  }

  // ISO-BMFF box with an AVIF brand
  if (buf.toString("ascii", 4, 8) === "ftyp") {
    const brand = buf.toString("ascii", 8, 12);
    if (brand === "avif" || brand === "avis") return "image/avif";
  }

  return null;
}

const isAccepted = (mime: string): boolean =>
  (ACCEPTED_MIME as readonly string[]).includes(mime);

export async function POST(request: Request) {
  const auth = await requireAdminOrFail();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const ip = clientIp(await headers());
  const limit = checkRateLimit(`upload:${ip}`, 40, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many uploads in a short time. Please wait a moment." },
      { status: 429 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "That upload could not be read." }, { status: 400 });
  }

  const file = form.get("file");
  const altText = String(form.get("altText") ?? "").trim();
  const width = Number(form.get("width"));
  const height = Number(form.get("height"));

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "No file was received." }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      {
        ok: false,
        error: `That image is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is ${MAX_UPLOAD_BYTES / 1024 / 1024}MB.`,
      },
      { status: 413 },
    );
  }

  if (altText.length < 4) {
    return NextResponse.json(
      { ok: false, error: "Describe the photograph before uploading — alt text is required." },
      { status: 400 },
    );
  }

  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    return NextResponse.json({ ok: false, error: "Image dimensions were missing." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffImageType(buffer);

  if (!sniffed || !isAccepted(sniffed)) {
    return NextResponse.json(
      { ok: false, error: "That file is not a JPEG, PNG, WebP or AVIF image." },
      { status: 415 },
    );
  }

  // A mismatch between the claimed and actual type is a red flag, not a
  // convenience to paper over.
  if (isAccepted(file.type) && file.type !== sniffed) {
    return NextResponse.json(
      { ok: false, error: "That file's contents do not match its type." },
      { status: 415 },
    );
  }

  try {
    const asset = await createMedia({
      filename: file.name.slice(0, 200) || "upload",
      mimeType: sniffed,
      width: Math.round(width),
      height: Math.round(height),
      altText: altText.slice(0, 300),
      data: new Uint8Array(buffer),
    });

    return NextResponse.json({ ok: true, asset });
  } catch (error) {
    console.error("[media] upload failed", error);
    return NextResponse.json({ ok: false, error: "Could not save that image." }, { status: 500 });
  }
}
