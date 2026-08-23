import { StatTile } from '../bits';

/** League points from a W-D-L summary. */
function pointsOf(summary) {
  return summary.won * 3 + summary.drawn;
}

/** The season in four figures, then split home and away — the split is where a
 *  season that looks average usually turns out to be two different seasons. */
export default function SeasonSummary({ summary, homeAway }) {
  const gd = summary.goalsFor - summary.goalsAgainst;
  return (
    <div className="flat-block">
      <div className="block board">Season at a glance</div>
      <div className="grid cols-4">
        <StatTile plain value={summary.played} label="Played" />
        <StatTile plain value={`${summary.won}-${summary.drawn}-${summary.lost}`} label="W-D-L" />
        <StatTile plain value={gd > 0 ? `+${gd}` : gd} label="Goal difference" />
        <StatTile
          plain
          value={summary.played ? `${Math.round((summary.won / summary.played) * 100)}%` : '—'}
          label="Win rate"
        />
      </div>
      <div className="table-wrap section">
        <table className="data">
          <thead>
            <tr>
              <th></th>
              <th className="num">P</th>
              <th className="num">W</th>
              <th className="num">D</th>
              <th className="num">L</th>
              <th className="num">Pts</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Home</strong></td>
              <td className="num">{homeAway.home.played}</td>
              <td className="num">{homeAway.home.won}</td>
              <td className="num">{homeAway.home.drawn}</td>
              <td className="num">{homeAway.home.lost}</td>
              <td className="num">{pointsOf(homeAway.home)}</td>
            </tr>
            <tr>
              <td><strong>Away</strong></td>
              <td className="num">{homeAway.away.played}</td>
              <td className="num">{homeAway.away.won}</td>
              <td className="num">{homeAway.away.drawn}</td>
              <td className="num">{homeAway.away.lost}</td>
              <td className="num">{pointsOf(homeAway.away)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
