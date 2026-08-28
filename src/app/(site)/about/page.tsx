import type { Metadata } from "next";
import { CoachIntro } from "@/components/sections/CoachIntro";
import { MethodPillars } from "@/components/sections/MethodPillars";
import { CtaBand } from "@/components/sections/CtaBand";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, pageMetadata, personJsonLd } from "@/lib/seo";
import { getContent } from "@/server/services/content";
import { getSettings } from "@/server/services/settings";

export const metadata: Metadata = pageMetadata({
  title: "The Coach — Swell Method Surf",
  description:
    "Who coaches you, how they coach, and why the sessions are based in Imsouane. Small numbers, specific feedback, and progression you can continue on your own.",
  path: "/about",
});

export default async function AboutPage() {
  const [bio, pillars, cta, settings] = await Promise.all([
    getContent("about.bio"),
    getContent("method.pillars"),
    getContent("home.cta"),
    getSettings(),
  ]);

  return (
    <>
      <CoachIntro content={bio} headingLevel="h1" showCta={false} />
      <MethodPillars content={pillars} limit={3} />
      <CtaBand content={cta} />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "The Coach", path: "/about" },
        ])}
      />
      {/* Person markup uses only the coach's own words and the business name —
          no invented certifications or years of experience. */}
      <JsonLd data={personJsonLd(settings.businessName, bio.title)} />
    </>
  );
}
