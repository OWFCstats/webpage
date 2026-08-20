import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, FormBadges, Spinner, VenueBadge } from '../components/bits';
import LeagueTable from '../components/LeagueTable';
import {
  countdownLabel,
  fixtures,
  formatDate,
  formatKickoff,
  formOf,
  isPlayed,
  latestResult,
  matchContext,
  opponentSlug,
  resultOf,
  seasonsOf,
  seasonSummary,
  seasonTrend,
  venueTeam,
} from '../lib/stats';
import { token } from '../lib/tokens';

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
    const lastMatch = latestResult(seasonMatches);
    return {
      currentSeason,
      seasonMatches,
      summary: seasonSummary(seasonMatches),
      form: formOf(seasonMatches),
      next: fixtures(matches)[0],
      trend: seasonTrend(seasonMatches),
      lastMatch,
      lastCtx: lastMatch ? matchContext(lastMatch, players, matches, appearances) : null,
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
    currentSeason, summary, form, next, trend, lastMatch, lastCtx, cleanSheets,
  } = view;
  const winRate = summary.played ? Math.round((summary.won / summary.played) * 100) : null;
  const goalScale = Math.max(summary.goalsFor, summary.goalsAgainst, 1);
  const countdown = next ? countdownLabel(next.date) : null;
  const nextKickoff = next ? formatKickoff(next.kickoff_time) : '';
  const nextVenue = next ? venueTeam(next, teams) : null;
  const nextVenueParts = nextVenue
    ? [nextVenue.pitch_name, nextVenue.pitch_address, nextVenue.postcode].filter(Boolean)
    : [];
  const lastMotm = lastCtx?.motm[0] ?? null;

  return (
    <div className="home">
      <div className="home-head">
        <h1>Old Wellingtonians FC</h1>
        {currentSeason && <span className="label">Season {currentSeason}</span>}
      </div>

      <div className="home-grid">
        <section className="card home-widget home-next">
          <div className="home-widget-head">
            <div>
              <span className="label">Upcoming</span>
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
                <span className="fixture-vs label">v</span>
                <span className="fixture-side">
                  <span className="fixture-badge them">{initials(next.opponent)}</span>
                  <Link to={`/opponents/${opponentSlug(teams, next)}`} className="fixture-team">
                    {next.opponent}
                  </Link>
                </span>
              </div>
              <div className="fixture-meta">
                <span><strong>{formatDate(next.date)}</strong>{nextKickoff && ` · ${nextKickoff}`}</span>
                <span>{next.competition} <VenueBadge venue={next.venue} /></span>
              </div>
              {(nextVenueParts.length > 0 || nextVenue?.map_url) && (
                <p className="muted fixture-location">
                  {nextVenueParts.join(', ')}
                  {nextVenue.map_url && (
                    <>
                      {nextVenueParts.length > 0 && ' · '}
                      <a href={nextVenue.map_url} target="_blank" rel="noreferrer">Map</a>
                    </>
                  )}
                </p>
              )}
              {countdown && <span className="fixture-countdown">{countdown}</span>}
            </>
          ) : (
            <div className="empty">No fixture scheduled.</div>
          )}
        </section>

        <section className="card home-widget home-result">
          <div className="home-widget-head">
            <div>
              <span className="label">Last time out</span>
              <h2>{lastMatch ? <>{lastMatch.opponent} <VenueBadge venue={lastMatch.venue} /></> : 'Last time out'}</h2>
            </div>
            {lastMatch && <span className="home-widget-note">{formatDate(lastMatch.date)}</span>}
          </div>
          {lastMatch ? (
            <>
              <div className="hr-score">
                <span className="hr-score-value">{lastMatch.goals_for}–{lastMatch.goals_against}</span>
                <span className={`result-pill ${resultOf(lastMatch)}`}>{resultOf(lastMatch)}</span>
              </div>
              {lastCtx.scorers.length > 0 && (
                <p className="hr-line">
                  {lastCtx.scorers.map((a) => `${a.player.name}${a.goals > 1 ? ` ×${a.goals}` : ''}`).join(', ')}
                </p>
              )}
              {lastMotm && (
                <p className="hr-line">MOTM <strong>{lastMotm.player.name}</strong></p>
              )}
              <Link className="more" to={`/matchday/${lastMatch.id}`}>Report & squad →</Link>
            </>
          ) : (
            <div className="empty">No results yet this season.</div>
          )}
        </section>
      </div>

      <LeagueTable season={currentSeason} />

      <section className="card home-widget home-form">
        <div className="home-widget-head">
          <div>
            <span className="label">Momentum</span>
            <h2>Recent form</h2>
          </div>
        </div>
        <div className="home-form-body">
          <div className="home-form-main">
            <FormBadges matches={form} />
            {form.length > 0 && (
              <ul className="home-form-list">
                {form.map((m) => (
                  <li key={m.id}>
                    <Link to={`/matchday/${m.id}`}>
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
          </div>
          {trend.length >= 3 && (
            <div className="home-form-trend">
              <Sparkline values={trend.map((t) => t.points)} stroke={token('--series-2')} />
              <p className="muted home-spark-note">Points accumulated across the season</p>
            </div>
          )}
        </div>
      </section>

      <section className="card home-widget home-stats">
        <div className="home-widget-head">
          <div>
            <span className="label">Overview</span>
            <h2>Season stats</h2>
          </div>
          <Link className="more" to="/season">Full season →</Link>
        </div>
        <div className="home-stats-body">
          <div className="home-stat-tiles">
            <div className="home-stat-tile">
              <b>{summary.played}</b>
              <em className="label">Played</em>
            </div>
            <div className="home-stat-tile">
              <b>{cleanSheets}</b>
              <em className="label">Clean sheets</em>
            </div>
            <div className="home-stat-tile">
              <b>{winRate === null ? '—' : `${winRate}%`}</b>
              <em className="label">Win rate</em>
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
    </div>
  );
}
