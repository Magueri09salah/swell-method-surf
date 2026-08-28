import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/sections/PageHeader";
import { BookingForm } from "@/components/booking/BookingForm";
import { Container } from "@/components/ui/primitives";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getActiveOffers } from "@/server/services/coaching";
import { getActivePackages } from "@/server/services/package";
import { getSettings } from "@/server/services/settings";
import { SITE } from "@/lib/constants";
import { whatsappHref } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "Book a Surf Session in Imsouane",
  description:
    "Request a private, semi-private or small-group surf coaching session in Imsouane, Morocco. Tell us your dates and level and we will reply within about 24 hours.",
  path: "/contact",
});

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ offer?: string; package?: string }>;
}) {
  const [{ offer, package: packageSlug }, offers, packages, settings] = await Promise.all([
    searchParams,
    getActiveOffers(),
    getActivePackages(),
    getSettings(),
  ]);

  // Only honour a query param if it names a real, active record — never trust a
  // URL value straight into a form default.
  const preselected = offers.some((item) => item.id === offer) ? offer : undefined;

  // Arriving from a package card pre-writes the message, so the coach knows
  // which bundle prompted the request without needing a column for it.
  const chosenPackage = packages.find((item) => item.slug === packageSlug);
  // The form now switches to the package half and preselects it, so a
  // pre-written "I am interested in X" would only repeat the visible choice.
  const prefilledMessage = undefined;

  return (
    <>
      <PageHeader
        eyebrow="Book a session"
        title="Tell me your dates and where you are in your surfing."
        lead="This is a request, not a checkout. Nothing is charged here — I will reply personally with what I recommend and what the conditions are likely to be doing."
      />

      <section className="section-y">
        <Container size="wide">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
            <BookingForm
              offers={offers}
              packages={packages}
              preselectedOfferId={preselected}
              preselectedPackageId={chosenPackage?.id}
              prefilledMessage={prefilledMessage}
            />

            <aside className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
              <div className="flex flex-col gap-4 rounded-[8px] border border-[var(--color-line)] bg-[var(--surface-raised)] p-6">
                <h2 className="type-h3">What happens next</h2>
                <ol className="flex flex-col gap-3">
                  {[
                    "You send this request — it takes about a minute.",
                    "I check the dates, the tide and the forecast.",
                    "I reply with a recommendation and a time.",
                    "You confirm, and we surf.",
                  ].map((step, index) => (
                    <li key={step} className="flex gap-3 type-body-sm text-[var(--text-secondary)]">
                      <span
                        aria-hidden="true"
                        className="font-display text-lg leading-none text-[var(--text-tertiary)]"
                      >
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex flex-col gap-3">
                <h2 className="type-label text-[var(--text-tertiary)]">Or reach me directly</h2>

                <ul className="flex flex-col gap-3">
                  <li className="flex items-start gap-2.5 type-body-sm text-[var(--text-secondary)]">
                    <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--text-tertiary)]" />
                    {settings.location || `${SITE.locality}, ${SITE.country}`}
                  </li>

                  {settings.email && (
                    <li className="flex items-start gap-2.5">
                      <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--text-tertiary)]" />
                      <a
                        href={`mailto:${settings.email}`}
                        className="type-body-sm text-[var(--color-ink)] underline-offset-4 hover:underline"
                      >
                        {settings.email}
                      </a>
                    </li>
                  )}

                  {settings.whatsapp && (
                    <li className="flex items-start gap-2.5">
                      <MessageCircle
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-[var(--text-tertiary)]"
                      />
                      <a
                        href={whatsappHref(
                          settings.whatsapp,
                          "Hi — I would like to ask about a surf coaching session in Imsouane.",
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="type-body-sm text-[var(--color-ink)] underline-offset-4 hover:underline"
                      >
                        WhatsApp {settings.whatsapp}
                      </a>
                    </li>
                  )}

                  <li className="flex items-start gap-2.5 type-body-sm text-[var(--text-secondary)]">
                    <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--text-tertiary)]" />
                    Replies within about 24 hours ({SITE.timezone.replace("_", " ")})
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Book a session", path: "/contact" },
        ])}
      />
    </>
  );
}
