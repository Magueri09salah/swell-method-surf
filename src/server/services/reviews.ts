import "server-only";
import { getPublishedTestimonials } from "./testimonial";

/**
 * Is there anything to show on the reviews surfaces?
 *
 * WHY THIS EXISTS: with nothing published, the site was rendering an empty
 * reviews section, a /reviews page with a header and no content, a footer link
 * into it, and a sitemap entry pointing search engines at it — four surfaces
 * advertising an absence.
 *
 * All four ask this instead of being switched off by hand. It reads the same
 * cached source the sections themselves read, so publishing a testimonial
 * brings every surface back at once, with nothing to remember to flip.
 */
export async function hasPublicReviews(): Promise<boolean> {
  const testimonials = await getPublishedTestimonials();
  return testimonials.length > 0;
}
