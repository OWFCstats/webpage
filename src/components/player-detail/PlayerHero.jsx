import { initials } from '../../lib/format';

/** All-time totals across the top, in the same dark band the Match Centre uses. */
export default function PlayerHero({ player, career, seasonsActive }) {
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
