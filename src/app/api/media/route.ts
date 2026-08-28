import { NextResponse } from "next/server";
import { requireAdminOrFail } from "@/server/auth";
import { listMedia } from "@/server/services/media";

/**
 * Lists uploaded images for the admin picker.
 *
 * ADMIN ONLY — unlike `GET /api/media/[id]`, which serves a single public
 * photograph, this enumerates the whole library and must not be readable by
 * visitors.
 */
export async function GET() {
  const auth = await requireAdminOrFail();
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  try {
    const assets = await listMedia();
    return NextResponse.json({ ok: true, assets });
  } catch (error) {
    console.error("[media] list failed", error);
    return NextResponse.json({ ok: false, error: "Could not load the library." }, { status: 500 });
  }
}
