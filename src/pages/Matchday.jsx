import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, FormBadges, Spinner, StatTile, VenueBadge, VenueFilter } from '../components/bits';
import BarBoard from '../components/BarBoard';
import {
  countdownLabel,
  fixtures,
  formatDate,
  formOf,
  latestResult,
  matchContext,
  matchTitle,
  playerTotals,
  resultOf,
  seasonsOf,
  seasonSummary,
  slugify,
} from '../lib/stats';

// The chips drive one board, not six stacked ones. Club gold leads; the
// accents repeat the palette already used across the site.
const BOARDS = [
  { key: 'goals', label: 'Goals', accent: '#b8860b' },
  { key: 'assists', label: 'Assists', accent: '#5ba3c9' },
  { key: 'goalInvolvements', label: 'G+A', accent: '#e8772e' },
  { key: 'appearances', label: 'Apps', accent: '#3f4149' },
  { key: 'motm', label: 'MOTM', accent: '#b8860b' },
];

export default function Matchday() {
  const { players, matches, appearances, loading, error } = useData();
  const [board, setBoard] = useState('goals');
  const [venueFilter, setVenueFilter] = useState('all');

  const view = useMemo(() => {
    const seasons = seasonsOf(matches);
    const currentSeason = seasons[0];
    const seasonMatches = currentSeason
      ? matches.filter((m) => m.season === currentSeason)
      : [];
    const latest = latestResult(seasonMatches);
    return {
      currentSeason,
      latest,
      latestCtx: latest ? matchContext(latest, players, matches, appearances) : null,
      seasonMatches,
      next: fixtures(matches)[0],
      totals: playerTotals(players, seasonMatches, appearances),
    };
  }, [players, matches, appearances]);

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const { currentSeason, latest, latestCtx, seasonMatches, next, totals } = view;
  const scoped = venueFilter === 'all' ? seasonMatches : seasonMatches.filter((m) => m.venue === venueFilter);
  const summary = seasonSummary(scoped);
  const form = formOf(scoped);
  const points = summary.won * 3 + summary.drawn;
  const star = latestCtx?.motm[0];

  if (matches.length === 0 && players.length === 0) {
    return (
      <div className="empty card">
        <h1>Old Wellingtonians FC</h1>
        <p>No data yet. Once the first players and matches are entered, stats will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      {latest ? (
        <Link to={`/matches/${latest.id}`} className="latest-hero" aria-label={`Match centre: vs ${matchTitle(latest)}`}>
          <p className="meta">
            {formatDate(latest.date)} · {latest.competition} · {latest.season}
          </p>
          <h1>Old Wellingtonians vs {matchTitle(latest)}</h1>
          <p className="scoreline">
            {latest.goals_for}–{latest.goals_against}{' '}
            <span className={`result-pill ${resultOf(latest)}`}>{resultOf(latest)}</span>
          </p>
          {latestCtx.scorers.length > 0 && (
            <p className="scorers">
              {latestCtx.scorers
                .map((a) => `${a.player.name}${a.goals > 1 ? ` ×${a.goals}` : ''}`)
                .join(', ')}
            </p>
          )}
          {star && (
            <div className="star-man">
              <span className="avatar">
                {star.player.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </span>
              <span className="who">
                <strong>{star.player.name}</strong>
                Man of the Match
                {star.goals + star.assists > 0 &&
                  ` · ${[
                    star.goals > 0 && `${star.goals} goal${star.goals > 1 ? 's' : ''}`,
                    star.assists > 0 && `${star.assists} assist${star.assists > 1 ? 's' : ''}`,
                  ].filter(Boolean).join(', ')}`}
              </span>
            </div>
          )}
          <span className="more-hint">Match centre →</span>
        </Link>
      ) : (
        <div className="section-head">
          <h1>{currentSeason ? `Season ${currentSeason}` : 'Old Wellingtonians FC'}</h1>
        </div>
      )}

      <div className="card section form-next">
        <div>
          <div className="mini-label">Form</div>
          <FormBadges matches={[...form].reverse()} />
        </div>
        {next && (
          <div className="next-up">
            <div className="mini-label">Next up</div>
            <strong>
              <Link to={`/opponents/${slugify(next.opponent)}`}>{next.opponent}</Link>{' '}
              <VenueBadge venue={next.venue} />
            </strong>
            <span className="muted">{formatDate(next.date)} · {next.competition}</span>
            {countdownLabel(next.date) && <span className="muted">{countdownLabel(next.date)}</span>}
          </div>
        )}
      </div>

      <div className="controls">
        <span>Scope</span>
        <VenueFilter value={venueFilter} onChange={setVenueFilter} />
      </div>

      <div className="grid cols-4 section">
        <StatTile value={points} label="Points" />
        <StatTile value={`${summary.won}-${summary.drawn}-${summary.lost}`} label="W-D-L" />
        <StatTile value={summary.goalsFor} label="Goals scored" />
        <StatTile value={summary.goalsAgainst} label="Goals conceded" />
      </div>

      <div className="section">
        <div className="section-head">
          <h2>Leading the club — {currentSeason}</h2>
          <Link className="more" to="/players">All players →</Link>
        </div>
        <div className="chip-row">
          {BOARDS.map((b) => (
            <button
              key={b.key}
              type="button"
              className={`chip-btn${board === b.key ? ' active' : ''}`}
              onClick={() => setBoard(b.key)}
            >
              {b.label}
            </button>
          ))}
        </div>
        <BarBoard
          title={BOARDS.find((b) => b.key === board).label}
          rows={totals}
          statKey={board}
          accent={BOARDS.find((b) => b.key === board).accent}
          limit={5}
        />
      </div>

      <div className="section">
        <div className="section-head">
          <h2>Recent results</h2>
          <Link className="more" to="/season">Full season →</Link>
        </div>
        <div className="card">
          <div className="table-wrap">
            <table className="data">
              <tbody>
                {form.map((m) => (
                  <tr key={m.id}>
                    <td><span className={`result-pill ${resultOf(m)}`}>{resultOf(m)}</span></td>
                    <td>{formatDate(m.date)}</td>
                    <td>
                      <Link to={`/matches/${m.id}`}>vs {m.opponent}</Link> <VenueBadge venue={m.venue} />
                    </td>
                    <td className="num"><strong>{m.goals_for}–{m.goals_against}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {form.length === 0 && <div className="empty">No results yet this season.</div>}
        </div>
      </div>
    </div>
  );
}
