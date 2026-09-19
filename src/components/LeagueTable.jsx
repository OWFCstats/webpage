import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { formatDateTime } from '../lib/format';
import { leagueStandings } from '../lib/league';

/**
 * League table widget, reading the standings an admin enters each week
 * (`league_rows` — see the League tab in admin). Points and goal difference
 * are derived, never stored; ordering and the join to `teams` live in
 * leagueStandings().
 *
 * Two independent choices: `full` picks the window (the whole division, as
 * Season shows it, against our row plus two clubs either side, which is what
 * Home has room for) and `compact` picks the shape (the mock's five-column
 * snapshot — `#` · Club · P · Pts · Form, headed by the division name itself
 * rather than a generic "League table" — against the full ten-column table).
 * Home uses the narrow window with the compact shape; Season uses the whole
 * division with the full shape. Nothing stops the other two combinations,
 * there's just no caller for them yet.
 *
 * Form is on the compact shape only. Ten columns is already 309px of the 341
 * a phone gives the full table (docs/DESIGN.md → *Mobile*), so there is no
 * eleventh — and the snapshot is where a reader asks who's in form anyway.
 *
 * A season with nothing entered yet keeps the placeholder line rather than a
 * mocked-up table for data that isn't there.
 */
export default function LeagueTable({ season, full = false, compact = false, showSeasonLink = true }) {
  const { leagueRows, teams, matches } = useData();
  // Every rival's form is typed on its row; ours is derived from our league
  // results, which is what `matches` is here for (see leagueStandings).
  const { rows, division, updatedAt } = leagueStandings(leagueRows, teams, season, matches);
  // Ranked before the window is taken, so the numbers down the side of Home's
  // five rows are still the club's real positions in the division.
  const ranked = rows.map((r, i) => ({ ...r, rank: r.position ?? i + 1 }));
  const shown = full ? ranked : aroundUs(ranked);
  const note = [season, division].filter(Boolean).join(' · ');

  return (
    <section className={`sheet home-widget home-table${compact ? ' g-league' : ''}`}>
      <div className="head">
        {compact ? (
          <h2>{division ?? 'League table'}</h2>
        ) : (
          <div>
            <span className="label">Standings</span>
            <h2>League table</h2>
          </div>
        )}
        {compact ? (
          showSeasonLink && <Link className="more" to="/season">Full table →</Link>
        ) : (
          <div className="home-widget-head-right">
            {note && <span className="home-widget-note">{note}</span>}
            {showSeasonLink && <Link className="more" to="/season">Full standings →</Link>}
          </div>
        )}
      </div>

      {shown.length === 0 ? (
        <LeagueTablePlaceholder />
      ) : (
        <>
          <div className="table-wrap">
            <table className={`data league-table${compact ? ' lt-compact' : ''}`}>
              <thead>
                <tr>
                  <th className="lt-pos">#</th>
                  <th>Club</th>
                  <th className={compact ? 'num' : 'num lt-hide-narrow'}>P</th>
                  {!compact && (
                    <>
                      <th className="num">W</th>
                      <th className="num lt-hide-narrow">D</th>
                      <th className="num">L</th>
                      <th className="num lt-hide-narrow">GF</th>
                      <th className="num lt-hide-narrow">GA</th>
                      <th className="num">GD</th>
                    </>
                  )}
                  <th className="num">Pts</th>
                  {compact && <th className="num">Form</th>}
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
                    <td className={compact ? 'num' : 'num lt-hide-narrow'}>{r.played}</td>
                    {!compact && (
                      <>
                        <td className="num">{r.won}</td>
                        <td className="num lt-hide-narrow">{r.drawn}</td>
                        <td className="num">{r.lost}</td>
                        <td className="num lt-hide-narrow">{r.goals_for}</td>
                        <td className="num lt-hide-narrow">{r.goals_against}</td>
                        <td className="num lt-gd">
                          {r.goalDifference > 0 ? `+${r.goalDifference}` : r.goalDifference}
                        </td>
                      </>
                    )}
                    <td className="num lt-pts">{r.points}</td>
                    {compact && (
                      <td className="lt-form">
                        <FormChips form={r.form} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {updatedAt && (
            <p className="muted lt-updated">
              Entered by hand · updated {formatDateTime(updatedAt)}
              {/* Our own chips come off our league results only, so they part
                  company with the form card above after a cup tie. Saying which
                  is cheaper than a reader finding the two disagree. */}
              {compact && ' · form: league only'}
            </p>
          )}
        </>
      )}
    </section>
  );
}

/** One club's last five, oldest first — the mock's fifth column. A club with
 *  nothing typed (and us, before a league game is played) gets no squares
 *  rather than five empty ones: the column is narrow enough that a blank row
 *  reads as "not entered" on its own. */
function FormChips({ form }) {
  if (!form || form.length === 0) return null;
  return (
    <div className="chips">
      {form.map((r, i) => (
        // Position in the run is the key: the same five letters in the same
        // order are the same five squares, and there is no id to use.
        <span key={i} className={`chip ${r}`}>{r}</span>
      ))}
    </div>
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
