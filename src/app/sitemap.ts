import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/constants";
import { hasPublicReviews } from "@/server/services/reviews";

/**
 * Sitemap. Only public, indexable routes — /admin is excluded here and
 * disallowed in robots.txt.
 *
 * Priorities reflect commercial intent: the booking page and the coaching page
 * matter more than the gallery.
 *
 * /reviews is conditional: it 404s while there are no reviews, and submitting
 * a known-404 URL to search engines is a soft-404 signal that costs crawl
 * budget for nothing. It rejoins the sitemap when the page comes back.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const lastModified = new Date();
  const showReviews = await hasPublicReviews();

  const routes: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/coaching", priority: 0.9, changeFrequency: "weekly" },
    { path: "/contact", priority: 0.9, changeFrequency: "monthly" },
    { path: "/method", priority: 0.8, changeFrequency: "monthly" },
    { path: "/imsouane", priority: 0.7, changeFrequency: "monthly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    ...(showReviews
      ? [{ path: "/reviews", priority: 0.6, changeFrequency: "weekly" as const }]
      : []),
    { path: "/gallery", priority: 0.5, changeFrequency: "weekly" },
  ];

  return routes.map((route) => ({
    url: `${base}${route.path === "/" ? "" : route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
