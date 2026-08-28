import { describe, expect, it, beforeEach } from "vitest";
import {
  coachingOfferSchema,
  galleryImageSchema,
  loginSchema,
  siteSettingsSchema,
  testimonialSchema,
  packageSchema,
} from "@/lib/validation/admin";
import { CONTENT_DEFAULTS, CONTENT_SCHEMAS, CONTENT_KEYS } from "@/lib/validation/content";
import { checkRateLimit, __resetRateLimits } from "@/server/rate-limit";
import { generateBookingReference, slugify, formatDuration } from "@/lib/utils";

const validOffer = (overrides: Record<string, unknown> = {}) => ({
  title: "Private Coaching",
  slug: "private-coaching",
  shortDescription: "One surfer, one coach, full attention throughout the session.",
  description: "A longer description of what the session actually involves, start to finish.",
  level: "ALL_LEVELS",
  format: "PRIVATE",
  durationMinutes: "120",
  price: "950",
  currency: "mad",
  maxParticipants: "1",
  includes: "Board included\nWetsuit included",
  featured: false,
  active: true,
  sortOrder: "0",
  ...overrides,
});

describe("coaching offer validation", () => {
  it("accepts a valid offer and upper-cases the currency", () => {
    const result = coachingOfferSchema.safeParse(validOffer());
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.currency).toBe("MAD");
  });

  it("rejects a slug with spaces or capitals", () => {
    expect(coachingOfferSchema.safeParse(validOffer({ slug: "Private Coaching" })).success).toBe(
      false,
    );
    expect(coachingOfferSchema.safeParse(validOffer({ slug: "private_coaching" })).success).toBe(
      false,
    );
  });

  it("rejects a negative price", () => {
    expect(coachingOfferSchema.safeParse(validOffer({ price: "-10" })).success).toBe(false);
  });

  it("rejects an implausible duration", () => {
    expect(coachingOfferSchema.safeParse(validOffer({ durationMinutes: "5" })).success).toBe(false);
    expect(coachingOfferSchema.safeParse(validOffer({ durationMinutes: "900" })).success).toBe(
      false,
    );
  });

  it("rejects a currency that is not three letters", () => {
    expect(coachingOfferSchema.safeParse(validOffer({ currency: "MADS" })).success).toBe(false);
  });
});

describe("gallery image validation", () => {
  const valid = {
    title: "The bay at first light",
    imageUrl: "https://images.unsplash.com/photo-123",
    altText: "A long right-hand point break wrapping into a bay",
    category: "IMSOUANE",
    featured: false,
    published: true,
    sortOrder: "0",
  };

  it("accepts a valid image", () => {
    expect(galleryImageSchema.safeParse(valid).success).toBe(true);
  });

  it("REQUIRES alt text — accessibility is not optional", () => {
    expect(galleryImageSchema.safeParse({ ...valid, altText: "" }).success).toBe(false);
    const missing = { ...valid } as Record<string, unknown>;
    delete missing.altText;
    expect(galleryImageSchema.safeParse(missing).success).toBe(false);
  });

  it("rejects a non-URL image source", () => {
    expect(galleryImageSchema.safeParse({ ...valid, imageUrl: "not-a-url" }).success).toBe(false);
  });
});

describe("testimonial validation", () => {
  const valid = {
    clientName: "A Real Person",
    quote: "Genuine feedback from a genuine session, long enough to be meaningful.",
    rating: "5",
    featured: false,
    published: true,
    sortOrder: "0",
  };

  it("accepts a valid testimonial", () => {
    expect(testimonialSchema.safeParse(valid).success).toBe(true);
  });

  it("constrains the rating to 1–5", () => {
    expect(testimonialSchema.safeParse({ ...valid, rating: "0" }).success).toBe(false);
    expect(testimonialSchema.safeParse({ ...valid, rating: "6" }).success).toBe(false);
  });
});

describe("package validation", () => {
  const valid = {
    title: "5 Days Package",
    slug: "5-days-package",
    days: "5",
    price: "180",
    currency: "eur",
    features:
      "5 Surf sessions (2h daily coaching)\nEquipment included (Board & Wetsuit)",
    featured: false,
    active: true,
    sortOrder: "0",
  };

  it("accepts a valid package and upper-cases the currency", () => {
    const r = packageSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.currency).toBe("EUR");
  });

  it("rejects a slug with spaces or capitals", () => {
    expect(packageSchema.safeParse({ ...valid, slug: "5 Days" }).success).toBe(false);
  });

  it("rejects a negative price", () => {
    expect(packageSchema.safeParse({ ...valid, price: "-1" }).success).toBe(false);
  });

  it("rejects an implausible day count", () => {
    expect(packageSchema.safeParse({ ...valid, days: "0" }).success).toBe(false);
    expect(packageSchema.safeParse({ ...valid, days: "400" }).success).toBe(false);
  });

  it("accepts a local image path, not just a URL", () => {
    const r = packageSchema.safeParse({ ...valid, imageUrl: "/api/media/abc123" });
    expect(r.success).toBe(true);
  });
});

describe("coaching offer description", () => {
  it("no longer requires a long description", () => {
    // Removed from the admin form at the client's request: cards only ever
    // render shortDescription, so requiring a second body of copy was asking
    // for work nothing displayed.
    const r = coachingOfferSchema.safeParse({ ...validOffer(), description: "" });
    expect(r.success).toBe(true);
  });
});

describe("login validation", () => {
  it("accepts credentials and normalises the email", () => {
    const result = loginSchema.safeParse({ email: " Coach@Example.COM ", password: "secret123" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("coach@example.com");
  });

  it("rejects an empty password", () => {
    expect(loginSchema.safeParse({ email: "coach@example.com", password: "" }).success).toBe(false);
  });
});

describe("site settings validation", () => {
  const valid = {
    businessName: "Swell Method Surf",
    email: "hello@example.com",
    currency: "MAD",
    timezone: "Africa/Casablanca",
  };

  it("accepts valid settings", () => {
    expect(siteSettingsSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an SEO title long enough to be truncated in results", () => {
    expect(siteSettingsSchema.safeParse({ ...valid, seoTitle: "x".repeat(80) }).success).toBe(
      false,
    );
  });
});

describe("content schemas", () => {
  it("every shipped default validates against its own schema", () => {
    // Guards against a default drifting out of sync with its schema, which
    // would make getContent silently fall back on every request.
    for (const key of CONTENT_KEYS) {
      const result = CONTENT_SCHEMAS[key].safeParse(CONTENT_DEFAULTS[key]);
      expect(result.success, `default for "${key}" should be valid`).toBe(true);
    }
  });

  it("has a default for every registered key", () => {
    for (const key of CONTENT_KEYS) {
      expect(CONTENT_DEFAULTS[key]).toBeDefined();
    }
  });
});

describe("rate limiting", () => {
  beforeEach(() => __resetRateLimits());

  it("allows requests up to the limit", () => {
    for (let i = 0; i < 5; i += 1) {
      expect(checkRateLimit("ip:1.2.3.4", 5, 60_000).ok).toBe(true);
    }
  });

  it("blocks the request after the limit", () => {
    for (let i = 0; i < 5; i += 1) checkRateLimit("ip:1.2.3.4", 5, 60_000);
    const blocked = checkRateLimit("ip:1.2.3.4", 5, 60_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("tracks each key independently", () => {
    for (let i = 0; i < 5; i += 1) checkRateLimit("ip:1.1.1.1", 5, 60_000);
    expect(checkRateLimit("ip:1.1.1.1", 5, 60_000).ok).toBe(false);
    expect(checkRateLimit("ip:2.2.2.2", 5, 60_000).ok).toBe(true);
  });

  it("resets once the window has elapsed", async () => {
    expect(checkRateLimit("ip:3.3.3.3", 1, 20).ok).toBe(true);
    expect(checkRateLimit("ip:3.3.3.3", 1, 20).ok).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 40));
    expect(checkRateLimit("ip:3.3.3.3", 1, 20).ok).toBe(true);
  });
});

describe("utilities", () => {
  it("generates references without ambiguous characters", () => {
    for (let i = 0; i < 200; i += 1) {
      const reference = generateBookingReference();
      expect(reference).toMatch(/^SMS-[A-HJ-NP-Z2-9]{6}$/);
      // 0/O and 1/I are excluded so the reference survives being read aloud.
      expect(reference.slice(4)).not.toMatch(/[01OI]/);
    }
  });

  it("slugifies accented titles", () => {
    expect(slugify("Coaching Privé")).toBe("coaching-prive");
    expect(slugify("  Semi-Private  Coaching!  ")).toBe("semi-private-coaching");
  });

  it("formats durations either side of the hour", () => {
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(60)).toBe("1h");
    expect(formatDuration(150)).toBe("2h 30");
  });
});
