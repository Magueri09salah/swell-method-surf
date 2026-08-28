import { z } from "zod";

/**
 * Typed CMS payloads (docs/DECISIONS.md D-011).
 *
 * Each ContentSection row is addressed by a stable key and its `data` column is
 * validated by the matching schema below. This is deliberately NOT a block
 * builder: the coach edits real fields through purpose-built forms and cannot
 * break the layout.
 *
 * Adding a new editable section = add a key here + a default + a form entry.
 */

export const heroSchema = z.object({
  eyebrow: z.string().trim().max(60),
  title: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(400),
  primaryCtaLabel: z.string().trim().max(40),
  primaryCtaHref: z.string().trim().max(200),
  secondaryCtaLabel: z.string().trim().max(40),
  secondaryCtaHref: z.string().trim().max(200),
});

export const introSchema = z.object({
  eyebrow: z.string().trim().max(60),
  title: z.string().trim().max(160),
  body: z.string().trim().max(1600),
  signature: z.string().trim().max(120).optional().or(z.literal("")),
});

export const pillarsSchema = z.object({
  eyebrow: z.string().trim().max(60),
  title: z.string().trim().max(160),
  intro: z.string().trim().max(800),
  pillars: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(40),
        title: z.string().trim().min(1).max(60),
        body: z.string().trim().min(1).max(900),
        objective: z.string().trim().max(200).optional().or(z.literal("")),
      }),
    )
    .max(12),
});

export const bioSchema = z.object({
  eyebrow: z.string().trim().max(60),
  title: z.string().trim().max(160),
  body: z.string().trim().max(4000),
  quote: z.string().trim().max(400).optional().or(z.literal("")),
});

export const placeSchema = z.object({
  eyebrow: z.string().trim().max(60),
  title: z.string().trim().max(160),
  intro: z.string().trim().max(1200),
  blocks: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(80),
        body: z.string().trim().min(1).max(1200),
      }),
    )
    .max(12),
});

export const ctaSchema = z.object({
  title: z.string().trim().max(160),
  body: z.string().trim().max(600),
  ctaLabel: z.string().trim().max(40),
  ctaHref: z.string().trim().max(200),
});

/** The complete registry. `key` values are stable and must never be renamed. */
export const CONTENT_SCHEMAS = {
  "home.hero": heroSchema,
  "home.intro": introSchema,
  "home.cta": ctaSchema,
  "method.pillars": pillarsSchema,
  "about.bio": bioSchema,
  "imsouane.guide": placeSchema,
} as const;

export type ContentKey = keyof typeof CONTENT_SCHEMAS;

export type ContentData<K extends ContentKey> = z.output<(typeof CONTENT_SCHEMAS)[K]>;

export const CONTENT_LABELS: Record<ContentKey, string> = {
  "home.hero": "Homepage — Hero",
  "home.intro": "Homepage — Introduction",
  "home.cta": "Homepage — Closing call to action",
  "method.pillars": "The Method — Pillars",
  "about.bio": "About — Coach biography",
  "imsouane.guide": "Imsouane — Destination guide",
};

/**
 * Defaults. These are the copy the site ships with and what the seed writes.
 *
 * Voice: calm, specific, first-person, no superlatives, no invented statistics,
 * no claims about credentials the coach may not hold (brief §46, §53).
 */
export const CONTENT_DEFAULTS: { [K in ContentKey]: ContentData<K> } = {
  "home.hero": {
    eyebrow: "Imsouane · Morocco",
    title: "Learn to read the ocean.",
    subtitle:
      "Small-group and one-to-one surf coaching on one of Morocco's longest right-hand waves. We work on what actually holds you back — not just standing up.",
    primaryCtaLabel: "Book a session",
    primaryCtaHref: "/contact",
    secondaryCtaLabel: "Discover the method",
    secondaryCtaHref: "/method",
  },
  "home.intro": {
    eyebrow: "Swell Method Surf",
    title: "Coaching built around one surfer at a time.",
    body:
      "Most people plateau because nobody tells them what they are actually doing. A session here starts on the sand, watching the water and talking through what it is doing that morning. Then we surf, and I give you feedback you can use on the next wave — not a list to remember for next year.\n\nThe bay at Imsouane is unusually generous for this. The wave is long, it breaks in a way you can read, and it gives you enough time on your feet to feel a correction land. That is why the coaching is here.",
    signature: "",
  },
  "home.cta": {
    title: "Ready to surf with intention?",
    body: "Tell me your dates and where you are in your surfing. I will come back to you with an honest recommendation — including if I think a different format suits you better.",
    ctaLabel: "Book your session",
    ctaHref: "/contact",
  },
  "method.pillars": {
    eyebrow: "The Swell Method",
    title: "Six things worth getting right.",
    intro:
      "This is not a syllabus you graduate from. It is the order I look at things in, and the order most surfers unlock them in. Whatever level you arrive at, we find the layer that is actually costing you waves and work there.",
    pillars: [
      {
        id: "read",
        title: "Read",
        body: "Before anything else: what is the ocean doing today? Where is the energy coming from, where is it breaking, and why there? We spend real time watching before we paddle out, because a surfer who can read a bank will out-surf a fitter one who cannot.",
        objective: "Describe the session out loud before entering the water.",
      },
      {
        id: "position",
        title: "Position",
        body: "Most missed waves are missed before the paddle starts. Line-up positioning, using markers on land, drifting with the current instead of fighting it, and knowing when to move rather than wait.",
        objective: "Hold a position without being told where to sit.",
      },
      {
        id: "paddle",
        title: "Paddle",
        body: "Efficiency first, then power. Where you lie on the board changes everything downstream — too far back and the board will not plane, too far forward and you bury the nose. We fix the platform before adding effort.",
        objective: "Catch waves without sprinting for them.",
      },
      {
        id: "take-off",
        title: "Take Off",
        body: "One movement, not three. We work on the timing of the pop-up against the wave rather than on the sand in isolation, because the wave is what makes it hard.",
        objective: "Stand up already facing the direction you intend to go.",
      },
      {
        id: "ride",
        title: "Ride",
        body: "Where you look, where your weight sits, and how you use rail. This is where Imsouane earns its reputation — a long wall gives you the repetition to feel a change instead of guessing at it.",
        objective: "Make a deliberate turn, not an accidental one.",
      },
      {
        id: "progress",
        title: "Progress",
        body: "The aim is that you do not need me. Every session ends with two or three specific things to work on and how to tell whether they are working, so the progression continues after you leave.",
        objective: "Leave with a plan you can self-assess against.",
      },
    ],
  },
  "about.bio": {
    eyebrow: "The Coach",
    title: "I coach the way I wish I had been coached.",
    body:
      "I spent years surfing without improving much. I could catch waves, and that felt like enough until it very obviously was not. What changed things was someone finally telling me what I was doing rather than what I should be doing.\n\nThat is the whole basis of how I coach now. I keep numbers small — often one surfer, sometimes two — because feedback stops being useful when it is general. I would rather you get five corrections you can feel than fifty you can recite.\n\nImsouane is where I chose to base this. The bay is patient with people who are learning, and it is genuinely interesting for surfers who are not. That combination is rarer than it sounds.",
    quote: "You do not need to surf more. You need to notice more while you surf.",
  },
  "imsouane.guide": {
    eyebrow: "The Place",
    title: "Imsouane, and why the coaching is here.",
    intro:
      "A fishing village on Morocco's Atlantic coast, roughly between Agadir and Essaouira. Two bays, a working harbour, and a right-hander that peels far enough to change how you think about a single wave.",
    blocks: [
      {
        title: "The Bay",
        body: "The main point wraps into a sheltered bay and breaks right, holding its shape over a long stretch. Because the wave gives you time, it is one of the few places where you can actually practise something mid-ride instead of surviving the drop.",
      },
      {
        title: "Surf culture",
        body: "It is a small village that surfing arrived in rather than one built around it. The line-up can be busy in season and it is a mix of travelling surfers, longboarders and locals. Patience in the water goes a long way here.",
      },
      {
        title: "When to surf",
        body: "The Atlantic sends swell to this coast through most of the year, with autumn and winter generally the more consistent stretch and the summer often smaller and friendlier for beginners. Conditions change day to day — we plan sessions around what is actually arriving, not a calendar.",
      },
      {
        title: "What to bring",
        body: "A wetsuit is normal for most of the year; water temperature is mild rather than warm. Bring reef-safe sun protection, something to cover up in between sessions, and shoes you do not mind getting wet on the walk out. Boards can be arranged.",
      },
      {
        title: "Where to stay",
        body: "There is a range of guesthouses and small hotels in and around the village, plus options in Tamri and along the coast road. I am happy to point you towards somewhere that fits how you want the trip to feel — just ask when you book.",
      },
      {
        title: "Surf etiquette",
        body: "The surfer closest to the peak has priority, do not drop in, do not paddle through the middle of a set someone is riding, and give way to people who live here. Etiquette is most of what makes a crowded point break workable.",
      },
    ],
  },
};

export function contentSchemaFor<K extends ContentKey>(key: K) {
  return CONTENT_SCHEMAS[key];
}

export const CONTENT_KEYS = Object.keys(CONTENT_SCHEMAS) as ContentKey[];
