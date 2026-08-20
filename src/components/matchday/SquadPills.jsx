import { Link } from 'react-router-dom';

/**
 * Everyone who played, each name its own link to their page. Goals, assists,
 * a first appearance and cards ride on the pill, so the team sheet doubles as
 * the match's stat line without a table.
 */
export default function SquadPills({ squad, debutIds, dropoutNames }) {
  if (squad.length === 0) return null;
  return (
    <div className="section sheet">
      <h2>The squad</h2>
      <div className="squad-pills">
        {squad.map((a) => (
          <Link
            key={a.id}
            to={`/players/${a.player.id}`}
            className={`squad-pill${a.motm ? ' motm' : a.goals > 0 ? ' scored' : ''}`}
          >
            {a.player.name}
            {(a.goals > 0 || a.assists > 0) && (
              <em>
                {a.goals > 0 && `${a.goals}G`}
                {a.goals > 0 && a.assists > 0 && ' '}
                {a.assists > 0 && `${a.assists}A`}
              </em>
            )}
            {debutIds.has(a.player_id) && <em>1st</em>}
            {a.yellows > 0 && <em className="card-mark">YC</em>}
            {a.reds > 0 && <em className="card-mark">RC</em>}
          </Link>
        ))}
      </div>
      {dropoutNames.length > 0 && (
        <p className="muted" style={{ marginTop: '0.7rem' }}>
          Late dropouts (within 24h): {dropoutNames.join(', ')}
        </p>
      )}
    </div>
  );
}
