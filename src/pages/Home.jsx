import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, FormBadges, Spinner, VenueBadge } from '../components/bits';
import LeagueTable from '../components/LeagueTable';
import {
  countdownLabel,
  fixtures,
  formatDate,
  formOf,
  isPlayed,
  opponentSlug,
  playerTotals,
  resultOf,
  seasonsOf,
  seasonSummary,
  seasonTrend,
} from '../lib/stats';

// The four public sections. Admin is reachable from the top bar only — it's
// not a destination a visitor is browsing toward, so it stays off the
// dashboard.
const SECTIONS = [
  { to: '/matchday', label: 'Matchday', blurb: 'Latest result, form and the next fixture' },
  { to: '/season', label: 'Season', blurb: 'Results, tables and season charts' },
  { to: '/players', label: 'Players', blurb: 'Squad profiles and leaderboards' },
  { to: '/history', label: 'History', blurb: 'Past seasons, records and honours' },
];

const SECTION_ICONS = {
  '/matchday': (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 4.6 5.2 6.7l1.1 3.3h3.4l1.1-3.3z" />
    </svg>
  ),
  '/season': (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
      <path d="M2.5 6.6h11M5.6 2.1v2.6M10.4 2.1v2.6" />
    </svg>
  ),
  '/players': (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="6.2" cy="6" r="2.2" />
      <path d="M2.4 13.1c0-2.1 1.7-3.5 3.8-3.5s3.8 1.4 3.8 3.5" />
      <circle cx="11.7" cy="6.7" r="1.7" />
      <path d="M11.2 9.8c1.7-.1 3.1 1.1 3.1 3.3" />
    </svg>
  ),
  '/history': (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M5.2 2.6h5.6v3.1a2.8 2.8 0 0 1-5.6 0z" />
      <path d="M5.2 3.7H3.3c0 1.8.8 2.6 1.9 2.8M10.8 3.7h1.9c0 1.8-.8 2.6-1.9 2.8M8 8.6v2.3M5.9 13.4h4.2l-.5-2.5H6.4z" />
    </svg>
  ),
};

function initials(name) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('');
}

/** Cumulative-points sparkline. Two points is a line segment, not a trend, so
 *  it draws nothing below three games rather than implying a shape. */
function Sparkline({ values, stroke }) {
  if (values.length < 3) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const step = 100 / (values.length - 1);
  const points = values
    .map((v, i) => `${(i * step).toFixed(2)},${(26 - ((v - min) / span) * 22).toFixed(2)}`)
    .join(' ');
  return (
    <svg className="home-spark" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function Home() {
  const { players, matches, appearances, teams, loading, error } = useData();

  const view = useMemo(() => {
    const currentSeason = seasonsOf(matches)[0];
    const seasonMatches = currentSeason
      ? matches.filter((m) => m.season === currentSeason)
      : [];
    // Golden boot is the *current season's* race, not a career table — the
    // all-time list already lives on Players.
    const seasonTotals = playerTotals(players, seasonMatches, appearances)
      .filter((r) => r.goals > 0)
      .sort((a, b) => b.goals - a.goals || a.player.name.localeCompare(b.player.name));
    const topGoals = seasonTotals[0]?.goals ?? 0;
    return {
      currentSeason,
      seasonMatches,
      summary: seasonSummary(seasonMatches),
      form: formOf(seasonMatches),
      next: fixtures(matches)[0],
      trend: seasonTrend(seasonMatches),
      topScorer: seasonTotals[0] ?? null,
      jointTop: seasonTotals.filter((r) => r.goals === topGoals).length,
      cleanSheets: seasonMatches.filter((m) => isPlayed(m) && m.goals_against === 0).length,
    };
  }, [players, matches, appearances]);

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  if (matches.length === 0 && players.length === 0) {
    return (
      <div className="empty card">
        <h1>Old Wellingtonians FC</h1>
        <p>No data yet. Once the first players and matches are entered, stats will appear here.</p>
      </div>
    );
  }

  const {
    currentSeason, summary, form, next, trend, topScorer, jointTop, cleanSheets,
  } = view;
  const points = summary.won * 3 + summary.drawn;
  const goalDifference = summary.goalsFor - summary.goalsAgainst;
  const winRate = summary.played ? Math.round((summary.won / summary.played) * 100) : null;
  const goalScale = Math.max(summary.goalsFor, summary.goalsAgainst, 1);
  const countdown = next ? countdownLabel(next.date) : null;

  return (
    <div className="home">
      <div className="home-head">
        <h1>Old Wellingtonians FC</h1>
        {currentSeason && <span className="home-season">Season {currentSeason}</span>}
      </div>

      <div className="home-kpis">
        <div className="home-kpi">
          <span className="k-label">Points</span>
          <span className="k-value">{points}</span>
          <span className="k-sub">{summary.played} played</span>
        </div>
        <div className="home-kpi">
          <span className="k-label">Record</span>
          <span className="k-value">{summary.won}-{summary.drawn}-{summary.lost}</span>
          <span className="k-sub">W-D-L</span>
        </div>
        <div className="home-kpi blue">
          <span className="k-label">Goal difference</span>
          <span className="k-value">{goalDifference > 0 ? `+${goalDifference}` : goalDifference}</span>
          <span className="k-sub">{summary.goalsFor} for · {summary.goalsAgainst} against</span>
        </div>
        <div className="home-kpi">
          <span className="k-label">Next match</span>
          <span className="k-value">{next ? formatDate(next.date).replace(/ \d{4}$/, '') : '—'}</span>
          <span className="k-sub">{next ? next.opponent : 'Nothing scheduled'}</span>
        </div>
      </div>

      <div className="home-grid">
        <div className="home-col">
          <LeagueTable season={currentSeason} />

          <section className="card home-widget home-scorer">
            <div className="home-widget-head">
              <div>
                <span className="home-eyebrow">Golden boot</span>
                <h2>Top scorer{currentSeason ? ` — ${currentSeason}` : ''}</h2>
              </div>
              <Link className="more" to="/players">All players →</Link>
            </div>
            {topScorer ? (
              <>
                <div className="scorer-row">
                  <span className="scorer-avatar">{initials(topScorer.player.name)}</span>
                  <span className="scorer-who">
                    <Link to={`/players/${topScorer.player.id}`} className="scorer-name">
                      {topScorer.player.name}
                    </Link>
                    <span className="muted">
                      {topScorer.appearances} app{topScorer.appearances === 1 ? '' : 's'}
                      {topScorer.assists > 0 && ` · ${topScorer.assists} assist${topScorer.assists === 1 ? '' : 's'}`}
                    </span>
                  </span>
                  <span className="scorer-tally">
                    <b>{topScorer.goals}</b>
                    <em>goals</em>
                  </span>
                </div>
                <p className="muted scorer-foot">
                  {jointTop > 1
                    ? `Joint top with ${jointTop - 1} other${jointTop > 2 ? 's' : ''} this season`
                    : `Leading the club this season`}
                </p>
              </>
            ) : (
              <div className="empty">No goals scored yet this season.</div>
            )}
          </section>
        </div>

        <div className="home-col">
          <section className="card home-widget home-next">
            <div className="home-widget-head">
              <div>
                <span className="home-eyebrow">Upcoming</span>
                <h2>Next fixture</h2>
              </div>
            </div>
            {next ? (
              <>
                <div className="fixture-teams">
                  <span className="fixture-side">
                    <span className="fixture-badge us">OW</span>
                    <span className="fixture-team">Old Wellingtonians</span>
                  </span>
                  <span className="fixture-vs">v</span>
                  <span className="fixture-side">
                    <span className="fixture-badge them">{initials(next.opponent)}</span>
                    <Link to={`/opponents/${opponentSlug(teams, next)}`} className="fixture-team">
                      {next.opponent}
                    </Link>
                  </span>
                </div>
                <div className="fixture-meta">
                  <span><strong>{formatDate(next.date)}</strong></span>
                  <span>{next.competition} <VenueBadge venue={next.venue} /></span>
                </div>
                {countdown && <span className="fixture-countdown">{countdown}</span>}
              </>
            ) : (
              <div className="empty">No fixture scheduled.</div>
            )}
          </section>

          <section className="card home-widget home-form">
            <div className="home-widget-head">
              <div>
                <span className="home-eyebrow">Momentum</span>
                <h2>Recent form</h2>
              </div>
            </div>
            <FormBadges matches={form} />
            {form.length > 0 && (
              <ul className="home-form-list">
                {form.map((m) => (
                  <li key={m.id}>
                    <Link to={`/matches/${m.id}`}>
                      vs {m.opponent} <VenueBadge venue={m.venue} />
                    </Link>
                    <strong>
                      {m.goals_for}–{m.goals_against}{' '}
                      <span className={`result-pill ${resultOf(m)}`}>{resultOf(m)}</span>
                    </strong>
                  </li>
                ))}
              </ul>
            )}
            <Sparkline values={trend.map((t) => t.points)} stroke="#5ba3c9" />
            {trend.length >= 3 && (
              <p className="muted home-spark-note">Points accumulated across the season</p>
            )}
          </section>
        </div>
      </div>

      <section className="card home-widget home-stats">
        <div className="home-widget-head">
          <div>
            <span className="home-eyebrow">Overview</span>
            <h2>Season stats</h2>
          </div>
          <Link className="more" to="/season">Full season →</Link>
        </div>
        <div className="home-stats-body">
          <div className="home-stat-tiles">
            <div className="home-stat-tile">
              <b>{summary.played}</b>
              <em>Played</em>
            </div>
            <div className="home-stat-tile">
              <b>{cleanSheets}</b>
              <em>Clean sheets</em>
            </div>
            <div className="home-stat-tile">
              <b>{winRate === null ? '—' : `${winRate}%`}</b>
              <em>Win rate</em>
            </div>
          </div>
          <div className="home-bars">
            <div className="home-bar">
              <span className="home-bar-label">Goals for</span>
              <span className="home-bar-track">
                <i className="home-bar-fill gf" style={{ width: `${(summary.goalsFor / goalScale) * 100}%` }} />
              </span>
              <span className="home-bar-value">{summary.goalsFor}</span>
            </div>
            <div className="home-bar">
              <span className="home-bar-label">Against</span>
              <span className="home-bar-track">
                <i className="home-bar-fill ga" style={{ width: `${(summary.goalsAgainst / goalScale) * 100}%` }} />
              </span>
              <span className="home-bar-value">{summary.goalsAgainst}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-sections">
        {SECTIONS.map((s) => (
          <Link key={s.to} to={s.to} className="card home-section-card">
            <span className="home-section-icon">{SECTION_ICONS[s.to]}</span>
            <span className="home-section-text">
              <strong>{s.label}</strong>
              <span className="muted">{s.blurb}</span>
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
