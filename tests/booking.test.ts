import { describe, expect, it } from "vitest";
import { bookingRequestSchema, contactMessageSchema } from "@/lib/validation/booking";
import { canTransition, type BookingStatus } from "@/server/services/booking";

/** Helper: a valid payload, so each test can vary exactly one thing. */
function validPayload(overrides: Record<string, unknown> = {}) {
  const soon = new Date();
  soon.setDate(soon.getDate() + 14);

  return {
    name: "Amira Bennani",
    email: "Amira@Example.com",
    phone: "+212 612 345 678",
    country: "Morocco",
    preferredDate: soon.toISOString().slice(0, 10),
    participants: "2",
    experienceLevel: "INTERMEDIATE",
    coachingFormat: "SEMI_PRIVATE",
    message: "We are two, at slightly different levels.",
    acknowledged: "on",
    ...overrides,
  };
}

describe("booking request validation", () => {
  it("accepts a well-formed request", () => {
    const result = bookingRequestSchema.safeParse(validPayload());
    expect(result.success).toBe(true);
  });

  it("lowercases and trims the email so client identity is stable", () => {
    const result = bookingRequestSchema.safeParse(validPayload({ email: "  Amira@Example.COM " }));
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("amira@example.com");
  });

  it("coerces participants from a string, as it arrives from FormData", () => {
    const result = bookingRequestSchema.safeParse(validPayload({ participants: "3" }));
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.participants).toBe(3);
  });

  it("rejects a date in the past", () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    const result = bookingRequestSchema.safeParse(
      validPayload({ preferredDate: past.toISOString().slice(0, 10) }),
    );
    expect(result.success).toBe(false);
  });

  it("accepts today, since a same-day request is legitimate", () => {
    const today = new Date().toISOString().slice(0, 10);
    const result = bookingRequestSchema.safeParse(validPayload({ preferredDate: today }));
    expect(result.success).toBe(true);
  });

  it("rejects a date more than a year ahead", () => {
    const far = new Date();
    far.setFullYear(far.getFullYear() + 2);
    const result = bookingRequestSchema.safeParse(
      validPayload({ preferredDate: far.toISOString().slice(0, 10) }),
    );
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = bookingRequestSchema.safeParse(validPayload({ email: "not-an-email" }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined();
    }
  });

  it("rejects a party larger than eight", () => {
    const result = bookingRequestSchema.safeParse(validPayload({ participants: "12" }));
    expect(result.success).toBe(false);
  });

  it("rejects zero participants", () => {
    const result = bookingRequestSchema.safeParse(validPayload({ participants: "0" }));
    expect(result.success).toBe(false);
  });

  it("rejects an unknown experience level", () => {
    const result = bookingRequestSchema.safeParse(validPayload({ experienceLevel: "EXPERT" }));
    expect(result.success).toBe(false);
  });

  it("allows optional fields to be omitted entirely", () => {
    const payload = validPayload();
    delete (payload as Record<string, unknown>).phone;
    delete (payload as Record<string, unknown>).country;
    delete (payload as Record<string, unknown>).message;

    const result = bookingRequestSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("rejects an over-long message rather than truncating it", () => {
    const result = bookingRequestSchema.safeParse(
      validPayload({ message: "x".repeat(2001) }),
    );
    expect(result.success).toBe(false);
  });

  it("REQUIRES the acknowledgement checkbox", () => {
    // Regression guard. `.optional().refine()` does NOT work here — Zod skips
    // refinements on undefined, so an unchecked box silently passed. The schema
    // preprocesses to a boolean and requires literal true instead.
    const payload = validPayload();
    delete (payload as Record<string, unknown>).acknowledged;

    const result = bookingRequestSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.acknowledged).toBeDefined();
    }
  });

  it("rejects any acknowledgement value other than a checked box", () => {
    expect(bookingRequestSchema.safeParse(validPayload({ acknowledged: "" })).success).toBe(false);
    expect(bookingRequestSchema.safeParse(validPayload({ acknowledged: "off" })).success).toBe(
      false,
    );
    expect(bookingRequestSchema.safeParse(validPayload({ acknowledged: "false" })).success).toBe(
      false,
    );
  });

  it("rejects a filled honeypot", () => {
    // The schema rejects it; the action additionally returns a success-shaped
    // response so a bot cannot tell it was caught.
    const result = bookingRequestSchema.safeParse(validPayload({ website: "http://spam.example" }));
    expect(result.success).toBe(false);
  });

  it("accepts an empty honeypot, which is what real browsers send", () => {
    const result = bookingRequestSchema.safeParse(validPayload({ website: "" }));
    expect(result.success).toBe(true);
  });
});

describe("session vs package booking", () => {
  it("defaults to SESSION when the field is absent", () => {
    // A no-JS submit, or an older cached client, must still validate.
    const payload = validPayload();
    delete (payload as Record<string, unknown>).bookingType;

    const result = bookingRequestSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.bookingType).toBe("SESSION");
  });

  it("accepts a package booking with a package chosen", () => {
    const result = bookingRequestSchema.safeParse(
      validPayload({ bookingType: "PACKAGE", packageId: "pkg_abc123" }),
    );
    expect(result.success).toBe(true);
  });

  it("REJECTS a package booking with no package", () => {
    // The whole point of the switch: a package request the coach cannot price
    // must never reach the database, even from a hand-crafted POST.
    const result = bookingRequestSchema.safeParse(
      validPayload({ bookingType: "PACKAGE", packageId: "" }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.packageId).toBeDefined();
    }
  });

  it("rejects a package booking with the field omitted entirely", () => {
    const payload = validPayload({ bookingType: "PACKAGE" });
    delete (payload as Record<string, unknown>).packageId;
    expect(bookingRequestSchema.safeParse(payload).success).toBe(false);
  });

  it("does NOT require a package for a session booking", () => {
    const result = bookingRequestSchema.safeParse(
      validPayload({ bookingType: "SESSION", packageId: "" }),
    );
    expect(result.success).toBe(true);
  });

  it("rejects an unknown booking type", () => {
    expect(
      bookingRequestSchema.safeParse(validPayload({ bookingType: "SUBSCRIPTION" })).success,
    ).toBe(false);
  });
});

describe("contact message validation", () => {
  it("accepts a well-formed message", () => {
    const result = contactMessageSchema.safeParse({
      name: "Tom Fisher",
      email: "tom@example.com",
      subject: "Board hire",
      body: "Do you provide boards, or should I bring my own?",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a body that is too short to be actionable", () => {
    const result = contactMessageSchema.safeParse({
      name: "Tom Fisher",
      email: "tom@example.com",
      body: "hi",
    });
    expect(result.success).toBe(false);
  });
});

describe("booking status transitions", () => {
  it("allows the normal forward path", () => {
    expect(canTransition("PENDING", "CONFIRMED")).toBe(true);
    expect(canTransition("CONFIRMED", "COMPLETED")).toBe(true);
  });

  it("allows any live booking to reach a terminal state", () => {
    expect(canTransition("PENDING", "CANCELLED")).toBe(true);
    expect(canTransition("PENDING", "REJECTED")).toBe(true);
    expect(canTransition("CONFIRMED", "CANCELLED")).toBe(true);
  });

  it("refuses to skip confirmation", () => {
    expect(canTransition("PENDING", "COMPLETED")).toBe(false);
  });

  it("refuses to move backwards", () => {
    expect(canTransition("CONFIRMED", "PENDING")).toBe(false);
    expect(canTransition("COMPLETED", "CONFIRMED")).toBe(false);
  });

  it("treats terminal states as final", () => {
    const terminals: BookingStatus[] = ["COMPLETED", "CANCELLED", "REJECTED"];
    for (const from of terminals) {
      for (const to of ["PENDING", "CONFIRMED", "COMPLETED"] as BookingStatus[]) {
        if (from === to) continue;
        expect(canTransition(from, to)).toBe(false);
      }
    }
  });

  it("treats a no-op transition as allowed, so saving other fields works", () => {
    expect(canTransition("CONFIRMED", "CONFIRMED")).toBe(true);
    expect(canTransition("CANCELLED", "CANCELLED")).toBe(true);
  });
});
