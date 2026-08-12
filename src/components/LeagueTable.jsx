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
 * Rows are rendered in the order given; sort before passing them in.
 */
export default function LeagueTable({ rows = [], season }) {
  return (
    <section className="card home-widget home-table">
      <div className="home-widget-head">
        <div>
          <span className="home-eyebrow">Standings</span>
          <h2>League table</h2>
        </div>
        {season && <span className="muted home-widget-note">{season}</span>}
      </div>

      {rows.length === 0 ? (
        <LeagueTablePlaceholder />
      ) : (
        <div className="table-wrap">
          <table className="data league-table">
            <thead>
              <tr>
                <th className="lt-pos">#</th>
                <th>Club</th>
                <th className="num">P</th>
                <th className="num">W</th>
                <th className="num">D</th>
                <th className="num">L</th>
                <th className="num">GF</th>
                <th className="num">GA</th>
                <th className="num">GD</th>
                <th className="num">Pts</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
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
                    <td className="num">{r.played}</td>
                    <td className="num">{r.won}</td>
                    <td className="num">{r.drawn}</td>
                    <td className="num">{r.lost}</td>
                    <td className="num">{r.goalsFor}</td>
                    <td className="num">{r.goalsAgainst}</td>
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

/** Shown until a standings data source exists. Says what's missing and why,
 *  rather than a bare "coming soon" that reads like a broken page. */
function LeagueTablePlaceholder() {
  return (
    <div className="lt-placeholder">
      {/* Roughly a division's worth of rows, so the widget reserves the height
          a real table will need and the page doesn't reflow when it lands. */}
      <div className="lt-placeholder-art" aria-hidden="true">
        {[72, 84, 58, 47, 66, 39, 52, 30].map((w, i) => (
          <span key={w} className={`lt-ghost-row${i === 2 ? ' lt-ghost-us' : ''}`}>
            <i className="lt-ghost-pos" />
            <i className="lt-ghost-bar" style={{ width: `${w}%` }} />
            <i className="lt-ghost-pts" />
          </span>
        ))}
      </div>
      <p className="lt-placeholder-title">Standings aren’t connected yet</p>
      <p className="muted lt-placeholder-copy">
        Every other stat here comes from our own results. A league table also needs
        the other clubs’ results, so it needs a data source of its own before it can
        go live.
      </p>
    </div>
  );
}
