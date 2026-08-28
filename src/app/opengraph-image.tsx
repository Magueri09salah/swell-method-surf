import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE } from "@/lib/constants";

export const runtime = "nodejs";
export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social preview card.
 *
 * Uses the real emblem, read from disk and inlined as a data URI — ImageResponse
 * cannot resolve a relative public path, and fetching over the network at render
 * time would add a failure mode for a card that must always produce something.
 *
 * TYPOGRAPHY CAVEAT, stated rather than implied: Satori has no access to the
 * self-hosted Instrument Serif, so this card renders in its embedded default
 * face — it is NOT the site's display type. Fetching the webfont at render time
 * was rejected because it adds a network failure mode to a route that must
 * always produce an image. The brand carries through the palette, the real
 * emblem and the layout instead. To match the site exactly, commit an
 * Instrument Serif .ttf and pass it via the `fonts` option.
 */
export default async function OpengraphImage() {
  const emblem = await readFile(join(process.cwd(), "public/brand/logo-emblem-color.png"));
  const emblemSrc = `data:image/png;base64,${emblem.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#FAEADB",
          padding: "68px 72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "28px",
                letterSpacing: "7px",
                textTransform: "uppercase",
                color: "#2B211C",
              }}
            >
              Swell Method
            </span>
            <span
              style={{
                fontSize: "15px",
                letterSpacing: "5px",
                textTransform: "uppercase",
                color: "#72594A",
                fontFamily: "system-ui, sans-serif",
                marginTop: "8px",
              }}
            >
              Surf Coaching
            </span>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={emblemSrc} alt="" width={196} height={155} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
          {/* Width is in PIXELS, not `ch`. Satori does not support ch units —
              they collapse to near-zero and force one word per line, which
              overflows the card. Verified by rendering the route. */}
          <div
            style={{
              fontSize: "76px",
              lineHeight: 1.06,
              color: "#2B211C",
              width: "820px",
              display: "flex",
            }}
          >
            Learn to read the ocean.
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div style={{ width: "76px", height: "2px", backgroundColor: "#BF7047" }} />
            <span
              style={{
                fontSize: "25px",
                color: "#72594A",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              Surf coaching in Imsouane, Morocco
            </span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
