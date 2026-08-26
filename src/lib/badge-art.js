// Which drawing a badge is, at the tier it is held in.
//
// This used to be a recolouring pipeline: one drawing per badge, read for its
// own tonal range and mapped onto a slice of a metal ramp, with a medallion
// behind the light metals so a gold cup had a ground to read against. All of
// that is gone. The club drew all twenty-two badges — four tiers of each career
// badge, plus the six that don't tier — and each one arrives in the colour it
// is meant to be, on a frame that carries its own contrast on paper and on a
// board alike. There is nothing left to compute, so what's left is a lookup.
//
// The four ramps stay in tokens.css: `badge.css` still draws the tier beads on
// the Records board from them, and a bead is a swatch of a metal rather than a
// recolour of a drawing.

import { CAREER_BADGES, METALS, BADGES } from './awards';

/** The badge keys whose drawing changes with the tier — Class 1, and only
 *  Class 1. A trophy is a trophy whoever holds it and a hat-trick is a
 *  hat-trick; DESIGN.md → *Badges and awards* is the argument. Not exported:
 *  `artKey` is the answer to every question a caller has about it. */
const TIERED = new Set(CAREER_BADGES.map((b) => b.key));

/**
 * The tier a career badge wears when nobody holds it. Bronze, because bronze
 * is one — one appearance, one goal, one assist — so the greyed placeholder is
 * the rung the reader is actually next in line for rather than a prize three
 * rungs away.
 */
export const PLACEHOLDER_METAL = 'bronze';

/**
 * The drawing's own slug for a badge at a metal, which is also its filename in
 * `src/assets/badges`. A tiered badge with no metal takes the placeholder's
 * drawing — the greying is the page's job, not the file's.
 */
export function artKey(badgeKey, metal = null) {
  if (!TIERED.has(badgeKey)) return badgeKey;
  return `${badgeKey}-${METALS.includes(metal) ? metal : PLACEHOLDER_METAL}`;
}

/**
 * Every drawing the system expects, in the badge board's order. The ingest
 * script checks a drop against this and a test checks the directory against it,
 * so a missing tier fails somewhere other than on the page.
 */
export const BADGE_ART = BADGES.flatMap((badge) =>
  TIERED.has(badge.key) ? METALS.map((metal) => `${badge.key}-${metal}`) : [badge.key],
);
