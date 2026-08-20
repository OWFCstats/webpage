import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { formatDateTime, leagueStandings } from '../lib/stats';

/**
 * League table widget, reading the standings an admin enters each week
 * (`league_rows` — see the League tab in admin). Points and goal difference
 * are derived, never stored; ordering and the join to `teams` live in
 * leagueStandings().
 *
 * One component, two shapes:
 *   `full` — the whole division, as the Season page shows it.
 *   default — our row plus two clubs either side, which is what Home has room
 *   for and what "how are we doing" actually asks.
 *
 * A season with nothing entered yet keeps the placeholder line rather than a
 * mocked-up table for data that isn't there.
 */
export default function LeagueTable({ season, full = false, showSeasonLink = true }) {
  const { leagueRows, teams } = useData();
  const { rows, division, updatedAt } = leagueStandings(leagueRows, teams, season);
  // Ranked before the window is taken, so the numbers down the side of Home's
  // five rows are still the club's real positions in the division.
  const ranked = rows.map((r, i) => ({ ...r, rank: r.position ?? i + 1 }));
  const shown = full ? ranked : aroundUs(ranked);
  const note = [season, division].filter(Boolean).join(' · ');

  return (
    <section className="sheet home-widget home-table">
      <div className="home-widget-head">
        <div>
          <span className="label">Standings</span>
          <h2>League table</h2>
        </div>
        <div className="home-widget-head-right">
          {note && <span className="home-widget-note">{note}</span>}
          {showSeasonLink && <Link className="more" to="/season">Full standings →</Link>}
        </div>
      </div>

      {shown.length === 0 ? (
        <LeagueTablePlaceholder />
      ) : (
        <>
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
                  <th className="num lt-hide-narrow">GF</th>
                  <th className="num lt-hide-narrow">GA</th>
                  <th className="num">GD</th>
                  <th className="num">Pts</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id} className={r.isUs ? 'lt-us' : undefined}>
                    <td className="lt-pos">{r.rank}</td>
                    <td className="lt-club">
                      {/* Our own name isn't a link — the club page for us is
                          the site you're already on. */}
                      {r.isUs || !r.team
                        ? r.name
                        : <Link to={`/opponents/${r.team.slug}`}>{r.name}</Link>}
                    </td>
                    <td className="num lt-hide-narrow">{r.played}</td>
                    <td className="num">{r.won}</td>
                    <td className="num lt-hide-narrow">{r.drawn}</td>
                    <td className="num">{r.lost}</td>
                    <td className="num lt-hide-narrow">{r.goals_for}</td>
                    <td className="num lt-hide-narrow">{r.goals_against}</td>
                    <td className="num lt-gd">
                      {r.goalDifference > 0 ? `+${r.goalDifference}` : r.goalDifference}
                    </td>
                    <td className="num lt-pts">{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {updatedAt && (
            <p className="muted lt-updated">Entered by hand · updated {formatDateTime(updatedAt)}</p>
          )}
        </>
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

/** Shown for a season nobody has entered standings for yet — one honest line,
 *  since the numbers come in by hand and may simply not have arrived. */
function LeagueTablePlaceholder() {
  return (
    <p className="muted lt-placeholder">
      No standings entered for this season yet.
    </p>
  );
}
