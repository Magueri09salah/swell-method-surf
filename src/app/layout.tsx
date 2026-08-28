import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Poppins } from "next/font/google";
import { SITE, siteUrl } from "@/lib/constants";
import "./globals.css";

/**
 * Fonts are self-hosted through next/font, so there are zero external font
 * requests and the CSP needs no font-host exception.
 *
 * Poppins carries the display voice — heavy, geometric, wide. Only the weights
 * actually used are loaded; every extra weight is real bytes on first paint.
 * IBM Plex Mono is the UI and body face, matching the Figma's monospace
 * treatment. See DESIGN_SYSTEM.md §3.1.
 */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-poppins",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description:
    "Private, semi-private and small-group surf coaching in Imsouane, Morocco. Technique-led sessions on one of the country's longest right-hand waves.",
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  formatDetection: { telephone: false },
  // Icons are file-convention based: src/app/icon.png and src/app/apple-icon.png
  // are detected automatically and hashed for cache-busting. Both are generated
  // from the supplied artwork — see docs/DECISIONS.md D-001.
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Zoom is never disabled (WCAG 1.4.4).
  maximumScale: 5,
  themeColor: "#FCFCF7",
  colorScheme: "light",
};

/**
 * `suppressHydrationWarning` on <html> and <body> — deliberately, and narrowly.
 *
 * These two elements are the ones browser extensions mutate before React
 * hydrates: password managers, Grammarly (`data-gr-*`), LanguageTool
 * (`data-lt-installed`), Dark Reader and translation tools all stamp attributes
 * onto the root. `<html>` is also where our own reveal system sets
 * `data-reveal="on"` once JavaScript is confirmed running.
 *
 * WHAT THIS DOES NOT DO: it is not a blanket silencer. React applies it to the
 * attributes of THIS element only — one level deep, not to descendants. A real
 * mismatch inside any component still reports normally, so this cannot hide a
 * genuine bug in our own markup.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
