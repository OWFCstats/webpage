import BadgeIcon from '../BadgeIcon';
import { initials } from '../../lib/format';

/** What a badge draws at in the hero band. 34px rather than the shelf's 40: the
 *  band already carries a 62px crest, a headline and five figures, and the row
 *  here is a glance at what somebody has rather than the section that names each
 *  one. At the 24px it was, a crest's frame and the thing inside it were one
 *  blob — which is the whole reason the club redrew these. */
const SIZE = 34;

/**
 * All-time totals across the top, in the same dark band the Match Centre uses,
 * with what they have won under the name. Held badges only: a row of empty
 * trophies over a debutant's stats is a list of things they haven't done, and
 * the shelf below the hero is where the unearned ones are named and chased.
 */
export default function PlayerHero({ player, career, seasonsActive, badges }) {
  const metals = badges.career.filter((b) => b.metal);
  const events = badges.events.filter((b) => b.count > 0);
  const trophies = badges.trophies.filter((b) => b.seasons.length > 0);
  const span = seasonsActive.length
    ? `${seasonsActive[0]}${seasonsActive.length > 1 ? ` – ${seasonsActive[seasonsActive.length - 1]}` : ''}`
    : 'No appearances yet';
  return (
    <div className="board player-hero">
      <span className="crest">{initials(player.name)}</span>
      <div className="who">
        <h1>{player.name}</h1>
        <div className="sub">
          {player.position && <span className="tag dark">{player.position}</span>}
          {player.status === 'inactive' && <span className="tag dark">inactive</span>}
          <span>
            {seasonsActive.length > 0 && `${seasonsActive.length} season${seasonsActive.length > 1 ? 's' : ''} · `}
            {span}
          </span>
        </div>
        {metals.length + events.length + trophies.length > 0 && (
          /* One label for the row rather than one per drawing, the same trade
             the squad tile makes: the badges are the content here, and a screen
             reader wants to be told there is a shelf and what is on it. */
          <div
            className="badge-row hero-badges"
            role="img"
            aria-label={`Badges: ${[
              ...metals.map((b) => `${b.label} ${b.metal}`),
              ...events.map((b) => `${b.label} ×${b.count}`),
              ...trophies.map((b) => `${b.label} ${b.seasons.join(', ')}`),
            ].join(', ')}`}
          >
            {metals.map((badge) => (
              <BadgeIcon key={badge.key} badge={badge.key} metal={badge.metal} size={SIZE} />
            ))}
            {events.map((badge) => (
              <span key={badge.key} className="badge-stack">
                <BadgeIcon badge={badge.key} metal="gold" size={SIZE} />
                <span className="times">×{badge.count}</span>
              </span>
            ))}
            {trophies.map((badge) => (
              <BadgeIcon key={badge.key} badge={badge.key} metal="gold" size={SIZE} />
            ))}
          </div>
        )}
      </div>
      <div className="career-line">
        <div><span className="v">{career.appearances}</span><span className="label">Apps</span></div>
        <div><span className="v">{career.goals}</span><span className="label">Goals</span></div>
        <div><span className="v">{career.assists}</span><span className="label">Assists</span></div>
        <div><span className="v">{career.cleanSheets}</span><span className="label">Clean sheets</span></div>
        <div><span className="v">{career.motm}</span><span className="label">MOTM</span></div>
      </div>
    </div>
  );
}
