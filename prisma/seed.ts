import { PrismaClient, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CONTENT_DEFAULTS, CONTENT_LABELS, CONTENT_KEYS } from "../src/lib/validation/content";

/**
 * Development seed.
 *
 * HONESTY RULES (brief §32, §53 — enforced here, not just documented):
 *
 *  - No fabricated coach credentials, certifications or years of experience.
 *  - No invented surf statistics, wave heights or water temperatures.
 *  - Sample testimonials are seeded with `published: false`, so nothing
 *    fabricated can reach the public site by accident. The coach publishes
 *    them only after replacing them with real feedback.
 *  - Coaching prices are plausible placeholders the coach is expected to edit.
 *
 * Idempotent: safe to re-run. Uses upsert on natural keys throughout.
 */

const prisma = new PrismaClient();

/** Photographs supplied by the coach, installed to public/photography/. */
const photo = (name: string) => `/photography/${name}`;

async function seedAdmin() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "coach@swellmethodsurf.com").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!password || password.length < 10) {
    throw new Error(
      "SEED_ADMIN_PASSWORD must be set to at least 10 characters before seeding. " +
        "Never commit a real password — set it in .env locally.",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    create: { email, passwordHash, name: "Coach", role: "ADMIN" },
    // Re-running the seed refreshes the password, which is the usual reason to
    // re-run it in development.
    update: { passwordHash },
  });

  console.log(`  admin: ${email}`);
}

const OFFERS: Prisma.CoachingOfferCreateInput[] = [
  {
    title: "Private Coaching",
    slug: "private-coaching",
    shortDescription:
      "One surfer, one coach, full attention. The fastest way to fix something that has been holding you back for years.",
    description:
      "A single session built entirely around you. We start on the sand reading the conditions together, then surf with continuous feedback — what you did, what it caused, and what to change on the next one. Video is not part of this by default; I would rather give you the correction while you can still feel the wave.\n\nBest for surfers who have plateaued, anyone nervous about being in a group, and travellers who want to make the most of a short trip.",
    level: "ALL_LEVELS",
    format: "PRIVATE",
    durationMinutes: 120,
    price: 950,
    currency: "MAD",
    maxParticipants: 1,
    includes: [
      "Two hours in and out of the water",
      "Board and wetsuit if you need them",
      "Conditions briefing before we paddle out",
      "Two or three things to work on afterwards",
    ],
    imageUrl: photo("coaching-popup.jpg"),
    imageAlt: "A coach demonstrating the pop-up stance to a surfer on a longboard on the sand",
    featured: true,
    active: true,
    sortOrder: 0,
  },
  {
    title: "Semi-Private Coaching",
    slug: "semi-private-coaching",
    shortDescription:
      "Two surfers, one coach. Ideal for couples and friends — including when you are at different levels.",
    description:
      "Built for pairs. You get most of the attention of a private session at a lower cost each, and I can set you different objectives in the same session if your levels differ — which is usually the case.\n\nTell me on the booking form where each of you is at and I will plan around it.",
    level: "ALL_LEVELS",
    format: "SEMI_PRIVATE",
    durationMinutes: 120,
    price: 700,
    currency: "MAD",
    maxParticipants: 2,
    includes: [
      "Two hours coached as a pair",
      "Separate objectives if your levels differ",
      "Boards and wetsuits if you need them",
      "Shared conditions briefing",
    ],
    imageUrl: photo("coaching-briefing.jpg"),
    imageAlt: "A coach explaining a point to four surfers standing on the sand beside their boards",
    featured: true,
    active: true,
    sortOrder: 1,
  },
  {
    title: "Small Group Coaching",
    slug: "small-group-coaching",
    shortDescription:
      "Never more than four surfers. Small enough that you still get corrections by name.",
    description:
      "Group sessions here are capped at four. That number is not arbitrary — beyond it I stop being able to watch every wave, and the session becomes supervision rather than coaching.\n\nA good option if you are travelling alone and would rather surf with other people, or if the budget matters more than the pace of progress.",
    level: "BEGINNER",
    format: "GROUP",
    durationMinutes: 120,
    price: 400,
    currency: "MAD",
    maxParticipants: 4,
    includes: [
      "Two hours with a maximum of four surfers",
      "Board and wetsuit included",
      "Beach briefing and safety",
      "Individual feedback, not just group instruction",
    ],
    imageUrl: photo("beach-warmup.jpg"),
    imageAlt: "A group warming up on the beach with soft-top boards laid out on the sand",
    featured: false,
    active: true,
    sortOrder: 2,
  },
  {
    title: "Intermediate Progression",
    slug: "intermediate-progression",
    shortDescription:
      "For surfers who can stand up and go straight, and want to start actually surfing the wave.",
    description:
      "The most common plateau: you can catch waves and ride them straight to the beach, but turning, trimming and reading a section still feel like luck.\n\nWe work on rail, trim line, where you are looking, and wave selection — the things that turn a ride into a decision rather than a survival. Imsouane's long right is close to ideal for this because you get enough time on a single wave to feel a change land.",
    level: "INTERMEDIATE",
    format: "PRIVATE",
    durationMinutes: 150,
    price: 1100,
    currency: "MAD",
    maxParticipants: 2,
    includes: [
      "Two and a half hours",
      "Focus on turning, trim and wave selection",
      "Line-up positioning and priority",
      "A written progression plan afterwards",
    ],
    imageUrl: photo("coaching-thumbs-up.jpg"),
    imageAlt: "A surfer riding a small wave while the coach gives two thumbs up from the water",
    featured: true,
    active: true,
    sortOrder: 3,
  },
  {
    title: "First Time in the Water",
    slug: "first-time",
    shortDescription:
      "Never surfed before. A calm, unhurried introduction with no expectation that you will look good doing it.",
    description:
      "For people who have never stood on a board, and who would rather not learn in a crowd of twelve.\n\nWe spend time on safety and on how the ocean behaves before anything else, then move to the whitewater. Most people stand up in the first session. The ones who do not usually stand up in the second, and that is completely normal.",
    level: "BEGINNER",
    format: "PRIVATE",
    durationMinutes: 90,
    price: 550,
    currency: "MAD",
    maxParticipants: 2,
    includes: [
      "Ninety minutes, unhurried",
      "Soft-top board and wetsuit included",
      "Ocean safety and etiquette",
      "No group, no audience",
    ],
    imageUrl: photo("coach-student-board.jpg"),
    imageAlt: "A coach and a surfer standing beside a purple soft-top board after a session",
    featured: false,
    active: true,
    sortOrder: 4,
  },
  {
    title: "Advanced Sessions",
    slug: "advanced-sessions",
    shortDescription:
      "Coaching as a peer. Line choice, positioning in a crowd, and the details that stop working when it gets bigger.",
    description:
      "For surfers who do not need instruction so much as another set of eyes. We agree the focus before we paddle out — it might be a specific turn, might be how you handle priority on a busy point, might be reading a shifting bank.\n\nI will tell you what I actually see, which is not always what you want to hear.",
    level: "ADVANCED",
    format: "PRIVATE",
    durationMinutes: 150,
    price: 1200,
    currency: "MAD",
    maxParticipants: 2,
    includes: [
      "Two and a half hours",
      "Agreed technical focus before the session",
      "Line-up strategy in a crowd",
      "Direct, specific feedback",
    ],
    imageUrl: photo("coach-surfing.jpg"),
    imageAlt: "A surfer in a teal wetsuit riding along the face of a wave",
    featured: false,
    active: true,
    sortOrder: 5,
  },
];

const GALLERY: {
  title: string;
  imageUrl: string;
  altText: string;
  category: "SURF" | "COACHING" | "IMSOUANE" | "OCEAN" | "LIFESTYLE";
  caption?: string;
}[] = [
  {
    title: "Out the back",
    imageUrl: photo("hero-lineup.jpg"),
    altText:
      "Two surfers in wetsuits sitting on their boards in calm water, smiling, with the harbour wall behind them",
    category: "SURF",
    caption: "Waiting between sets.",
  },
  {
    title: "On the sand",
    imageUrl: photo("coaching-briefing.jpg"),
    altText:
      "A coach in a wetsuit explaining a point to four surfers standing on the sand beside their boards",
    category: "COACHING",
    caption: "Most of the useful work happens before anyone gets wet.",
  },
  {
    title: "Finding the line",
    imageUrl: photo("coach-surfing.jpg"),
    altText:
      "A surfer in a teal wetsuit riding along the face of a wave, crouched with one hand trailing",
    category: "SURF",
  },
  {
    title: "That one counted",
    imageUrl: photo("coaching-thumbs-up.jpg"),
    altText:
      "A surfer riding a small wave while the coach stands in the water giving two thumbs up",
    category: "COACHING",
    caption: "Feedback while you can still feel the wave.",
  },
  {
    title: "Sharing a wave",
    imageUrl: photo("lesson-wave-group.jpg"),
    altText: "Several surfers riding the same wave together with a headland in the distance",
    category: "SURF",
  },
  {
    title: "Morning warm-up",
    imageUrl: photo("beach-warmup.jpg"),
    altText: "A group warming up on a wide, hazy beach with soft-top boards laid out on the sand",
    category: "LIFESTYLE",
  },
  {
    title: "Stance work",
    imageUrl: photo("coaching-popup.jpg"),
    altText:
      "A coach demonstrating the pop-up stance to a surfer standing on a longboard on the sand, cliffs behind",
    category: "COACHING",
  },
  {
    title: "Walking it out",
    imageUrl: photo("longboard-shoreline.jpg"),
    altText:
      "A surfer carrying an orange longboard along the shoreline as another walks out into the water",
    category: "LIFESTYLE",
  },
  {
    title: "Longboards",
    imageUrl: photo("longboard-lineup.jpg"),
    altText: "A group standing behind a row of pastel-coloured longboards upright on the sand",
    category: "LIFESTYLE",
  },
  {
    title: "Across the rocks",
    imageUrl: photo("longboards-rocks.jpg"),
    altText: "Two surfers carrying longboards across the rocks toward the water",
    category: "SURF",
  },
  {
    title: "Fishing boats",
    imageUrl: photo("imsouane-boats.jpg"),
    altText: "Blue wooden fishing boats pulled up above the shoreline with waves breaking beyond",
    category: "IMSOUANE",
    caption: "The working harbour, a few minutes from the point.",
  },
  {
    title: "After the session",
    imageUrl: photo("surfers-three.jpg"),
    altText:
      "Three surfers in wetsuits standing with their boards on the wet sand, making shaka signs",
    category: "LIFESTYLE",
  },
];

/** Multi-day packages, matching the "Our Packages" section of the design. */
const PACKAGES = [
  {
    title: "3 Days Package",
    slug: "3-days-package",
    days: 3,
    price: 110,
    currency: "EUR",
    features: [
      "3 surf sessions (2h daily coaching)",
      "Equipment included (Board & Wetsuit)",
      "Daily feedback & progression tracking",
      "1 free surf skate session",
    ],
    imageUrl: photo("coaching-stance.jpg"),
    featured: false,
    sortOrder: 0,
  },
  {
    title: "5 Days Package",
    slug: "5-days-package",
    days: 5,
    price: 180,
    currency: "EUR",
    features: [
      "5 surf sessions (2h daily coaching)",
      "Equipment included (Board & Wetsuit)",
      "Daily feedback & progression tracking",
      "2 free surf skate sessions",
    ],
    imageUrl: photo("longboard-lineup.jpg"),
    featured: true,
    sortOrder: 1,
  },
  {
    title: "Full Week (7 Days)",
    slug: "full-week-7-days",
    days: 7,
    price: 250,
    currency: "EUR",
    features: [
      "7 surf sessions (2h daily coaching)",
      "Equipment included (Board & Wetsuit)",
      "Daily feedback & progression tracking",
      "3 free surf skate sessions",
    ],
    imageUrl: photo("longboards-rocks.jpg"),
    featured: false,
    sortOrder: 2,
  },
];

/**
 * SAMPLE testimonials — seeded UNPUBLISHED on purpose.
 *
 * These exist so the admin UI is not empty in development. They are clearly
 * placeholder text, they never reach the public site, and the coach is expected
 * to delete them and enter real feedback.
 */
const SAMPLE_TESTIMONIALS = [
  {
    clientName: "Sample review — replace me",
    origin: "Example · Intermediate",
    quote:
      "This is placeholder text so you can see how a review looks in the admin and on the site. Delete it and add real feedback from someone you have actually coached. It is seeded unpublished, so it will never appear on the website.",
    rating: 5,
  },
  {
    clientName: "Sample review — replace me too",
    origin: "Example · First time",
    quote:
      "A second placeholder, so the reviews page layout can be checked with more than one entry. Replace both before launch.",
    rating: 5,
  },
];

async function main() {
  console.log("Seeding Swell Method Surf…");

  await seedAdmin();

  for (const offer of OFFERS) {
    await prisma.coachingOffer.upsert({
      where: { slug: offer.slug },
      create: offer,
      update: offer,
    });
  }
  console.log(`  coaching offers: ${OFFERS.length}`);

  // Gallery has no natural unique key, so only seed when empty — re-running
  // must not duplicate images.
  for (const pkg of PACKAGES) {
    await prisma.package.upsert({
      where: { slug: pkg.slug },
      create: pkg,
      update: pkg,
    });
  }
  console.log(`  packages: ${PACKAGES.length}`);

  const galleryCount = await prisma.galleryImage.count();
  if (galleryCount === 0) {
    await prisma.galleryImage.createMany({
      data: GALLERY.map((image, index) => ({
        ...image,
        caption: image.caption ?? null,
        featured: index < 4,
        published: true,
        sortOrder: index,
      })),
    });
    console.log(`  gallery images: ${GALLERY.length}`);
  } else {
    console.log(`  gallery images: skipped (${galleryCount} already present)`);
  }

  const testimonialCount = await prisma.testimonial.count();
  if (testimonialCount === 0) {
    await prisma.testimonial.createMany({
      data: SAMPLE_TESTIMONIALS.map((testimonial, index) => ({
        ...testimonial,
        published: false, // never auto-publish sample content
        featured: false,
        sortOrder: index,
      })),
    });
    console.log(`  testimonials: ${SAMPLE_TESTIMONIALS.length} (unpublished samples)`);
  } else {
    console.log(`  testimonials: skipped (${testimonialCount} already present)`);
  }

  for (const key of CONTENT_KEYS) {
    await prisma.contentSection.upsert({
      where: { key },
      create: { key, label: CONTENT_LABELS[key], data: CONTENT_DEFAULTS[key] as object },
      update: {}, // never overwrite copy the coach has edited
    });
  }
  console.log(`  content sections: ${CONTENT_KEYS.length}`);

  const settings: Record<string, string> = {
    businessName: "Swell Method Surf",
    email: "hello@swellmethodsurf.com",
    location: "Imsouane, Souss-Massa, Morocco",
    currency: "MAD",
    timezone: "Africa/Casablanca",
    seoTitle: "Swell Method Surf — Surf Coaching, Imsouane, Morocco",
    seoDescription:
      "Private, semi-private and small-group surf coaching in Imsouane, Morocco. Technique-led sessions on one of the country's longest right-hand waves.",
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: {},
    });
  }
  console.log(`  site settings: ${Object.keys(settings).length}`);

  // A single example booking so the dashboard and bookings list are not empty
  // in development. Clearly marked, and only created when there are none.
  const bookingCount = await prisma.booking.count();
  if (bookingCount === 0) {
    const client = await prisma.client.upsert({
      where: { email: "sample.booking@example.com" },
      create: {
        email: "sample.booking@example.com",
        name: "Sample booking — delete me",
        country: "France",
        experienceLevel: "INTERMEDIATE",
        notes: "Seeded example so the dashboard is not empty in development.",
      },
      update: {},
      select: { id: true },
    });

    const offer = await prisma.coachingOffer.findUnique({
      where: { slug: "intermediate-progression" },
      select: { id: true },
    });

    const inThreeWeeks = new Date();
    inThreeWeeks.setDate(inThreeWeeks.getDate() + 21);

    await prisma.booking.create({
      data: {
        reference: "SMS-SAMPLE",
        clientId: client.id,
        coachingOfferId: offer?.id ?? null,
        requestedFormat: "PRIVATE",
        experienceLevel: "INTERMEDIATE",
        preferredDate: new Date(
          Date.UTC(
            inThreeWeeks.getUTCFullYear(),
            inThreeWeeks.getUTCMonth(),
            inThreeWeeks.getUTCDate(),
          ),
        ),
        participants: 2,
        message: "Seeded example booking. Delete this once real requests start arriving.",
      },
    });
    console.log("  bookings: 1 sample");
  } else {
    console.log(`  bookings: skipped (${bookingCount} already present)`);
  }

  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
