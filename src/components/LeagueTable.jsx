import { Link } from 'react-router-dom';

/**
 * League table widget.
 *
 * Deliberately unwired. Every other stat on this site is derived from the
 * club's own three tables, but a league table needs *other* clubs' results —
 * a data source that doesn't exist yet (a `league_rows` table, a scrape, or a
 * hand-maintained standings entry screen; that call hasn't been made).
 *
 * So the whole widget is finished apart from where the numbers come from: pass
 * `rows` and it renders the real table, pass nothing and it renders the
 * placeholder below. Wiring it up later is a data job, not a build job — no
 * markup or styling work is waiting on that decision.
 *
 * Expected row shape (goal difference is derived here, never stored):
 *
 *   {
 *     position: 3,
 *     club: 'Old Wellingtonians FC',
 *     played: 18, won: 11, drawn: 4, lost: 3,
 *     goalsFor: 34, goalsAgainst: 15,
 *     points: 37,
 *     isUs: true,                     // optional — highlights our own row
 *     form: ['W', 'W', 'D', 'L', 'W'] // optional — oldest first, max 5 shown
 *   }
 *
 * Rows are rendered in the order given; sort before passing them in. When one
 * row carries isUs, only that row and the two clubs either side of it are
 * shown — on a phone "where are we" matters more than the top of a 16-team
 * division.
 */
export default function LeagueTable({ rows = [], season }) {
  const shown = aroundUs(rows);
  return (
    <section className="card home-widget home-table">
      <div className="home-widget-head">
        <div>
          <span className="home-eyebrow">Standings</span>
          <h2>League table</h2>
        </div>
        <div className="home-widget-head-right">
          {season && <span className="home-widget-note">{season}</span>}
          <Link className="more" to="/season">Full standings →</Link>
        </div>
      </div>

      {shown.length === 0 ? (
        <LeagueTablePlaceholder />
      ) : (
        <div className="table-wrap">
          <table className="data league-table">
            <thead>
              <tr>
                <th className="lt-pos">#</th>
                <th>Club</th>
                <th className="num lt-hide-narrow">P</th>
                <th className="num">W</th>
                <th className="num lt-hide-narrow">D</th>
                <th className="num">L</th>
                <th className="num">GD</th>
                <th className="num">Pts</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => {
                const gd = r.goalsFor - r.goalsAgainst;
                return (
                  <tr key={r.club} className={r.isUs ? 'lt-us' : undefined}>
                    <td className="lt-pos">{r.position}</td>
                    <td className="lt-club">
                      {r.club}
                      {r.form?.length > 0 && (
                        <span className="lt-form">
                          {r.form.slice(-5).map((result, i) => (
                            <i
                              key={`${result}-${i}`}
                              className={`lt-dot ${result}`}
                              title={result}
                            />
                          ))}
                        </span>
                      )}
                    </td>
                    <td className="num lt-hide-narrow">{r.played}</td>
                    <td className="num">{r.won}</td>
                    <td className="num lt-hide-narrow">{r.drawn}</td>
                    <td className="num">{r.lost}</td>
                    <td className="num lt-gd">{gd > 0 ? `+${gd}` : gd}</td>
                    <td className="num lt-pts">{r.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/** The isUs row plus up to two neighbours either side. Falls back to the rows
 *  as given when none is marked isUs. */
function aroundUs(rows) {
  const idx = rows.findIndex((r) => r.isUs);
  if (idx === -1) return rows;
  return rows.slice(Math.max(0, idx - 2), idx + 3);
}

/** Shown until a standings data source exists. Says what's missing and why,
 *  in one line rather than a mocked-up table for data that isn't there. */
function LeagueTablePlaceholder() {
  return (
    <p className="muted lt-placeholder">
      Standings aren’t connected yet — a league table needs the other clubs’ results, not just ours.
    </p>
  );
}
