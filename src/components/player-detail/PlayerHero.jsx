import BadgeIcon from '../BadgeIcon';
import { initials } from '../../lib/format';

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
          <div className="badge-row hero-badges">
            {metals.map((badge) => (
              <BadgeIcon key={badge.key} badge={badge.key} metal={badge.metal} on="board" size={24} />
            ))}
            {events.map((badge) => (
              <span key={badge.key} className="badge-stack">
                <BadgeIcon badge={badge.key} metal="gold" on="board" size={24} />
                <span className="times">×{badge.count}</span>
              </span>
            ))}
            {trophies.map((badge) => (
              <BadgeIcon key={badge.key} badge={badge.key} metal="gold" on="board" size={24} />
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
