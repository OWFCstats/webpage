import { Link } from 'react-router-dom';
import { initials } from '../lib/format';
import { statLeaders } from '../lib/players';

/**
 * The stats a leaderboard runs through, in the order it reads them: what a
 * player wants their name against first. One list, in one place, because
 * Players and Records ask the same question of the same rows — and because the
 * next stat the club starts counting should appear on both by being added here.
 */
const STATS = [
  { key: 'goals', label: 'Goals' },
  { key: 'assists', label: 'Assists' },
  { key: 'goalInvolvements', label: 'Goals + assists' },
  { key: 'appearances', label: 'Appearances' },
  { key: 'motm', label: 'Man of the Match' },
  { key: 'cleanSheets', label: 'Clean sheets' },
];

export const LEADERBOARD_STATS = STATS.map((s) => s.key);

/** Past this many level at the top, the leader row stops naming them: three
 *  names in the display face is a headline, six is a list in the wrong place. */
const SHARED_NAMED = 3;

/**
 * One stat, one card: a heading, the leader's own row, and up to four more
 * ranked names. Capped at five names total — see `LeaderBoards` below for why
 * that's the whole board rather than a taste of it.
 *
 * A shared lead is named in full, same rule as the honours board: two players
 * level both lead it and the row can't say which mattered more. Past three, the
 * row names nobody and every level name drops into the list beneath, still
 * ranked first — a crowd at the top is a fact about the season, not a name to
 * pick out of it.
 */
function LeaderCard({ title, statKey, rows, limit }) {
  const { value, leaders, chasers, ranked, sharedLead } = statLeaders(rows, statKey, limit);

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
    </section>
  );
}

/**
 * Every board at once, each capped at five names — the top five and done.
 * Clicking through six single-stat views to find where your name isn't is
 * what made the old design read as a database; capping each board is the
 * fix, not a chip row that hides five of six boards behind a click. See
 * docs/DESIGN.md, *Leaderboards and the squad*.
 */
export default function LeaderBoards({ rows, stats = LEADERBOARD_STATS, limit = 5 }) {
  const chosen = stats.map((key) => STATS.find((s) => s.key === key)).filter(Boolean);

  return (
    <div className="grid boards">
      {chosen.map((s) => (
        <LeaderCard key={s.key} title={s.label} statKey={s.key} rows={rows} limit={limit} />
      ))}
    </div>
  );
}
