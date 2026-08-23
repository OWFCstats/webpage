import { Link } from 'react-router-dom';
import { initials, ordinal, plural } from '../lib/format';
import { statLeaders } from '../lib/players';

/**
 * The stats a leaderboard runs through, in the order it reads them: what a
 * player wants their name against first. One list, in one place, because
 * Players and Records ask the same question of the same rows — and because the
 * next stat the club starts counting should appear on both by being added here.
 *
 * `noun` is the singular/plural pair the footer counts in — "2 apps" needs
 * "app"/"apps", not the stat's own heading. Kept short on purpose: the footer
 * shares a card two names wide with "Nth of M", and a long noun is what wraps
 * it onto a second line.
 */
const STATS = [
  { key: 'goals', label: 'Goals', noun: ['goal', 'goals'] },
  { key: 'assists', label: 'Assists', noun: ['assist', 'assists'] },
  { key: 'goalInvolvements', label: 'Goals + assists', noun: ['G+A', 'G+A'] },
  { key: 'appearances', label: 'Appearances', noun: ['app', 'apps'] },
  { key: 'motm', label: 'Man of the Match', noun: ['MOTM', 'MOTM'] },
  { key: 'cleanSheets', label: 'Clean sheets', noun: ['sheet', 'sheets'] },
];

export const LEADERBOARD_STATS = STATS.map((s) => s.key);

/** Past this many level at the top, the leader row stops naming them: three
 *  names in the display face is a headline, six is a list in the wrong place. */
const SHARED_NAMED = 3;

/**
 * One stat, one card: a heading, the leader's own row, up to four more ranked
 * names, and a footer. Capped at five names total — see `LeaderBoards` below
 * for why that's the whole board rather than a taste of it.
 *
 * A shared lead is named in full, same rule as the honours board: two players
 * level both lead it and the row can't say which mattered more. Past three, the
 * row names nobody and every level name drops into the list beneath, still
 * ranked first — a crowd at the top is a fact about the season, not a name to
 * pick out of it.
 */
function LeaderCard({ title, statKey, noun, rows, limit }) {
  const { value, leaders, chasers, ranked, sharedLead, total, next } = statLeaders(rows, statKey, limit);

  if (ranked.length === 0) {
    return (
      <section className="sheet lb-card">
        <h3>{title}</h3>
        <p className="muted">Nothing recorded yet.</p>
      </section>
    );
  }

  const named = sharedLead <= SHARED_NAMED ? leaders : [];
  const listed = named.length > 0 ? chasers : ranked;
  const leader = named.length === 1 ? named[0] : null;

  return (
    <section className="sheet lb-card">
      <h3>{title}</h3>
      <div className={`board lb-lead${leader ? '' : ' shared'}`}>
        {leader && <span className="avatar lb-avatar">{initials(leader.player.name)}</span>}
        <div className="lb-who">
          <div className="lb-names">
            {leader ? (
              <Link to={`/players/${leader.player.id}`}>{leader.player.name}</Link>
            ) : named.length > 0 ? (
              named.map((r, i) => (
                <span key={r.player.id}>
                  {i > 0 && ' & '}
                  <Link to={`/players/${r.player.id}`}>{r.player.name}</Link>
                </span>
              ))
            ) : (
              <span className="unclaimed">Nobody clear yet</span>
            )}
          </div>
          {/* A single leader's name is the whole story; a shared one needs the
              count to say why nobody's picked out. */}
          {!leader && <span className="lb-sub">{sharedLead} level at the top</span>}
        </div>
        <span className="lb-tally">{value}</span>
      </div>
      {listed.length > 0 && (
        <ol className="lb-list">
          {listed.map((r) => (
            <li key={r.player.id} className="lb-row">
              <span className="lb-rank">{r.rank}</span>
              <Link className="lb-name" to={`/players/${r.player.id}`}>{r.player.name}</Link>
              <span className="lb-value">{r[statKey]}</span>
            </li>
          ))}
        </ol>
      )}
      {/* Where the top five ended, and what it takes to be there — the rank
          right after the cut, already resolved against ties. Replaces the old
          "…and N more level on X" hedge with a fact rather than an apology. */}
      <p className="muted card-foot">
        {next ? (
          <>{ordinal(next.rank)} of {total} · {plural(next[statKey], noun[0], noun[1])}</>
        ) : (
          `${plural(total, 'player', 'players')} on the board.`
        )}
      </p>
    </section>
  );
}

/**
 * Every board at once, each capped at five names — the top five, a footer, and
 * done. Clicking through six single-stat views to find where your name isn't
 * is what made the old design read as a database; capping each board and
 * naming the cut-off is the fix, not a chip row that hides five of six boards
 * behind a click. See docs/DESIGN.md, *Leaderboards and the squad*.
 */
export default function LeaderBoards({ rows, stats = LEADERBOARD_STATS, limit = 5 }) {
  const chosen = stats.map((key) => STATS.find((s) => s.key === key)).filter(Boolean);

  return (
    <div className="grid boards">
      {chosen.map((s) => (
        <LeaderCard key={s.key} title={s.label} statKey={s.key} noun={s.noun} rows={rows} limit={limit} />
      ))}
    </div>
  );
}
