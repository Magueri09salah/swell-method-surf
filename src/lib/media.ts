/**
 * Single source of truth for every photograph on the site.
 *
 * These are the coach's OWN photographs, supplied for the build and installed
 * to `public/photography/`. Alt text describes what is genuinely in each frame —
 * nothing is invented, and no claim is made about conditions, locations or
 * people beyond what is visible.
 *
 * Intrinsic `width`/`height` are the real file dimensions, so `next/image` can
 * reserve the correct box and avoid layout shift.
 *
 * To swap a photograph: drop the new file into `public/photography/` and change
 * the `src` and `alt` here. No component needs to change.
 */

export type MediaAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export const MEDIA = {
  /** Hero — two surfers sitting out the back, smiling at the camera. */
  heroPrimary: {
    src: "/photography/hero-lineup.jpg",
    alt: "Two surfers in wetsuits sitting on their boards in calm water, smiling, with the harbour wall behind them",
    width: 1600,
    height: 1066,
  },
  /** The coach mid-turn. Portrait, used wherever a tall frame is needed. */
  coachSurfing: {
    src: "/photography/coach-surfing.jpg",
    alt: "A surfer in a teal wetsuit riding along the face of a wave, crouched with one hand trailing",
    width: 1038,
    height: 1600,
  },
  coachingBriefing: {
    src: "/photography/coaching-briefing.jpg",
    alt: "A coach in a wetsuit explaining a point to four surfers standing on the sand beside their boards",
    width: 1600,
    height: 1066,
  },
  coachingPopUp: {
    src: "/photography/coaching-popup.jpg",
    alt: "A coach demonstrating the pop-up stance to a surfer standing on a longboard on the sand, cliffs behind",
    width: 1280,
    height: 1600,
  },
  coachingStance: {
    src: "/photography/coaching-stance.jpg",
    alt: "A coach watching a surfer practise her stance on a board on the sand below the cliffs",
    width: 1600,
    height: 900,
  },
  coachingThumbsUp: {
    src: "/photography/coaching-thumbs-up.jpg",
    alt: "A surfer riding a small wave while the coach stands in the water giving two thumbs up",
    width: 1600,
    height: 1066,
  },
  lessonWaveGroup: {
    src: "/photography/lesson-wave-group.jpg",
    alt: "Several surfers riding the same wave together with a headland in the distance",
    width: 1600,
    height: 1066,
  },
  lessonTwoRiding: {
    src: "/photography/lesson-two-riding.jpg",
    alt: "Two surfers riding a long, clean wave side by side on a grey morning",
    width: 1280,
    height: 853,
  },
  coachStudentBoard: {
    src: "/photography/coach-student-board.jpg",
    alt: "A coach and a surfer standing beside a purple soft-top board after a session",
    width: 1200,
    height: 1600,
  },
  beachWarmUp: {
    src: "/photography/beach-warmup.jpg",
    alt: "A group warming up on a wide, hazy beach with soft-top boards laid out on the sand",
    width: 720,
    height: 1280,
  },
  longboardShoreline: {
    src: "/photography/longboard-shoreline.jpg",
    alt: "A surfer carrying an orange longboard along the shoreline as another walks out into the water",
    width: 851,
    height: 1280,
  },
  longboardsRocks: {
    src: "/photography/longboards-rocks.jpg",
    alt: "Two surfers carrying longboards across the rocks toward the water",
    width: 1284,
    height: 1520,
  },
  longboardLineUp: {
    src: "/photography/longboard-lineup.jpg",
    alt: "A group standing behind a row of pastel-coloured longboards upright on the sand",
    width: 1000,
    height: 750,
  },
  surfersThree: {
    src: "/photography/surfers-three.jpg",
    alt: "Three surfers in wetsuits standing with their boards on the wet sand, making shaka signs",
    width: 750,
    height: 1128,
  },
  groupSession: {
    src: "/photography/group-session.jpg",
    alt: "The coach with a group of young surfers in wetsuits gathered together after a session in the village",
    width: 745,
    height: 1280,
  },
  imsouaneBoats: {
    src: "/photography/imsouane-boats.jpg",
    alt: "Blue wooden fishing boats pulled up above the shoreline with waves breaking beyond",
    width: 798,
    height: 1280,
  },
} as const satisfies Record<string, MediaAsset>;

export type MediaKey = keyof typeof MEDIA;

export function media(key: MediaKey): MediaAsset {
  return MEDIA[key];
}
