import { useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, Spinner } from '../components/bits';
import LeaderBoards from '../components/LeaderBoards';
import BadgeBoard from '../components/records/BadgeBoard';
import ClubRecords from '../components/records/ClubRecords';
import HonoursBoard from '../components/records/HonoursBoard';
import SeasonIndex from '../components/records/SeasonIndex';
import { plural } from '../lib/format';
import { playerTotals } from '../lib/players';
import { clubBadges, clubRecords, seasonRecords } from '../lib/awards';

// Three real sub-pages, and Badges is the default: the badges are what this
// section is for, and five sections on one page came to 4,841px on a phone —
// past the point where anything below the fold exists at all.
const VIEWS = [
  { to: '/records', end: true, label: 'Badges' },
  { to: '/records/honours', end: false, label: 'Honours' },
  { to: '/records/all-time', end: false, label: 'All-time' },
];

/** Each sub-page derives only what it shows. The badge pass walks every
 *  appearance in date order, and there is no reason to do that on the page
 *  showing the season index. */
function derive(view, { players, matches, appearances, seasonAwards }) {
  if (view === 'honours') return { seasons: seasonRecords(players, matches, appearances, seasonAwards) };
  if (view === 'all-time') {
    return { records: clubRecords(matches), allTime: playerTotals(players, matches, appearances) };
  }
  return { badges: clubBadges(players, matches, appearances, seasonAwards) };
}

/**
 * The marks the club is measured against — the things that appear nowhere
 * else. A single season is read on Season, a single player on their own page;
 * this is what sits above both, and it is all time. Players is this season.
 */
export default function Records({ view }) {
  const { players, matches, appearances, seasonAwards, loading, error } = useData();

  const data = useMemo(
    () => (loading ? null : derive(view, { players, matches, appearances, seasonAwards })),
    [loading, view, players, matches, appearances, seasonAwards],
  );

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  return (
    <div>
      <h1>Records</h1>

      <nav className="seg" aria-label="Records view">
        {VIEWS.map((v) => (
          <NavLink
            key={v.to}
            to={v.to}
            end={v.end}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            {v.label}
          </NavLink>
        ))}
      </nav>

      {/* The tab is each sub-page's heading, so what leads it carries no
          second one; a section under it does. */}
      {view === 'badges' && (
        <>
          <p className="muted page-intro">
            Ten badges in three classes, and every one has a page of its own — who holds it,
            and who's closest.
          </p>
          <BadgeBoard badges={data.badges} />
        </>
      )}

      {view === 'honours' && (
        <>
          <p className="muted page-intro">
            Who won what, {plural(data.seasons.length, 'season', 'seasons')} on record.
          </p>
          <HonoursBoard seasons={data.seasons} />
          <div className="section">
            <h2>Season by season</h2>
            <SeasonIndex seasons={data.seasons} />
          </div>
        </>
      )}

      {view === 'all-time' && (
        <>
          <p className="muted page-intro">
            {data.records.played === 0 ? (
              'Nothing on record yet — every board here fills in from the first result.'
            ) : (
              <>
                {plural(data.records.played, 'game', 'games')} on record, every season
                together — <Link className="more" to="/players">Players</Link> has this
                season on its own.
              </>
            )}
          </p>
          <LeaderBoards rows={data.allTime} />
          <div className="section">
            <h2>Club records</h2>
            <ClubRecords records={data.records} />
          </div>
        </>
      )}
    </div>
  );
}
