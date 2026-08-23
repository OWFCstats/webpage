// Recolouring a drawing into a metal.
//
// The club's badges are drawings, not glyphs: a shirt, a glove, a cup. A tier
// is a metal, and a metal is a four-stop ramp (DESIGN.md → Metals), so a
// bronze shirt is the shirt's own tones mapped onto a slice of the bronze
// ramp. Reading the drawing rather than hand-tinting it keeps the
// relationships the artwork already has — a glove's palm stays lighter than
// its back — and means a redrawn icon recolours without anyone picking hexes.
//
// Two rules come out of measuring the committed files, and both were shipped
// wrong once (DESIGN.md → The icons):
//
//   * The band depends on the ground. Mapping onto the whole ramp bleaches the
//     large light shapes — the shirt is 89% gold fill, and stretched to the top
//     of a ramp it is a pale shape on pale paper. So a drawing on the ground
//     takes the ramp's dark half and one on a board takes its light half.
//   * A ramp cannot recolour a silhouette. The target, the football and the
//     playmaker figure span under 0.04 in luminance: there is no range in them
//     to map, so they take one stop flat instead of having a range invented.
//
// No colour is written down here. The ramps arrive from the caller, which
// reads them out of tokens.css — same reason lib/tokens.js exists.

/** Below this much luminance range, a drawing is a silhouette. */
export const FLAT_SPAN = 0.04;

/**
 * Where on the ramp a drawing sits, as positions in 0–1 across the four stops.
 * The ground's own name, because that is the decision: paper takes stops 1–2,
 * a board (or the medallion standing in for one) takes stops 3–4.
 */
export const BANDS = {
  paper: [0, 1 / 3],
  board: [2 / 3, 1],
};

const HEX = /^#([0-9a-f]{6})$/i;

/** sRGB channels 0–255 from #rrggbb. Null for anything else — `none`, a
 *  gradient reference, a keyword — which is left alone rather than guessed at. */
export function rgb(hex) {
  const match = HEX.exec(hex.trim());
  if (!match) return null;
  const n = parseInt(match[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const channel = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

/** WCAG relative luminance, the same figure check:layout scores contrast on. */
export function luminance(hex) {
  const parts = rgb(hex);
  if (!parts) return null;
  const [r, g, b] = parts.map((v) => channel(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const hex = ([r, g, b]) =>
  `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

/**
 * The colour at position `p` (0–1) along a four-stop ramp, interpolated in
 * sRGB. The stops are picked to read as metal in sequence, so mixing between
 * two neighbours stays on the metal; mixing 1 into 4 would not.
 */
export function rampColour(ramp, p) {
  const at = Math.min(1, Math.max(0, p)) * (ramp.length - 1);
  const i = Math.min(ramp.length - 2, Math.floor(at));
  const t = at - i;
  const from = rgb(ramp[i]);
  const to = rgb(ramp[i + 1]);
  return hex(from.map((v, k) => v + (to[k] - v) * t));
}

/** Every fill colour in the drawing. The fills are the drawing: the only
 *  strokes in this artwork are sub-pixel hairlines, and letting one set the
 *  span is how the football would read as a full-range image. */
export function fillsOf(source) {
  return [...source.matchAll(/fill="(#[0-9a-fA-F]{6})"/g)].map((m) => m[1].toLowerCase());
}

/**
 * A drawing's own tonal range, as {min, max, span} over its fills, plus
 * whether that range is wide enough for a ramp to say anything. Exported
 * because it is the measurement the rule is stated in, and a test that asserts
 * "the football is flat" should read the same number the pipeline does.
 */
export function toneRange(source) {
  const tones = [...new Set(fillsOf(source))].map(luminance).filter((l) => l != null);
  if (tones.length === 0) return { min: 0, max: 0, span: 0, flat: true };
  const min = Math.min(...tones);
  const max = Math.max(...tones);
  return { min, max, span: max - min, flat: max - min < FLAT_SPAN };
}

/**
 * The drawing in a metal. `ramp` is the metal's four stops, darkest first;
 * `ground` is what it will sit on, which picks the band.
 *
 * A flat drawing takes the band's inner stop — the one nearer the middle of
 * the ramp, which is the stop that reads as the metal rather than as its
 * shadow or its highlight.
 */
export function recolour(source, ramp, ground = 'paper') {
  const [lo, hi] = BANDS[ground] ?? BANDS.paper;
  const { min, span, flat } = toneRange(source);
  const flatStop = ground === 'board' ? lo : hi;
  const position = (colour) => {
    if (flat) return flatStop;
    const l = luminance(colour);
    if (l == null) return flatStop;
    return lo + Math.min(1, Math.max(0, (l - min) / span)) * (hi - lo);
  };
  return source.replace(
    /(fill|stroke)="(#[0-9a-fA-F]{6})"/g,
    (_, attr, colour) => `${attr}="${rampColour(ramp, position(colour))}"`,
  );
}
