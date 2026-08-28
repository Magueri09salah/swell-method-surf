import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { localBusinessJsonLd } from "@/lib/seo";
import { getSettings } from "@/server/services/settings";

/**
 * Public site shell.
 *
 * The skip link is the first focusable element on every page (WCAG 2.4.1) and
 * becomes visible on focus rather than being permanently hidden.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  const jsonLd = localBusinessJsonLd({
    email: settings.email || undefined,
    phone: settings.phone || undefined,
    instagram: settings.instagram || undefined,
    mapsUrl: settings.mapsUrl || undefined,
  });

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[4px] focus:bg-[var(--color-ink)] focus:px-4 focus:py-2.5 focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <Header />

      <main id="main" className="flex-1">
        {children}
      </main>

      <Footer />

      <JsonLd data={jsonLd} />
    </div>
  );
}
