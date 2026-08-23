import { Link } from 'react-router-dom';
import { plural } from '../../lib/format';

/** Winners, in the same words the honours board uses. */
function Names({ players }) {
  return players.map((player, i) => (
    <span key={player.id}>
      {i > 0 && ' & '}
      <Link to={`/players/${player.id}`}>{player.name}</Link>
    </span>
  ));
}

/**
 * A trophy's page is a year list, because a trophy held twice is the same
 * trophy twice — a "×2" tier would imply the second one is worth more than the
 * first. The roll underneath counts seasons, not versions of the badge.
 */
export default function TrophyYears({ badge, wins, roll }) {
  if (wins.length === 0) {
    return (
      <div className="empty sheet">
        {badge.voted ? 'Not voted on yet.' : 'Not awarded yet.'} {badge.line}
      </div>
    );
  }
  return (
    <>
      <div className="board">
        {wins.map((win) => (
          <div className="badge-line" key={win.season}>
            <span className="what"><strong>{win.season}</strong></span>
            <span className="count">
              <Names players={win.players} />
              {win.value != null && <span className="muted"> {win.value}</span>}
            </span>
          </div>
        ))}
      </div>

      {/* With one season on the board the year list already names everyone;
          the roll only starts saying something new once a trophy has been
          handed out twice. */}
      {wins.length > 1 && (
        <div className="sheet section">
          <h2 className="label ruled">Who has one</h2>
          <ul className="badge-names">
            {roll.map((row) => (
              <li key={row.player.id}>
                <Link to={`/players/${row.player.id}`}>{row.player.name}</Link>{' '}
                <span className="when">
                  {row.seasons.length > 1
                    ? `${plural(row.seasons.length, 'season', 'seasons')} · ${row.seasons.join(', ')}`
                    : row.seasons[0]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
