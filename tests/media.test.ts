import { describe, expect, it } from "vitest";
import {
  coachingOfferSchema,
  galleryImageSchema,
  testimonialSchema,
} from "@/lib/validation/admin";

/**
 * Regression guard for the bug that made every coaching offer unsaveable.
 *
 * `imageUrl` used to be `z.string().url()`. Once photography moved from remote
 * URLs to local paths, the seed wrote `/photography/x.jpg` straight to the
 * database — so the public site rendered fine, but opening any offer in the
 * admin and pressing Save was rejected by both the browser (`type="url"`) and
 * Zod. The failure was invisible until someone actually tried to edit.
 */

const baseOffer = {
  title: "Private Coaching",
  slug: "private-coaching",
  shortDescription: "One surfer, one coach, full attention throughout the session.",
  description: "A longer description of what the session actually involves, start to finish.",
  level: "ALL_LEVELS",
  format: "PRIVATE",
  durationMinutes: "120",
  price: "950",
  currency: "MAD",
  maxParticipants: "1",
  featured: false,
  active: true,
  sortOrder: "0",
};

const baseGallery = {
  title: "The bay at first light",
  altText: "A long right-hand point break wrapping into a bay",
  category: "IMSOUANE",
  featured: false,
  published: true,
  sortOrder: "0",
};

describe("image references", () => {
  it("accepts a local /public path", () => {
    const r = coachingOfferSchema.safeParse({
      ...baseOffer,
      imageUrl: "/photography/coaching-popup.jpg",
    });
    expect(r.success).toBe(true);
  });

  it("accepts an uploaded /api/media path", () => {
    const r = galleryImageSchema.safeParse({
      ...baseGallery,
      imageUrl: "/api/media/clx123abc456",
    });
    expect(r.success).toBe(true);
  });

  it("accepts an https URL", () => {
    const r = galleryImageSchema.safeParse({
      ...baseGallery,
      imageUrl: "https://res.cloudinary.com/demo/image.jpg",
    });
    expect(r.success).toBe(true);
  });

  it("accepts an empty optional image on a coaching offer", () => {
    const r = coachingOfferSchema.safeParse({ ...baseOffer, imageUrl: "" });
    expect(r.success).toBe(true);
  });

  it("REQUIRES an image on a gallery entry", () => {
    const r = galleryImageSchema.safeParse({ ...baseGallery, imageUrl: "" });
    expect(r.success).toBe(false);
  });

  it("rejects a protocol-relative URL that only looks local", () => {
    // `//evil.example/x.jpg` starts with a slash but resolves to a third party.
    const r = galleryImageSchema.safeParse({
      ...baseGallery,
      imageUrl: "//evil.example/x.jpg",
    });
    expect(r.success).toBe(false);
  });

  it("rejects plain http", () => {
    const r = galleryImageSchema.safeParse({
      ...baseGallery,
      imageUrl: "http://insecure.example/x.jpg",
    });
    expect(r.success).toBe(false);
  });

  it("rejects a javascript: payload", () => {
    const r = galleryImageSchema.safeParse({
      ...baseGallery,
      imageUrl: "javascript:alert(1)",
    });
    expect(r.success).toBe(false);
  });

  it("rejects a data: URI", () => {
    const r = galleryImageSchema.safeParse({
      ...baseGallery,
      imageUrl: "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
    });
    expect(r.success).toBe(false);
  });

  it("rejects an over-long reference", () => {
    const r = galleryImageSchema.safeParse({
      ...baseGallery,
      imageUrl: "/photography/" + "x".repeat(600) + ".jpg",
    });
    expect(r.success).toBe(false);
  });

  it("applies the same rules to a testimonial avatar", () => {
    expect(
      testimonialSchema.safeParse({
        clientName: "A Real Person",
        quote: "Genuine feedback from a genuine session, long enough to be meaningful.",
        rating: "5",
        avatarUrl: "/api/media/abc123",
        featured: false,
        published: true,
        sortOrder: "0",
      }).success,
    ).toBe(true);

    expect(
      testimonialSchema.safeParse({
        clientName: "A Real Person",
        quote: "Genuine feedback from a genuine session, long enough to be meaningful.",
        rating: "5",
        avatarUrl: "//evil.example/a.png",
        featured: false,
        published: true,
        sortOrder: "0",
      }).success,
    ).toBe(false);
  });

  it("still requires alt text on a gallery entry", () => {
    const r = galleryImageSchema.safeParse({
      ...baseGallery,
      imageUrl: "/api/media/abc",
      altText: "",
    });
    expect(r.success).toBe(false);
  });
});
