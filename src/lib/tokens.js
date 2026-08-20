/**
 * Reading tokens.css from JavaScript.
 *
 * Recharts and the hand-rolled sparklines write their colours into SVG
 * attributes (`stroke`, `fill`), and an SVG attribute is not a CSS property —
 * `var(--series-1)` is simply invalid there. So the few colours the charts
 * need are read back out of the stylesheet at runtime instead of being written
 * down a second time in JS. tokens.css stays the only place a colour lives.
 */

const resolved = new Map();

/** The computed value of a custom property on :root, e.g. token('--gold'). */
export function token(name) {
  const cached = resolved.get(name);
  if (cached) return cached;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  // Only cache a real answer: called before the stylesheet has applied, this
  // returns '' and we want the next call to try again rather than keep it.
  if (value) resolved.set(name, value);
  return value;
}

/**
 * A step of the type scale in px, for the SVG text Recharts sizes numerically.
 * Same reason as the colours: a number is the only thing it will take, so the
 * number comes from the scale rather than being picked per chart.
 */
export function fontPx(name) {
  const value = token(name);
  if (!value) return null;
  if (!value.endsWith('rem')) return parseFloat(value);
  const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return parseFloat(value) * root;
}

/** The chart series, in the fixed order tokens.css declares them. */
export const SERIES = ['--series-1', '--series-2', '--series-3', '--series-4', '--series-5'];

/** Series colour for slot `i`, assigned in sequence. */
export function series(i) {
  return token(SERIES[i % SERIES.length]);
}

/**
 * One colour per stat, so goals wear the same brass on a leaderboard bar, a
 * sparkline and a chart line. Four separate copies of this mapping used to
 * live in the pages that render them.
 */
const STAT_SLOT = {
  goals: '--series-1',
  motm: '--series-1',
  assists: '--series-2',
  cleanSheets: '--series-2',
  goalInvolvements: '--series-3',
  goalsPerGame: '--series-3',
  appearances: '--series-4',
  starts: '--series-4',
};

/** The token *name* a stat wears — for CSS values, where var() works. */
export function statToken(statKey) {
  return STAT_SLOT[statKey] ?? '--gold';
}

/** The resolved colour a stat wears — for SVG attributes, where it doesn't. */
export function statColour(statKey) {
  return token(statToken(statKey));
}
