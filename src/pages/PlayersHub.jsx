import { useMemo } from 'react';
import { Link, NavLink, Navigate, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, SeasonSelect, Spinner } from '../components/bits';
import LeaderBoards from '../components/LeaderBoards';
import SquadList from '../components/players-hub/SquadList';
import { plural } from '../lib/format';
import { isPlayed, seasonsOf } from '../lib/matches';
import { playerTotals } from '../lib/players';

// Two real sub-pages, and the leaderboard is the default: the board is why a
// player opens this section at all, and the roster is one tap away on
// /players/squad.
const VIEWS = [
  { to: '/players', end: true, label: 'Leaderboards' },
  { to: '/players/squad', end: false, label: 'Squad' },
];

export default function PlayersHub({ view }) {
  const { players, matches, appearances, loading, error } = useData();
  const [params, setParams] = useSearchParams();

  // /players?view=squad was the address before the two views had paths of
  // their own; a link still carrying it lands on the real one.
  if (view === 'leaders' && params.get('view') === 'squad') {
    const carry = new URLSearchParams(params);
    carry.delete('view');
    const qs = carry.toString();
    return <Navigate to={`/players/squad${qs ? `?${qs}` : ''}`} replace />;
  }

  const seasons = seasonsOf(matches);
  // 'latest' rather than a season string: the matches arrive after the first
  // render, so the default can't be resolved in a useState initialiser. The
  // Season page resolves its own the same way.
  const asked = params.get('season') ?? 'latest';
  const season = asked === 'all' || seasons.includes(asked) ? asked : 'latest';
  const activeSeason = season === 'latest' ? seasons[0] : season;

  const pool = useMemo(() => {
    if (loading) return { rows: [], played: 0 };
    const inScope = season === 'all' ? matches : matches.filter((m) => m.season === activeSeason);
    return {
      // A player is in the pool once they were picked, not once they scored:
      // a late withdrawal is part of a squad's record too.
      rows: playerTotals(players, inScope, appearances).filter(
        (r) => r.appearances > 0 || r.dropouts > 0,
      ),
      played: inScope.filter(isPlayed).length,
    };
  }, [loading, season, activeSeason, players, matches, appearances]);

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  // The defaults stay out of the address, so /players is the canonical one and
  // anything else is a link someone meant to share.
  const go = (patch) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value == null) next.delete(key);
      else next.set(key, value);
    }
    setParams(next);
  };

  const scope = season === 'all' ? null : activeSeason;

  // The season carries across to whichever sub-page the control switches to;
  // `view` never belongs in it, since the two views are now paths, not a param.
  const carry = new URLSearchParams(params);
  carry.delete('view');
  const search = carry.toString();

  return (
    <div>
      <div className="section-head">
        <h1>Players</h1>
        <SeasonSelect
          seasons={seasons}
          value={season === 'latest' ? (seasons[0] ?? 'all') : season}
          allLabel="All time"
          onChange={(next) => go({ season: next === seasons[0] ? null : next })}
        />
      </div>

      <nav className="seg" aria-label="Players view">
        {VIEWS.map((v) => (
          <NavLink
            key={v.to}
            to={{ pathname: v.to, search }}
            end={v.end}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            {v.label}
          </NavLink>
        ))}
      </nav>

      {/* No intro line before the first result: "after 0 games" is a worse way
          of saying what the empty state below says properly. */}
      {pool.played > 0 && (
        <p className="muted page-intro">
          {view === 'leaders'
            ? `Where every name stands ${scope ? `in ${scope}` : 'across every season'}, after ${plural(pool.played, 'game', 'games')}.`
            : `${plural(pool.rows.length, 'player', 'players')} ${scope ? `picked in ${scope}` : 'on record'}, most games first.`}{' '}
          Every name links through to a page of their own.
        </p>
      )}

      {pool.played === 0 ? (
        <div className="empty sheet">
          No games played {scope ? `in ${scope}` : 'yet'} — every board here fills in from the
          first result. <Link className="more" to="/season">Fixtures →</Link>
        </div>
      ) : view === 'leaders' ? (
        <>
          <LeaderBoards rows={pool.rows} lead="goals" />
          <p className="muted card-foot">
            {scope ? (
              <>Switch to All time for career totals, or see honours and badges on{' '}
                <Link className="more" to="/records">Records →</Link></>
            ) : (
              <>Honours and badges are on <Link className="more" to="/records">Records →</Link></>
            )}
          </p>
        </>
      ) : (
        <SquadList
          rows={pool.rows}
          scope={scope}
          emptyText={`Nobody was picked ${scope ? `in ${scope}` : 'yet'}.`}
        />
      )}
    </div>
  );
}
