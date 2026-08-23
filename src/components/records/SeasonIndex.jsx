import { Link } from 'react-router-dom';
import { Award } from './HonoursBoard';

/** An index, not a season view: one line each, and a link across to Season
 *  with that season already selected for anyone who wants the detail. */
export default function SeasonIndex({ seasons }) {
  if (seasons.length === 0) {
    return <div className="empty sheet">No season on record yet.</div>;
  }
  return (
    <div className="sheet">
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Season</th>
              <th>Competition</th>
              <th className="num">P</th>
              <th className="num">W</th>
              <th className="num">D</th>
              <th className="num">L</th>
              <th className="num">GF</th>
              <th className="num">GA</th>
              <th>Position</th>
              <th>Top scorer</th>
            </tr>
          </thead>
          <tbody>
            {seasons.map((s) => {
              const boot = s.awards.find((a) => a.key === 'golden-boot');
              return (
                <tr key={s.season}>
                  <td>
                    <Link to={`/season?season=${encodeURIComponent(s.season)}`}>{s.season}</Link>
                  </td>
                  <td>
                    {s.competitions.length === 0
                      ? <span className="muted">—</span>
                      : s.competitions.map((c, i) => (
                          <span key={c}>{i > 0 && ' '}<span className="tag">{c}</span></span>
                        ))}
                  </td>
                  <td className="num">{s.summary.played}</td>
                  <td className="num">{s.summary.won}</td>
                  <td className="num">{s.summary.drawn}</td>
                  <td className="num">{s.summary.lost}</td>
                  <td className="num">{s.summary.goalsFor}</td>
                  <td className="num">{s.summary.goalsAgainst}</td>
                  <td><span className="muted">Not recorded</span></td>
                  <td><Award award={boot} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="muted card-foot">
        Final positions stay blank until standings are connected — where a season
        finished needs the other clubs' results, not just ours.
      </p>
    </div>
  );
}
