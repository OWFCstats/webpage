import { useMemo } from 'react';
import { Link, NavLink, Navigate, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, SeasonSelect, Spinner } from '../components/bits';
import LeaderBoards from '../components/LeaderBoards';
import DataCentre from '../components/players-hub/DataCentre';
import Squad from '../components/players-hub/Squad';
import { squadBadges } from '../lib/awards';
import { plural } from '../lib/format';
import { isPlayed, seasonsOf } from '../lib/matches';
import { playerTotals } from '../lib/players';

// Three real sub-pages, and the leaderboard is the default: the board is why
// a player opens this section at all, the roster is one tap away on
// /players/squad, and the full stats table is one more on /players/data.
const VIEWS = [
  { to: '/players', end: true, label: 'Leaderboards' },
  { to: '/players/squad', end: false, label: 'Squad' },
  { to: '/players/data', end: false, label: 'Data centre' },
];

export default function PlayersHub({ view }) {
  const { players, matches, appearances, seasonAwards, loading, error } = useData();
  const [params, setParams] = useSearchParams();

  const seasons = seasonsOf(matches);
  // 'latest' rather than a season string: the matches arrive after the first
  // render, so the default can't be resolved in a useState initialiser. The
  // Season page resolves its own the same way.
  const asked = params.get('season') ?? 'latest';
  const season = seasons.includes(asked) ? asked : 'latest';
  const activeSeason = season === 'latest' ? seasons[0] : season;

  // The roster's two layouts are one address apart, so the cards can be linked
  // to and — the reason it isn't just component state — measured by the harness.
  const layout = params.get('layout') === 'cards' ? 'cards' : 'list';

  const pool = useMemo(() => {
    if (loading) return { rows: [], played: 0 };
    const inScope = matches.filter((m) => m.season === activeSeason);
    return {
      // A player is in the pool once they were picked, not once they scored:
      // a late withdrawal is part of a squad's record too.
      rows: playerTotals(players, inScope, appearances).filter(
        (r) => r.appearances > 0 || r.dropouts > 0,
      ),
      played: inScope.filter(isPlayed).length,
    };
  }, [loading, season, activeSeason, players, matches, appearances]);

  // The badges the cards draw. Career-wide and therefore season-independent,
  // and only the squad view has anywhere to put them — a leaderboard that never
  // renders one shouldn't pay a pass over the appearance log for it.
  const badges = useMemo(
    () => (loading || view !== 'squad'
      ? null
      : squadBadges(players, matches, appearances, seasonAwards)),
    [loading, view, players, matches, appearances, seasonAwards],
  );

  // /players?view=squad was the address before the two views had paths of
  // their own; a link still carrying it lands on the real one.
  //
  // After the hooks, and it has to be: React Router renders the new address
  // through this same component, so a redirect that returned before the two
  // useMemos above made the second render throw "Rendered more hooks than
  // during the previous render" and took the whole page down with it. The shim
  // has been crashing since it was written, on the one address it exists for.
  if (view === 'leaders' && params.get('view') === 'squad') {
    const legacy = new URLSearchParams(params);
    legacy.delete('view');
    const qs = legacy.toString();
    return <Navigate to={`/players/squad${qs ? `?${qs}` : ''}`} replace />;
  }

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

  const scope = activeSeason;

  // The season carries across to whichever sub-page the control switches to;
  // `view` never belongs in it, since the three views are now paths, not a
  // param, and neither does `layout` or `stat` — they belong to the roster and
  // the data centre respectively, and the other two views have no use for a
  // param they can't answer to.
  const carry = new URLSearchParams(params);
  carry.delete('view');
  carry.delete('layout');
  carry.delete('stat');
  const search = carry.toString();

  return (
    <div>
      <div className="section-head">
        <h1>Players</h1>
        {/* No "All time" option here — that board is Records', reached once
            rather than from both sections on the same component. */}
        <SeasonSelect
          seasons={seasons}
          value={season === 'latest' ? (seasons[0] ?? '') : season}
          allowAll={false}
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
            : view === 'data'
            ? `Every stat for ${plural(pool.rows.length, 'player', 'players')} ${scope ? `picked in ${scope}` : 'on record'}.`
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
          <LeaderBoards rows={pool.rows} />
          {/* One line, because Leaderboards has 30px of its 1,400px budget
              spare and a second line of footer costs 22 of them. */}
          <p className="muted card-foot">
            Every season together on{' '}
            <Link className="more" to="/records/all-time">Records → All-time</Link>
          </p>
        </>
      ) : view === 'data' ? (
        <DataCentre
          rows={pool.rows}
          scope={scope}
          stat={params.get('stat')}
          onStat={(next) => go({ stat: next === 'playing' ? null : next })}
        />
      ) : (
        <Squad
          rows={pool.rows}
          badges={badges}
          layout={layout}
          onLayout={(next) => go({ layout: next === 'list' ? null : next })}
          scope={scope}
          emptyText={`Nobody was picked ${scope ? `in ${scope}` : 'yet'}.`}
        />
      )}
    </div>
  );
}
