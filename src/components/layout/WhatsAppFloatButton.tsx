import { whatsappHref } from "@/lib/utils";

/**
 * Floating WhatsApp button — homepage only, by request.
 *
 * A server component: it is a single `<a>` built from the coach's stored
 * number, so there is nothing here that needs the client runtime.
 *
 * Renders nothing when no WhatsApp number is configured, rather than shipping
 * a dead link. The number itself is not re-validated here — `whatsappHref`
 * already strips everything but digits, and Admin -> Settings is the one place
 * that value is entered and corrected.
 *
 * Colour: WhatsApp's own brand green, not a token from the site's palette. It
 * identifies a third-party service rather than introducing a new accent into
 * the design system, which is why it is the one hardcoded hex on the page.
 */
export function WhatsAppFloatButton({ number }: { number: string }) {
  if (!number) return null;

  return (
    <a
      href={whatsappHref(number, "Hi! I would like to ask about a surf coaching session in Imsouane.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] shadow-[0_8px_24px_rgba(20,20,20,0.22)] transition-transform duration-200 hover:scale-105 focus-visible:scale-105 sm:bottom-6 sm:right-6"
    >
      <WhatsAppGlyph className="size-7 text-white" />
    </a>
  );
}

/** The WhatsApp handset-in-bubble mark, drawn inline so no icon package or
 *  network request is needed for a single glyph. */
function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className} fill="currentColor">
      <path d="M16.04 3C9.05 3 3.38 8.66 3.38 15.64c0 2.28.6 4.5 1.74 6.46L3 29l7.08-2.08a12.6 12.6 0 0 0 5.96 1.5h.01c6.98 0 12.65-5.66 12.65-12.64C28.7 8.8 23.04 3 16.04 3zm0 23.02h-.01a10.5 10.5 0 0 1-5.35-1.47l-.38-.23-4.2 1.24 1.26-4.1-.25-.42a10.44 10.44 0 0 1-1.61-5.4c0-5.8 4.72-10.52 10.55-10.52 2.82 0 5.46 1.1 7.45 3.1a10.46 10.46 0 0 1 3.08 7.44c0 5.8-4.72 10.36-10.54 10.36zm5.79-7.85c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.87-1.76-2.19-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.53-.71-.54h-.6c-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.63s1.13 3.05 1.28 3.26c.16.21 2.22 3.39 5.38 4.75.75.32 1.34.51 1.8.66.76.24 1.44.21 1.99.13.61-.09 1.88-.77 2.14-1.51.27-.75.27-1.38.19-1.51-.08-.14-.29-.21-.61-.37z" />
    </svg>
  );
}
