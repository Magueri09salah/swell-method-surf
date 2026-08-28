import type { Metadata } from "next";
import { PlaceSection } from "@/components/sections/PlaceSection";
import { CtaBand } from "@/components/sections/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { getContent } from "@/server/services/content";

export const metadata: Metadata = pageMetadata({
  title: "Surfing Imsouane — The Bay, The Season, The Etiquette",
  description:
    "A guide to surfing Imsouane on Morocco's Atlantic coast: the bay and its long right-hander, when to visit, what to bring, where to stay and how to share the line-up.",
  path: "/imsouane",
});

export default async function ImsouanePage() {
  const [place, cta] = await Promise.all([
    getContent("imsouane.guide"),
    getContent("home.cta"),
  ]);

  return (
    <>
      <PlaceSection content={place} headingLevel="h1" />
      <CtaBand content={cta} />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Imsouane", path: "/imsouane" },
        ])}
      />
    </>
  );
}
