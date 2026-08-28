import type { Metadata } from "next";
import { MethodPillars } from "@/components/sections/MethodPillars";
import { CtaBand } from "@/components/sections/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getContent } from "@/server/services/content";

export const metadata: Metadata = pageMetadata({
  title: "The Swell Method — How the Coaching Works",
  description:
    "Reading water, positioning, paddling, take-off, riding and independent progression. The six things we work on, and the order we work on them in.",
  path: "/method",
});

export default async function MethodPage() {
  const [pillars, cta] = await Promise.all([
    getContent("method.pillars"),
    getContent("home.cta"),
  ]);

  return (
    <>
      {/* This page's h1 lives inside MethodPillars, so no PageHeader here —
          two competing openers would create a duplicate-h1 problem. */}
      <MethodPillars content={pillars} headingLevel="h1" />
      <CtaBand content={cta} />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "The Method", path: "/method" },
        ])}
      />
    </>
  );
}
