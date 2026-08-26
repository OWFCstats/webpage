import { badgeByKey } from '../lib/awards';
import { artKey } from '../lib/badge-art';

/**
 * A badge is a drawing, and this is the only thing that draws one.
 *
 * It used to be a drawing *in a metal*: ten files, recoloured per tier through
 * a four-stop ramp, with a dark medallion behind the light metals so a gold cup
 * had a ground to read against. The club has since drawn all twenty-two — four
 * tiers of each career badge and the six that don't tier — and every one
 * arrives in its own colour on a frame that carries its contrast on paper and
 * on a board alike. So the ramp, the bands, the medallion and the `on` prop are
 * gone, and what's left is picking a file.
 *
 * `<img>`, not inline SVG. Inlining was never a preference — it was what made
 * the fills reachable, and nothing reaches for them now. The drawings are 807 KB
 * across twenty-two files: as markup that is 807 KB of JavaScript bundle every
 * visitor downloads before the first paint, and up to 520 path nodes per badge
 * on a squad page that draws a hundred of them. As images they are cached
 * requests the browser dedupes by URL and never parses twice.
 */
const SOURCES = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/badges/*.svg', { query: '?url', import: 'default', eager: true }),
  ).map(([path, url]) => [path.split('/').pop().replace(/\.svg$/, ''), url]),
);

/**
 * Nothing renders below this, and all three moved up with the new art: the old
 * drawings were flat shapes that held at 16px, these are framed crests with a
 * rim, an inner field and a highlight, and below their floor the frame closes
 * over the thing inside it. A trophy is still the deepest — a plinth plus an
 * object needs 24 to stay two objects. DESIGN.md → The icons.
 */
const FLOOR = { career: 20, event: 20, trophy: 24 };

/**
 * `metal` is the tier a career badge is held in, and null means unheld — of a
 * career badge or of any other: an unwon trophy and an unearned crest are the
 * same state and get the same treatment. A tiered badge with no metal borrows
 * bronze's drawing, the rung the reader is next in line for. Either way the
 * drawing is drained rather than replaced by a silhouette, because these have a
 * shape worth recognising before you own one.
 *
 * `size` is the *box*, not the drawing. The badges are not square and not one
 * shape — a crest is 0.9 wide for its height, a diamond 1.17, the hat-trick's
 * three footballs 1.57 — so each is contained in a square slot and centred in
 * it. That is what keeps a column of them aligned and a label starting at the
 * same place down a shelf, which a row of drawings sized to their own widths
 * never did.
 */
export default function BadgeIcon({ badge, metal = null, size = 40, alt = '' }) {
  const family = badgeByKey(badge);
  if (!family) return null;
  const px = Math.max(size, FLOOR[family.class]);
  const src = SOURCES[artKey(family.key, metal)];
  if (!src) return null;
  const unheld = metal === null;
  return (
    <span
      className={`badge-icon${unheld ? ' unheld' : ''}`}
      style={{ '--badge-size': `${px}px` }}
      /* The floor rides on the element so check:layout can measure what was
         actually drawn rather than trusting the clamp above it. */
      data-badge={family.key}
      data-floor={FLOOR[family.class]}
    >
      <img src={src} alt={alt} width={px} height={px} loading="lazy" decoding="async" />
    </span>
  );
}
