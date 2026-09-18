import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime, rate } from '../../lib/format';
import { divisionRatios } from '../../lib/league';

/** The two rankings, and the words each one's average is read with. Keyed by
 *  what `divisionRatios` calls them, so the toggle indexes straight into it. */
const LISTS = [
  { key: 'scored', label: 'Attack', average: 'scored per game' },
  { key: 'conceded', label: 'Defence', average: 'conceded per game' },
];

/**
 * Where the club's attack and defence sit in its own division, off the
 * standings an admin already types in each week: goals for over played, and
 * goals against over played, each ranked best first.
 *
 * Not a Recharts plot — a ranked list, because the comparison a reader wants
 * is against the other clubs and against the division's own average, and both
 * are rows in the same list. One list at a time behind the toggle: two lists
 * of nine clubs is the same division ranked twice on one screen, which is what
 * made this the tallest card on the page (docs/DESIGN.md → *A ranked list is
 * not a plot*).
 *
 * One season, because `league_rows` is scoped that way — so `SeasonStats`
 * leaves this card out under *All seasons* along with everything else that
 * would combine.
 */
export default function DivisionRatios({ season, leagueRows, teams }) {
  const [mode, setMode] = useState('scored');

  const { clubs, scored, conceded, scale, updatedAt } = useMemo(
    () => divisionRatios(leagueRows, teams, season),
    [leagueRows, teams, season],
  );

  const empty = scale == null;
  const list = mode === 'scored' ? scored : conceded;
  const words = LISTS.find((l) => l.key === mode).average;
  const unplayed = clubs.filter((c) => c.played === 0);

  // A goalless division is a real scale of nothing rather than no scale at all,
  // so every bar sits at nothing instead of dividing by zero. Both rankings are
  // drawn against the one scale even though only one is on screen, so the
  // toggle moves a bar for a reason: a club that concedes what it scores keeps
  // the same length across it.
  const across = (value) => `${scale > 0 ? (value / scale) * 100 : 0}%`;

  return (
    <section className="sheet">
      <div className="head">
        <div>
          <span className="label">The division</span>
          <h2>Attack and defence</h2>
        </div>
        {!empty && (
          <div className="seg" role="tablist" aria-label="Division ranking">
            {LISTS.map((l) => (
              <button
                key={l.key}
                type="button"
                role="tab"
                aria-selected={mode === l.key}
                className={mode === l.key ? 'active' : undefined}
                onClick={() => setMode(l.key)}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {empty ? (
        // The default empty state says what fills a card in — the next match.
        // This one reads a table somebody types in by hand, so waiting for the
        // next match wouldn't fix it. Nothing is drawn under it either: the
        // foot is there to reconcile these figures with the tiles above, and
        // there are none to reconcile.
        <div className="empty">
          {clubs.length === 0
            ? 'No standings entered for this season yet — this fills in from the league table.'
            : 'No games played in the division yet.'}
        </div>
      ) : (
        <>
          <ol className="ratio-rows">
            {list.rows.map((r) => (
              <li key={r.id} className={r.isUs ? 'ratio-row us' : 'ratio-row'}>
                <span className="pos">{r.rank}</span>
                <span className="club">
                  {/* Our own name isn't a link — the club page for us is the
                      site you're already on, same as the league table's own
                      row. */}
                  {r.isUs || !r.slug ? r.name : <Link to={`/opponents/${r.slug}`}>{r.name}</Link>}
                </span>
                <span className="track">
                  <i className="fill" style={{ width: across(r.value) }} />
                </span>
                <span className="v">{rate(r.value)}</span>
              </li>
            ))}
          </ol>

          {/* The average as a note under the list rather than a hairline across
              every row: one ranking is on screen at a time, so there is no
              second list for the same mark to be read against, and a note says
              the figure outright instead of leaving it to be judged off a
              rule's position. */}
          {list.average != null && (
            <p className="avg-note">
              <i aria-hidden="true" />
              Division average {rate(list.average)} {words}
            </p>
          )}

          <div className="dr-foot">
            {unplayed.length > 0 && (
              <p className="muted dr-note">
                {names(unplayed.map((c) => c.name))} {unplayed.length === 1 ? 'has' : 'have'} yet
                to play, so {unplayed.length === 1 ? "isn't" : "aren't"} ranked here.
              </p>
            )}
            {/* Two things a reader needs to reconcile this card with the tiles
                above it, on one line. League games only, because `league_rows`
                counts nothing else — the season's own per-game tiles count
                every match, so the same club's two figures differ by a friendly
                and a cup tie. And typed in by hand, the line the league table
                carries for the same reason: these figures are only as current
                as the last time somebody entered the table, where every other
                card on this page is current to the last match played. */}
            <p className="muted dr-note">
              League games only
              {updatedAt && ` · entered by hand, updated ${formatDateTime(updatedAt)}`}
            </p>
          </div>
        </>
      )}
    </section>
  );
}

/** "A", "A and B", "A, B and C" — a sentence, so it has to read as one. */
function names(list) {
  if (list.length < 2) return list.join('');
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}
