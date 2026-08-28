import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/constants";

/**
 * Sitemap. Only public, indexable routes — /admin is excluded here and
 * disallowed in robots.txt.
 *
 * Priorities reflect commercial intent: the booking page and the coaching page
 * matter more than the gallery.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const lastModified = new Date();

  const routes: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/coaching", priority: 0.9, changeFrequency: "weekly" },
    { path: "/contact", priority: 0.9, changeFrequency: "monthly" },
    { path: "/method", priority: 0.8, changeFrequency: "monthly" },
    { path: "/imsouane", priority: 0.7, changeFrequency: "monthly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/reviews", priority: 0.6, changeFrequency: "weekly" },
    { path: "/gallery", priority: 0.5, changeFrequency: "weekly" },
  ];

  return routes.map((route) => ({
    url: `${base}${route.path === "/" ? "" : route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
