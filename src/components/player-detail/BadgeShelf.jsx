import { Link } from 'react-router-dom';
import BadgeIcon from '../BadgeIcon';

/** The size every badge on this shelf draws at, and the width of the column it
 *  draws in — `badge.css` reads the same number as `--shelf-icon`, which is what
 *  keeps a label starting in the same place whether the row above it holds a
 *  crest, a diamond or three footballs. 40px because the shelf is the section
 *  that argues for the badges and there is room for it: the drawings carry a
 *  frame, a field and a highlight now, and at 24 none of that was visible. */
const SIZE = 40;

/** A stackable and a repeated trophy both carry a count rather than a bigger
 *  badge — two Golden Boots is the same trophy twice, and a tier would imply the
 *  second one is worth more than the first. A trophy won once names its season
 *  instead, which is the better fact while there is only one of them; a year
 *  list grows without limit and this club intends to be here in ten years.
 *
 *  `label` is the whole stack's accessible name and its tooltip, so it can carry
 *  every season a repeat was won in: the mark has 40px of column to print in and
 *  the label has no width at all. It replaces the drawing's own `alt` rather
 *  than sitting beside it, which is what keeps a two-badge row from being read
 *  as four things. */
function Held({ badge, mark, label }) {
  return (
    <Link
      className="badge-stack"
      to={`/records/badges/${badge.key}`}
      aria-label={label}
      title={label}
    >
      <BadgeIcon badge={badge.key} metal="gold" size={SIZE} alt="" />
      <span className="times">{mark}</span>
    </Link>
  );
}

/**
 * One player's shelf. The four career badges are always all four, held or not:
 * an unearned badge is the bronze drawing drained of its colour, with what's
 * left to go beside it, because a badge you can't see is not an incentive —
 * that is the whole reason the ladder this replaced was rebuilt.
 *
 * Events and honours only appear once they exist. A row of empty trophies
 * under a debutant's name is a list of things they haven't done.
 */
export default function BadgeShelf({ badges }) {
  const events = badges.events.filter((b) => b.count > 0);
  const trophies = badges.trophies.filter((b) => b.seasons.length > 0);
  return (
    <div className="sheet">
      <div className="badge-shelf">
        {badges.career.map((badge) => (
          <Link key={badge.key} className="badge-held" to={`/records/badges/${badge.key}`}>
            <BadgeIcon badge={badge.key} metal={badge.metal} size={SIZE} />
            <span className="what">
              <strong>{badge.label}</strong>{' '}
              <span className="metal">
                {badge.metal ? `${badge.metal}${badge.since ? ` · ${badge.since}` : ''}` : 'not yet'}
              </span>
            </span>
            <span className="to-go">
              {badge.next ? `${badge.next.need} to ${badge.next.metal}` : 'top tier'}
            </span>
          </Link>
        ))}
      </div>

      {events.length + trophies.length > 0 && (
        <div className="badge-row section">
          {events.map((badge) => (
            <Held
              key={badge.key}
              badge={badge}
              mark={`×${badge.count}`}
              label={`${badge.label} ×${badge.count}`}
            />
          ))}
          {trophies.map((badge) => (
            <Held
              key={badge.key}
              badge={badge}
              mark={badge.seasons.length === 1 ? badge.seasons[0] : `×${badge.seasons.length}`}
              label={`${badge.label} — ${badge.seasons.join(', ')}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
