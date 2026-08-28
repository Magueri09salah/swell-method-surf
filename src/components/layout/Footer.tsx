import Link from "next/link";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { NAV_LINKS, FOOTER_LINKS, SITE } from "@/lib/constants";
import { getSettings } from "@/server/services/settings";
import { Logo } from "@/components/brand/Logo";
import { whatsappHref } from "@/lib/utils";

/**
 * Footer — the Figma's yellow band.
 *
 * Everything here is INK on yellow, which measures 14.54:1. Note the logo uses
 * `tone="ink"` rather than its own terracotta: terracotta on this yellow is
 * 2.95:1 and fails even the 3:1 graphics floor. See DECISIONS.md D-013.
 */
export async function Footer() {
  const settings = await getSettings();
  const year = new Date().getFullYear();

  const contactItems = [
    settings.email && {
      icon: Mail,
      label: settings.email,
      href: `mailto:${settings.email}`,
    },
    settings.whatsapp && {
      icon: Phone,
      label: `WhatsApp ${settings.whatsapp}`,
      href: whatsappHref(settings.whatsapp),
      external: true,
    },
    settings.instagram && {
      icon: Instagram,
      label: "Instagram",
      href: settings.instagram,
      external: true,
    },
  ].filter(Boolean) as {
    icon: typeof Mail;
    label: string;
    href: string;
    external?: boolean;
  }[];

  const linkClass =
    "type-body-sm text-[var(--text-on-accent)] underline-offset-4 transition-opacity duration-200 hover:opacity-65 hover:underline";

  return (
    <footer className="bg-[var(--color-yellow)] text-[var(--text-on-accent)]">
      <div className="mx-auto w-full max-w-[1480px] px-5 py-14 md:px-8 md:py-16 xl:px-12">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1.2fr]">
          <div className="flex flex-col gap-5">
            <Logo tone="ink" />
            <p className="measure-tight type-body-sm text-[rgba(20,20,20,0.75)]">
              Technique-led surf coaching in {SITE.locality}, {SITE.country}. Small numbers,
              honest feedback, and a wave long enough to feel it land.
            </p>
            <p className="type-caption flex items-center gap-2 text-[rgba(20,20,20,0.75)]">
              <MapPin aria-hidden="true" className="size-3.5" />
              {settings.location}
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-3">
            <h2 className="type-label">Explore</h2>
            <ul className="flex flex-col gap-2">
              {[...NAV_LINKS, ...FOOTER_LINKS].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-3">
            <h2 className="type-label">Get in touch</h2>

            {contactItems.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {contactItems.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      {...(item.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className={`inline-flex items-center gap-2 ${linkClass}`}
                    >
                      <item.icon aria-hidden="true" className="size-4 shrink-0" />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              // Designed empty state — the footer must still look finished
              // before the coach has entered any contact details.
              <p className="type-body-sm text-[rgba(20,20,20,0.75)]">
                Send a booking request and we will reply by email.
              </p>
            )}

            <Link
              href="/contact"
              className="mt-3 inline-flex h-11 w-fit items-center rounded-[9999px] bg-[var(--color-ink)] px-6 type-label text-white transition-colors duration-200 hover:bg-white hover:text-[var(--color-ink)]"
            >
              Book a session
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-[rgba(20,20,20,0.2)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="type-caption text-[rgba(20,20,20,0.72)]">
            © {year} {settings.businessName}. All rights reserved.
          </p>
          <p className="type-caption text-[rgba(20,20,20,0.72)]">
            {SITE.locality} · {SITE.region} · {SITE.country}
          </p>
        </div>
      </div>
    </footer>
  );
}
