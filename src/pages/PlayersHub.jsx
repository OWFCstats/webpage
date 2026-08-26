import { useMemo } from 'react';
import { Link, NavLink, Navigate, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, SeasonSelect, Spinner } from '../components/bits';
import LeaderBoards from '../components/LeaderBoards';
import SeasonBoards from '../components/players-hub/SeasonBoards';
import DataCentre from '../components/players-hub/DataCentre';
import Squad from '../components/players-hub/Squad';
import { squadBadges } from '../lib/awards';
import { plural } from '../lib/format';
import { isPlayed, seasonsOf } from '../lib/matches';
import { playerTotals, seasonPools } from '../lib/players';

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

  // Squad and the data centre are the club's whole history by default — a
  // name or a stat should be findable regardless of which season it happened
  // in — narrowed to one season only when a visitor asks for it. Leaderboards
  // reads every season itself (see below) and has no use for this param.
  const askedSeason = params.get('season');
  const scopeSeason = askedSeason && seasons.includes(askedSeason) ? askedSeason : 'all';
  const scope = scopeSeason === 'all' ? null : scopeSeason;

  // The roster's two layouts are one address apart, so either can be linked to
  // and — the reason it isn't just component state — measured by the harness.
  // Cards is the default now, so `?layout=list` is the one that appears in an
  // address: the defaults stay out of it, and the cards are the view that shows
  // the badges.
  const layout = params.get('layout') === 'list' ? 'list' : 'cards';

  const scopePool = useMemo(() => {
    if (loading || view === 'leaders') return { rows: [], played: 0 };
    const inScope = scope ? matches.filter((m) => m.season === scope) : matches;
    return {
      // A player is in the pool once they were picked, not once they scored:
      // a late withdrawal is part of a squad's record too.
      rows: playerTotals(players, inScope, appearances).filter(
        (r) => r.appearances > 0 || r.dropouts > 0,
      ),
      played: inScope.filter(isPlayed).length,
    };
  }, [loading, view, scope, players, matches, appearances]);

  // Leaderboards: one pool per season the club has ever recorded a row for,
  // current flagged — the current one renders open, every other one is the
  // collapsible archive `SeasonBoards` draws underneath it.
  const seasonBoards = useMemo(
    () => (loading || view !== 'leaders' ? [] : seasonPools(players, matches, appearances)),
    [loading, view, players, matches, appearances],
  );
  const currentBoard = seasonBoards.find((b) => b.current) ?? null;

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
  const clearScope = () => go({ season: null });

  // `season` carries across to whichever sub-page the control switches to, so
  // a year picked on the data centre is still picked on the squad; `layout`
  // belongs to the roster alone. `stat` is a leftover from the data centre's
  // old stat-group switcher and answers to nothing any more, so a link that
  // still carries it drops it rather than pass it on.
  const carry = new URLSearchParams(params);
  carry.delete('view');
  carry.delete('layout');
  carry.delete('stat');
  const search = carry.toString();

  // Whether the club has ever recorded a result at all — the one case that
  // still earns the page's single empty state. A current season with nothing
  // played yet, but history behind it, is not this: the archive still has
  // something to show, so the leaderboard branch below handles that itself.
  const everPlayed = view === 'leaders'
    ? seasonBoards.some((b) => b.played > 0)
    : scopePool.played > 0;

  return (
    <div>
      <div className="section-head">
        <h1>Players</h1>
        {/* Leaderboards has no season control of its own — every season is on
            the page, current open and the rest collapsed below it. No "All
            time" option either way: that combined board is Records'. */}
        {view !== 'leaders' && (
          <SeasonSelect
            seasons={seasons}
            value={scopeSeason}
            allowAll
            allLabel="All time"
            onChange={(next) => go({ season: next === 'all' ? null : next })}
          />
        )}
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

      {!everPlayed ? (
        <div className="empty sheet">
          No games played {scope ? `in ${scope}` : 'yet'} — every board here fills in from the
          first result. <Link className="more" to="/season">Fixtures →</Link>
        </div>
      ) : view === 'leaders' ? (
        <>
          {/* everPlayed guarantees seasonBoards is non-empty, so there is
              always a current board here — either from a played game this
              season or, per currentSeasonOf's own fallback, the most recent
              season with a row at all. */}
          {currentBoard.played > 0 ? (
            <>
              <p className="muted page-intro">
                Where every name stands in {currentBoard.season}, after{' '}
                {plural(currentBoard.played, 'game', 'games')}. Every name links through to a page
                of their own.
              </p>
              <LeaderBoards rows={currentBoard.rows} />
            </>
          ) : (
            // No games played yet this season, but there's history below: the
            // site's own rule against a fixture-only season blanking the page,
            // applied to a board rather than to Home's summary tiles.
            <p className="muted page-intro">
              No games played in {currentBoard.season} yet — every board here fills in from the
              first result.
            </p>
          )}
          <SeasonBoards boards={seasonBoards} />
          <p className="muted card-foot">
            Every season together on{' '}
            <Link className="more" to="/records/all-time">Records → All-time</Link>
          </p>
        </>
      ) : (
        <>
          <p className="muted page-intro">
            {view === 'data'
              ? `Every stat for ${plural(scopePool.rows.length, 'player', 'players')} ${scope ? `picked in ${scope}` : 'the club has ever picked'}.`
              : `${plural(scopePool.rows.length, 'player', 'players')} ${scope ? `picked in ${scope}` : 'the club has ever picked'}, most games first.`}{' '}
            Every name links through to a page of their own.
          </p>
          {view === 'data' ? (
            <DataCentre rows={scopePool.rows} scope={scope} onSearchAllTime={clearScope} />
          ) : (
            <Squad
              rows={scopePool.rows}
              badges={badges}
              layout={layout}
              onLayout={(next) => go({ layout: next === 'cards' ? null : next })}
              scope={scope}
              onSearchAllTime={clearScope}
              emptyText={`Nobody was picked ${scope ? `in ${scope}` : 'yet'}.`}
            />
          )}
        </>
      )}
    </div>
  );
}
