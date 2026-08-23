import { badgeByKey } from '../lib/awards';
import { recolour } from '../lib/badge-art';
import { metalRamp, token } from '../lib/tokens';

/**
 * A badge is an icon in a metal, and this is the only thing that draws one.
 *
 * The drawings are inlined rather than served as images because the metal is
 * paint: a tier recolours the fills, and an `<img>` has no fills to reach. Ten
 * files, none over 22 KB — the raster star that made this expensive was
 * redrawn as paths in Phase 15.
 */
const SOURCES = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/badges/*.svg', { query: '?raw', import: 'default', eager: true }),
  ).map(([path, source]) => [path.split('/').pop().replace(/\.svg$/, ''), source]),
);

/**
 * The three drawings that don't arrive gold, measured on the ground they ship
 * on: the playmaker figure is a black silhouette (0% of its ink clears 3:1 on
 * a board), the hat-trick footballs are black and white (63%), and the boot
 * stands on a plinth of five black fills that simply disappears (57%). One
 * pass through the gold ramp each and never again — the cup, the cap and the
 * star arrive gold and are left alone.
 */
const GILDED = new Set(['golden-boot', 'hat-trick', 'playmaker']);

/** An unearned badge is a silhouette, not a faded metal: present, named, and
 *  visibly not yours. A ground's soft ink is the one tone that reads as absence
 *  and still clears 3:1 — a dimmed metal clears nothing. */
const UNHELD = { paper: '--ink-soft', board: '--on-board-soft' };

/** Nothing renders below this. A trophy is a plinth plus an object and merges
 *  into a blob under 20px; the rest hold at 16. DESIGN.md → The icons. */
const FLOOR = { career: 16, event: 16, trophy: 20 };

const cache = new Map();

/**
 * The drawing in a metal, recoloured once per metal and ground and kept.
 * Only Class 1 reads the four ramps: a trophy is one trophy, so the six that
 * don't tier are gold whoever holds them and four of those six are gold in the
 * file already.
 */
function art(family, metal, ground) {
  const id = `${family.key}|${metal ?? 'unheld'}|${ground}`;
  const had = cache.get(id);
  if (had) return had;
  const source = SOURCES[family.key];
  if (!source) return '';
  const ramp = metal
    ? metalRamp(family.class === 'career' ? metal : 'gold')
    : Array(4).fill(token(UNHELD[ground]));
  // Called before the stylesheet has applied, tokens read as empty; draw the
  // artwork as supplied rather than caching a badge with no colour in it.
  if (ramp.some((stop) => !stop)) return source;
  const paint = !metal || family.class === 'career' || GILDED.has(family.key);
  const drawn = paint ? recolour(source, ramp, ground) : source;
  cache.set(id, drawn);
  return drawn;
}

/**
 * `metal` null is a badge its holder hasn't got. `on` is the ground the page
 * puts it on, which decides both the band of the ramp and whether it needs a
 * medallion: a light metal on a light page is 11% of its own ink above 3:1
 * whatever the band does, because a cup is mostly highlight. The dark disc is
 * the fix, and it makes a badge read as an actual medal.
 */
export default function BadgeIcon({ badge, metal = null, on = 'paper', size = 40 }) {
  const family = badgeByKey(badge);
  if (!family) return null;
  const px = Math.max(size, FLOOR[family.class]);
  const medal = on === 'paper' && metal !== null && (family.class !== 'career' || metal !== 'bronze');
  const ground = medal || on === 'board' ? 'board' : 'paper';
  return (
    <span
      className={`badge-icon${medal ? ' medal' : ''}${metal ? ` ${metal}` : ' unheld'}`}
      style={{ '--badge-size': `${px}px` }}
      /* The floor rides on the element so check:layout can measure what was
         actually drawn rather than trusting the clamp above it. */
      data-badge={family.key}
      data-floor={FLOOR[family.class]}
      /* The drawings are committed assets, not content: nothing user-entered
         reaches this, and inlining is what makes the fills recolourable. */
      dangerouslySetInnerHTML={{ __html: art(family, metal, ground) }}
    />
  );
}
