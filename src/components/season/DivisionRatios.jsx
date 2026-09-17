import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime, ordinal, rate } from '../../lib/format';
import { divisionRatios } from '../../lib/league';
import ChartCard from './ChartCard';

/** The two lists, in the order the card reads them: what a club does with the
 *  ball, then what it does without it. */
const LISTS = [
  { key: 'scored', label: 'Goals scored a game', best: 'Most first' },
  { key: 'conceded', label: 'Goals conceded a game', best: 'Fewest first' },
];

/**
 * Where the club's attack and defence sit in its own division, off the
 * standings an admin already types in each week: goals for over played, and
 * goals against over played, each ranked best first.
 *
 * Not a Recharts plot — a ranked list with its figure drawn behind it, because
 * the comparison a reader wants is against the other clubs and against the
 * division's own average, and both are rows in the same list. Each list carries
 * that average as a hairline across it, and the two lists share one scale, so
 * a row reads the same way at either end: past the mark on goals scored, or
 * short of it on goals conceded, is a club doing better than its division.
 *
 * One season, because `league_rows` is scoped that way — so `SeasonStats`
 * leaves this card out under *All seasons* along with everything else that
 * would combine.
 */
export default function DivisionRatios({ season, leagueRows, teams }) {
  const { clubs, scored, conceded, scale, updatedAt } = useMemo(
    () => divisionRatios(leagueRows, teams, season),
    [leagueRows, teams, season],
  );

  const lists = { scored, conceded };
  const unplayed = clubs.filter((c) => c.played === 0);

  return (
    <ChartCard
      title="Attack and defence in the division"
      finding={finding(scored, conceded)}
      empty={scale == null}
      emptyNote={
        clubs.length === 0
          ? 'No standings entered for this season yet — this fills in from the league table.'
          : 'No games played in the division yet.'
      }
      bodyClassName="chart-body-ranked"
      table={
        <table className="data">
          <thead>
            <tr>
              <th>Club</th>
              <th className="num">P</th>
              <th className="num">Scored</th>
              <th className="num">Conceded</th>
            </tr>
          </thead>
          <tbody>
            {clubs.map((c) => (
              <tr key={c.id} className={c.isUs ? 'dr-us' : undefined}>
                <td>{c.name}</td>
                <td className="num">{c.played}</td>
                <td className="num">{c.scored == null ? '—' : rate(c.scored)}</td>
                <td className="num">{c.conceded == null ? '—' : rate(c.conceded)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      {LISTS.map((list) => (
        <RatioList
          key={list.key}
          label={list.label}
          best={list.best}
          rows={lists[list.key].rows}
          average={lists[list.key].average}
          scale={scale}
        />
      ))}
      <div className="dr-foot">
        {unplayed.length > 0 && (
          <p className="muted dr-note">
            {names(unplayed.map((c) => c.name))} {unplayed.length === 1 ? 'has' : 'have'} yet to
            play, so {unplayed.length === 1 ? "isn't" : "aren't"} ranked here.
          </p>
        )}
        {/* Two things a reader needs to reconcile this card with the one above
            it, on one line. League games only, because `league_rows` counts
            nothing else — the season's own per-game tiles count every match,
            so the same club's two figures differ by a friendly and a cup tie.
            And typed in by hand, the line the league table carries for the
            same reason: these figures are only as current as the last time
            somebody entered the table, where every other card on this page is
            current to the last match played. */}
        <p className="muted dr-note">
          League games only
          {updatedAt && ` · entered by hand, updated ${formatDateTime(updatedAt)}`}
        </p>
      </div>
    </ChartCard>
  );
}

/**
 * One ranking. The figure is a wash behind the row rather than a bar beside
 * it, which is what leaves a long club name the whole width on a phone — a
 * name that clips is the bug this site measures for on every pull request
 * (docs/DESIGN.md → *Mobile*).
 */
function RatioList({ label, best, rows, average, scale }) {
  // A goalless division is a real scale of nothing rather than no scale at all,
  // so every figure sits at the left edge instead of dividing by zero.
  const across = (value) => `${scale > 0 ? (value / scale) * 100 : 0}%`;

  return (
    <div className="dr-list">
      <div className="dr-list-head">
        <span className="label">{label}</span>
        <span className="muted dr-best">{best}</span>
      </div>
      <div className="dr-plot">
        <ol className="dr-rows">
          {rows.map((r) => (
            <li
              key={r.id}
              className={r.isUs ? 'dr-row dr-us' : 'dr-row'}
              style={{ '--dr-fill': across(r.value) }}
            >
              <span className="dr-rank">{r.rank}</span>
              <span className="dr-club">
                {/* Our own name isn't a link — the club page for us is the site
                    you're already on, same as the league table's own row. */}
                {r.isUs || !r.slug ? r.name : <Link to={`/opponents/${r.slug}`}>{r.name}</Link>}
              </span>
              <span className="dr-value">{rate(r.value)}</span>
            </li>
          ))}
        </ol>
        {average != null && (
          <span className="dr-average" style={{ left: across(average) }} aria-hidden="true" />
        )}
      </div>
      {average != null && (
        <p className="muted dr-key">
          <span className="dr-key-mark" aria-hidden="true" />
          Division average {rate(average)}
        </p>
      )}
    </div>
  );
}

/** Where we are at both ends, which is the question the card exists to answer.
 *  Falls back to the division's own figure when the club has no row in it, or
 *  no game played yet — a table entered before our season starts. */
function finding(scored, conceded) {
  const us = scored.rows.find((r) => r.isUs);
  const usConceded = conceded.rows.find((r) => r.isUs);
  if (!us || !usConceded) {
    if (scored.average == null) return null;
    return `The division scores ${rate(scored.average)} a league game.`;
  }
  // "In the league", because the card above this one counts friendlies and cup
  // ties in the same figure and the two don't match.
  return (
    `In the league we score ${rate(us.value)} a game (${ordinal(us.rank)} of ${scored.rows.length}) `
    + `and concede ${rate(usConceded.value)} (${ordinal(usConceded.rank)}).`
  );
}

/** "A", "A and B", "A, B and C" — a sentence, so it has to read as one. */
function names(list) {
  if (list.length < 2) return list.join('');
  return `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}`;
}
