import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, SeasonSelect, Spinner } from '../components/bits';
import LeaderBoards from '../components/LeaderBoards';
import SquadList from '../components/players-hub/SquadList';
import { plural } from '../lib/format';
import { isPlayed, seasonsOf } from '../lib/matches';
import { playerTotals } from '../lib/players';

// Two views, one nav entry, and the leaderboard lands first: the board is why a
// player opens this page at all, and the roster is one tap behind it.
const VIEWS = [
  { key: 'leaders', label: 'Leaderboards' },
  { key: 'squad', label: 'Squad' },
];

export default function PlayersHub() {
  const { players, matches, appearances, loading, error } = useData();
  const [params, setParams] = useSearchParams();

  const seasons = seasonsOf(matches);
  const view = params.get('view') === 'squad' ? 'squad' : 'leaders';
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

      <div className="seg" role="tablist" aria-label="Players view">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            role="tab"
            aria-selected={view === v.key}
            className={view === v.key ? 'active' : undefined}
            onClick={() => go({ view: v.key === 'leaders' ? null : v.key })}
          >
            {v.label}
          </button>
        ))}
      </div>

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
            {scope
              ? 'Switch the season to All time for the club’s all-time leaders.'
              : 'Every season together.'}{' '}
            The honours board and the badge board are on{' '}
            <Link className="more" to="/records">Records →</Link>
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
