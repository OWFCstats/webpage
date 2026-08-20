import { Link } from 'react-router-dom';
import { plural, rate } from '../lib/format';
import { statLeaders } from '../lib/players';
import { statToken } from '../lib/tokens';

// The bars read their colour from --bar-accent, so the token name goes in as a
// CSS custom property and the fill rules stay in bar-board.css.
const accentStyle = (statKey) => ({ '--bar-accent': `var(${statToken(statKey)})` });

/**
 * What the row limit left out at the same mark as the last name shown. A cut
 * that lands inside a tie makes the last name on the board read as the last
 * name there is, which is the one thing a leaderboard mustn't say.
 */
function LevelNote({ count, value }) {
  if (count === 0) return null;
  return <p className="muted card-foot">…and {count} more level on {value}.</p>;
}

/**
 * Ranked bar board: name, proportional bar, total. The leader's bar is full and
 * everyone else is drawn relative to it, so the gap at the top is readable at a
 * glance. `bare` skips the card surface and the title, for a board nested
 * inside a caller's own card.
 *
 * The fill colour comes from the stat itself rather than a per-call prop, so
 * goals are the same brass wherever they're ranked — see lib/tokens.js.
 */
export default function BarBoard({ title, rows, statKey, limit = 8, bare = false }) {
  const { ranked, value, alsoLevel } = statLeaders(rows, statKey, limit);

  const body = ranked.length === 0 ? (
    <p className="muted">Nothing recorded yet.</p>
  ) : (
    <>
      <ol className="bar-list" style={accentStyle(statKey)}>
        {ranked.map((r) => (
          <li key={r.player.id} className="bar-row">
            <Link className="bar-name" to={`/players/${r.player.id}`}>{r.player.name}</Link>
            <span className="bar-value">{r[statKey]}</span>
            <span className="bar-track">
              <span
                className="bar-fill"
                style={{ width: `${value ? (r[statKey] / value) * 100 : 0}%` }}
              />
            </span>
          </li>
        ))}
      </ol>
      <LevelNote count={alsoLevel} value={ranked[ranked.length - 1][statKey]} />
    </>
  );

  if (bare) return body;

  return (
    <section className="sheet bar-board">
      <h3>{title}</h3>
      {body}
    </section>
  );
}

/**
 * One ranked row: rank, name, tally, and a bar drawn relative to the leader so
 * the size of the gap at the top is readable, not just the order.
 */
export function ChaseRow({ rank, row, statKey, max }) {
  const value = row[statKey];
  return (
    <div className="chase-row">
      {rank != null && <span className="chase-rank">{rank}</span>}
      <Link className="chase-name" to={`/players/${row.player.id}`}>{row.player.name}</Link>
      <span className="chase-value">{value}</span>
      <span className="chase-track">
        <span
          className="chase-fill"
          style={{ width: `${max ? (value / max) * 100 : 0}%` }}
        />
      </span>
    </div>
  );
}

/** Past this many level at the top, the band stops naming them: three names in
 *  the display face is a headline, six is a list in the wrong place. */
const SHARED_NAMED = 3;

/**
 * Headline board: the leader gets the dark band and a large tally, the chasers
 * sit beneath. Used for the one stat the page is really about, and it is the
 * only `.board` on the page that carries it.
 *
 * A shared lead is named in full — two players level both lead it, and the rows
 * can't say which of them mattered more, the same rule the honours board
 * follows. Past three, the band names nobody and every level name drops into
 * the list beneath, still ranked first: a crowd at the top is a fact about the
 * season, not a name to pick out of it.
 */
export function LeadBoard({ title, rows, statKey, unit, limit = 6 }) {
  const { value, leaders, chasers, ranked, sharedLead, alsoLevel } = statLeaders(rows, statKey, limit);

  if (ranked.length === 0) {
    return (
      <section className="sheet">
        <div className="section-head" style={{ marginBottom: '0.4rem' }}><h3>{title}</h3></div>
        <p className="muted">Nothing recorded yet.</p>
      </section>
    );
  }

  const named = sharedLead <= SHARED_NAMED ? leaders : [];
  const listed = named.length > 0 ? chasers : ranked;
  const leader = named.length === 1 ? named[0] : null;
  const perGame = leader && unit && leader.appearances
    ? `${rate(leader[statKey] / leader.appearances)} ${unit} per game · `
    : '';

  return (
    <section className={`sheet lead-card${named.length === 1 ? '' : ' shared'}`} style={accentStyle(statKey)}>
      <div className="board lead-hero">
        <div>
          <div className="label">{title}</div>
          <div className="who">
            {named.length === 0 ? (
              <span className="unclaimed">Nobody clear yet</span>
            ) : (
              named.map((r, i) => (
                <span key={r.player.id}>
                  {i > 0 && ' & '}
                  <Link to={`/players/${r.player.id}`}>{r.player.name}</Link>
                </span>
              ))
            )}
          </div>
          <div className="rate">
            {leader
              ? `${perGame}${plural(leader.appearances, 'appearance', 'appearances')}`
              : `${sharedLead} players level at the top`}
          </div>
        </div>
        <div className="tally">{value}</div>
      </div>
      {listed.length > 0 && (
        <div className="lead-chase">
          {listed.map((r) => (
            <ChaseRow key={r.player.id} rank={r.rank} row={r} statKey={statKey} max={value} />
          ))}
          <LevelNote count={alsoLevel} value={ranked[ranked.length - 1][statKey]} />
        </div>
      )}
    </section>
  );
}
