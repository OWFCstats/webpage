import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, HonourGrid, Spinner, VenueBadge } from '../components/bits';
import PlayerCareerChart from '../components/PlayerCareerChart';
import {
  formatDate,
  matchTitle,
  opponentSlug,
  playerProfile,
  plural,
  rate,
  resultOf,
  seasonsOf,
} from '../lib/stats';

function initials(name) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

/** "2 goals, 1 assist" — the player's own contribution to one game. */
function contribution(app) {
  const bits = [
    app.goals > 0 && `${app.goals} goal${app.goals > 1 ? 's' : ''}`,
    app.assists > 0 && `${app.assists} assist${app.assists > 1 ? 's' : ''}`,
  ].filter(Boolean);
  return bits.join(', ');
}

function scoreline(match) {
  return `${resultOf(match) === 'W' ? 'won' : resultOf(match) === 'L' ? 'lost' : 'drew'} ${match.goals_for}–${match.goals_against}`;
}

/** All-time totals across the top, in the same dark band the Match Centre uses. */
function Hero({ player, career, seasonsActive }) {
  const span = seasonsActive.length
    ? `${seasonsActive[0]}${seasonsActive.length > 1 ? ` – ${seasonsActive[seasonsActive.length - 1]}` : ''}`
    : 'No appearances yet';
  return (
    <div className="player-hero">
      <span className="crest">{initials(player.name)}</span>
      <div className="who">
        <h1>{player.name}</h1>
        <div className="sub">
          {player.position && <span className="tag dark">{player.position}</span>}
          {player.status === 'inactive' && <span className="tag dark">inactive</span>}
          <span>
            {seasonsActive.length > 0 && `${seasonsActive.length} season${seasonsActive.length > 1 ? 's' : ''} · `}
            {span}
          </span>
        </div>
      </div>
      <div className="career-line">
        <div><span className="v">{career.appearances}</span><span className="k">Apps</span></div>
        <div><span className="v">{career.goals}</span><span className="k">Goals</span></div>
        <div><span className="v">{career.assists}</span><span className="k">Assists</span></div>
        <div><span className="v">{career.cleanSheets}</span><span className="k">Clean sheets</span></div>
        <div><span className="v">{career.motm}</span><span className="k">MOTM</span></div>
      </div>
    </div>
  );
}

/** Progress bars only — the honours below say what happens when one fills. */
function MilestoneStrip({ milestones }) {
  if (milestones.length === 0) return null;
  return (
    <div className="section">
      <h3 className="card-label">Milestone watch</h3>
      <div className="ms-strip">
        {milestones.map((m, i) => (
          <div key={m.key} className={`ms${i === 0 ? ' lead' : ''}`}>
            <div className="ms-line">
              <strong>{m.remaining}</strong> {m.remaining === 1 ? m.one : m.many} from {m.target}
            </div>
            <div className="ms-track">
              <span className="ms-fill" style={{ width: `${Math.round(m.progress * 100)}%` }} />
            </div>
            <div className="ms-foot">{m.total} / {m.target}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Honours({ honours }) {
  return (
    <div className="card">
      <h3 className="card-label">Honours</h3>
      <HonourGrid honours={honours} />
    </div>
  );
}

function FirstsTable({ firsts }) {
  const { debut, firstGoal, bestGame, bestSeason } = firsts;
  if (!debut) return null;
  return (
    <div className="card">
      <h3 className="card-label">Firsts &amp; bests</h3>
      <div className="table-wrap">
        <table className="data firsts">
          <tbody>
            <tr>
              <td><strong>Debut</strong></td>
              <td>{formatDate(debut.match.date)}</td>
              <td>
                <Link to={`/matchday/${debut.match.id}`}>vs {matchTitle(debut.match)}</Link>{' '}
                <span className="muted">— {scoreline(debut.match)}</span>
              </td>
            </tr>
            <tr>
              <td><strong>First goal</strong></td>
              <td>{firstGoal ? formatDate(firstGoal.match.date) : '—'}</td>
              <td>
                {firstGoal ? (
                  <>
                    <Link to={`/matchday/${firstGoal.match.id}`}>vs {matchTitle(firstGoal.match)}</Link>{' '}
                    <span className="muted">— appearance {firstGoal.appearanceNo}, {scoreline(firstGoal.match)}</span>
                  </>
                ) : (
                  <span className="muted">Yet to score</span>
                )}
              </td>
            </tr>
            <tr>
              <td><strong>Best game</strong></td>
              <td>{bestGame ? formatDate(bestGame.match.date) : '—'}</td>
              <td>
                {bestGame ? (
                  <>
                    <Link to={`/matchday/${bestGame.match.id}`}>vs {matchTitle(bestGame.match)}</Link>{' '}
                    <span className="muted">— {contribution(bestGame.app)}, {scoreline(bestGame.match)}</span>
                    {bestGame.app.motm && <> <span className="tag">MOTM</span></>}
                  </>
                ) : (
                  <span className="muted">No goals or assists yet</span>
                )}
              </td>
            </tr>
            <tr>
              <td><strong>Best season</strong></td>
              <td>{bestSeason ? bestSeason.season : '—'}</td>
              <td>
                {bestSeason ? (
                  <span className="muted">
                    {plural(bestSeason.appearances, 'app', 'apps')} ·{' '}
                    {plural(bestSeason.goals, 'goal', 'goals')} ·{' '}
                    {plural(bestSeason.assists, 'assist', 'assists')}
                  </span>
                ) : (
                  <span className="muted">—</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FormCard({ form, scoringRun, sinceGoal, favouriteOpponent, teams }) {
  const scoredIn = form.filter((f) => f.app.goals > 0).length;
  return (
    <div className="card">
      <h3 className="card-label">Last {form.length} played</h3>
      <div className="form-games">
        {form.map(({ app, match }) => (
          <Link key={app.id} to={`/matchday/${match.id}`} className="fg" title={`${formatDate(match.date)} vs ${match.opponent}`}>
            <span className={`result-pill ${resultOf(match)}`}>{resultOf(match)}</span>
            <span className="fg-op">{match.opponent}</span>
            <span className={`fg-mine${app.goals + app.assists === 0 ? ' blank' : ''}`}>
              {app.goals + app.assists === 0
                ? '–'
                : [app.goals > 0 && `${app.goals}G`, app.assists > 0 && `${app.assists}A`].filter(Boolean).join(' ')}
            </span>
          </Link>
        ))}
      </div>
      <p className="muted card-foot">
        {scoredIn > 0
          ? `Scored in ${scoredIn} of the last ${form.length}.`
          : `No goals in the last ${form.length}.`}
        {scoringRun > 1 && ` On a ${scoringRun}-game scoring run.`}
        {scoringRun === 0 && sinceGoal > form.length && ` ${sinceGoal} games since the last one.`}
      </p>
      {favouriteOpponent && (
        <p className="muted card-foot">
          {favouriteOpponent.goals} goal{favouriteOpponent.goals > 1 ? 's' : ''} in {favouriteOpponent.games} v{' '}
          <Link to={`/opponents/${opponentSlug(teams, favouriteOpponent)}`}>{favouriteOpponent.opponent}</Link> — more than
          against anyone else.
        </p>
      )}
    </div>
  );
}

function RankCard({ ranks }) {
  return (
    <div className="card">
      <h3 className="card-label">Where they rank</h3>
      <ul className="rank-list">
        {ranks.map((r) => (
          <li key={r.key}>
            <span className={`rank-pos${r.rank != null && r.rank <= 3 ? ' top' : ''}`}>
              {r.rank == null ? '—' : ordinal(r.rank)}
            </span>
            <span className="rank-den">of {r.of}</span>
            <span className="rank-what">{r.label}</span>
            <span className="rank-val">{r.value}</span>
          </li>
        ))}
      </ul>
      <p className="muted card-foot">Ranked against everyone who has played for the club.</p>
    </div>
  );
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function MatesCard({ teammates }) {
  return (
    <div className="card">
      <h3 className="card-label">Most played alongside</h3>
      <ul className="mate-list">
        {teammates.map((t) => (
          <li key={t.player.id}>
            <span className="avatar">{initials(t.player.name)}</span>
            <Link to={`/players/${t.player.id}`} className="mate-name">{t.player.name}</Link>
            <span className="mate-count">{t.games} <em>games</em></span>
          </li>
        ))}
      </ul>
      {teammates.length === 0 && <div className="empty">No shared appearances yet.</div>}
    </div>
  );
}

function SeasonCards({ seasons, bestSeason }) {
  if (seasons.length === 0) return null;
  return (
    <div className="section">
      <h3 className="card-label">Season by season</h3>
      <div className="season-cards">
        {seasons.map((s) => (
          <div key={s.season} className={`season-card${bestSeason && s.season === bestSeason.season ? ' best' : ''}`}>
            <div className="sc-year">
              {s.season}
              {bestSeason && s.season === bestSeason.season && <span className="tag gold">Best</span>}
            </div>
            <div className="sc-row">
              <div><span className="v">{s.appearances}</span><span className="k">Apps</span></div>
              <div><span className="v">{s.goals}</span><span className="k">Goals</span></div>
              <div><span className="v">{s.assists}</span><span className="k">Assists</span></div>
              <div><span className="v">{s.cleanSheets}</span><span className="k">CS</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Season-by-season shape for one stat. Flat when there's only one season to
 *  draw — better than an empty box that looks like a rendering failure. */
function Sparkline({ values, colour }) {
  if (values.length === 0) return null;
  const max = Math.max(1, ...values);
  const step = values.length > 1 ? 96 / (values.length - 1) : 0;
  const points = values
    .map((v, i) => `${2 + i * step},${24 - (v / max) * 20}`)
    .join(' ');
  return (
    <svg className="spark" viewBox="0 0 100 28" aria-hidden="true">
      {values.length > 1 ? (
        <polyline points={points} fill="none" stroke={colour} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      ) : null}
      <circle cx={2 + (values.length - 1) * step} cy={24 - (values[values.length - 1] / max) * 20} r="2.5" fill={colour} />
    </svg>
  );
}

const STAT_CELLS = [
  { key: 'goals', label: 'Goals', colour: '#b8860b' },
  { key: 'appearances', label: 'Appearances', colour: '#3f4149' },
  { key: 'assists', label: 'Assists', colour: '#2a78d6' },
  { key: 'cleanSheets', label: 'Clean sheets', colour: '#5ba3c9' },
  { key: 'goalInvolvements', label: 'G+A', colour: '#eb6834' },
  { key: 'motm', label: 'MOTM', colour: '#b8860b' },
  { key: 'starts', label: 'Starts', colour: '#3f4149' },
  { key: 'goalsPerGame', label: 'Goals / game', colour: '#eb6834', decimal: true },
];

function StatGrid({ career, seasons, ranks, squadAverage, squadMax }) {
  const oldestFirst = seasons.slice().reverse();
  const rankByKey = new Map(ranks.map((r) => [r.key, r]));
  return (
    <div className="stat-grid">
      {STAT_CELLS.map((c) => {
        const value = career[c.key];
        const avg = squadAverage[c.key] ?? 0;
        const max = squadMax[c.key] ?? 0;
        const rank = rankByKey.get(c.key);
        return (
          <div key={c.key} className="stat-cell">
            <div className="sc-top">
              <span className="sc-v">{c.decimal ? rate(value) : value}</span>
              {rank?.rank != null && <span className="sc-rank">{ordinal(rank.rank)}</span>}
            </div>
            <div className="sc-k">{c.label}</div>
            <Sparkline values={oldestFirst.map((s) => s[c.key])} colour={c.colour} />
            <div className="sc-vs">
              <span>squad avg {c.decimal ? rate(avg) : Math.round(avg * 10) / 10}</span>
              <span className="sc-bar">
                <i style={{ width: `${max > 0 ? Math.round((value / max) * 100) : 0}%`, background: c.colour }} />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MatchLog({ log, seasons }) {
  const [season, setSeason] = useState('all');
  const [goalsOnly, setGoalsOnly] = useState(false);
  const rows = log.filter(
    ({ app, match }) =>
      (season === 'all' || match.season === season) &&
      (!goalsOnly || app.goals + app.assists > 0),
  );
  return (
    <div className="section card">
      <div className="section-head">
        <h2>Match log</h2>
        <button
          type="button"
          className={`secondary small${goalsOnly ? ' active' : ''}`}
          aria-pressed={goalsOnly}
          onClick={() => setGoalsOnly((v) => !v)}
        >
          {goalsOnly ? 'All games' : 'Goals & assists only'}
        </button>
      </div>
      {seasons.length > 1 && (
        <div className="chip-row">
          <button
            type="button"
            className={`chip-btn${season === 'all' ? ' active' : ''}`}
            onClick={() => setSeason('all')}
          >
            All seasons
          </button>
          {seasons.map((s) => (
            <button
              key={s}
              type="button"
              className={`chip-btn${season === s ? ' active' : ''}`}
              onClick={() => setSeason(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Date</th>
              <th>Match</th>
              <th>Result</th>
              <th>Role</th>
              <th className="num">Goals</th>
              <th className="num">Assists</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ app, match }) => (
              <tr key={app.id} className={app.goals + app.assists > 0 ? 'scored-row' : undefined}>
                <td>{formatDate(match.date)}</td>
                <td>
                  <Link to={`/matchday/${match.id}`}>vs {match.opponent}</Link>{' '}
                  <VenueBadge venue={match.venue} />
                </td>
                <td>
                  <span className={`result-pill ${resultOf(match)}`}>{resultOf(match)}</span>{' '}
                  {match.goals_for}–{match.goals_against}
                </td>
                <td>{app.started ? 'Started' : 'Sub'}</td>
                <td className="num">{app.goals || ''}</td>
                <td className="num">{app.assists || ''}</td>
                <td>
                  {app.motm && <span className="tag">MOTM</span>}{' '}
                  {match.goals_against === 0 && <span className="tag">CS</span>}{' '}
                  {app.yellows > 0 && <span className="tag orange">YC{app.yellows > 1 ? ` ×${app.yellows}` : ''}</span>}{' '}
                  {app.reds > 0 && <span className="tag orange">RC</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <div className="empty">No matches match that filter.</div>}
    </div>
  );
}

export default function PlayerDetail() {
  const { playerId } = useParams();
  const { players, matches, appearances, teams, loading, error } = useData();
  const [params, setParams] = useSearchParams();
  const view = params.get('view') === 'stats' ? 'stats' : 'overview';

  const player = players.find((p) => p.id === playerId);
  const profile = useMemo(
    () => (player ? playerProfile(player, players, matches, appearances) : null),
    [player, players, matches, appearances],
  );

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;
  if (!player) {
    return (
      <div className="empty card">
        Player not found. <Link className="more" to="/players">All players →</Link>
      </div>
    );
  }

  const {
    career, log, arc, milestones, honours, firsts, seasons,
    ranks, teammates, favouriteOpponent, form, scoringRun, sinceGoal,
    squadAverage, squadMax, availableGames, seasonsActive,
  } = profile;
  const played = career.appearances > 0;

  return (
    <div>
      <Hero player={player} career={career} seasonsActive={seasonsActive} />

      {played && (
        <div className="player-views">
          <div className="seg" role="tablist" aria-label="Player view">
            <button
              type="button" role="tab" aria-selected={view === 'overview'}
              className={view === 'overview' ? 'active' : undefined}
              onClick={() => setParams({})}
            >
              Overview
            </button>
            <button
              type="button" role="tab" aria-selected={view === 'stats'}
              className={view === 'stats' ? 'active' : undefined}
              onClick={() => setParams({ view: 'stats' })}
            >
              Full stats
            </button>
          </div>
        </div>
      )}

      {!played && (
        <div className="empty card section">
          No appearances recorded yet. Everything on this page fills in from the first
          game. <Link className="more" to="/season">Fixtures →</Link>
        </div>
      )}

      {played && view === 'overview' && (
        <>
          <MilestoneStrip milestones={milestones} />

          <div className="grid player-split section">
            <FirstsTable firsts={firsts} />
            <Honours honours={honours} />
          </div>

          <div className="section">
            <PlayerCareerChart arc={arc} career={career} />
          </div>

          <div className="grid player-cards section">
            <FormCard
              form={form}
              scoringRun={scoringRun}
              sinceGoal={sinceGoal}
              favouriteOpponent={favouriteOpponent}
              teams={teams}
            />
            <RankCard ranks={ranks} />
            <MatesCard teammates={teammates} />
          </div>

          <SeasonCards seasons={seasons} bestSeason={firsts.bestSeason} />

          <p className="section more-hint-row">
            <button type="button" className="secondary small" onClick={() => setParams({ view: 'stats' })}>
              Full stats, season table and match log →
            </button>
          </p>
        </>
      )}

      {played && view === 'stats' && (
        <>
          <div className="section">
            <h3 className="card-label">Career, against the squad</h3>
            <StatGrid
              career={career}
              seasons={seasons}
              ranks={ranks}
              squadAverage={squadAverage}
              squadMax={squadMax}
            />
            <p className="muted card-foot">
              Played {career.appearances} of the {availableGames} games the club played across
              their {plural(seasonsActive.length, 'season', 'seasons')}
              {career.dropouts > 0 &&
                `, with ${plural(career.dropouts, 'late withdrawal', 'late withdrawals')}`}.
            </p>
          </div>

          <div className="section card">
            <h2>Season by season</h2>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Season</th>
                    <th className="num">Apps</th>
                    <th className="num">Starts</th>
                    <th className="num">Goals</th>
                    <th className="num">Assists</th>
                    <th className="num">G+A</th>
                    <th className="num">MOTM</th>
                    <th className="num">Clean sheets</th>
                    <th className="num">Yellows</th>
                    <th className="num">Reds</th>
                    <th className="num">Dropouts</th>
                  </tr>
                </thead>
                <tbody>
                  {seasons.map((s) => (
                    <tr key={s.season}>
                      <td><strong>{s.season}</strong></td>
                      <td className="num">{s.appearances}</td>
                      <td className="num">{s.starts}</td>
                      <td className="num">{s.goals}</td>
                      <td className="num">{s.assists}</td>
                      <td className="num">{s.goalInvolvements}</td>
                      <td className="num">{s.motm}</td>
                      <td className="num">{s.cleanSheets}</td>
                      <td className="num">{s.yellows}</td>
                      <td className="num">{s.reds}</td>
                      <td className="num">{s.dropouts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {seasons.length === 0 && <div className="empty">No appearances yet.</div>}
          </div>

          <MatchLog log={log} seasons={seasonsOf(matches).filter((s) => seasonsActive.includes(s))} />
        </>
      )}
    </div>
  );
}
