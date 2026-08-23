import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, Spinner } from '../components/bits';
import LeaderBoards from '../components/LeaderBoards';
import PlateShelf from '../components/Plate';
import ClubRecords from '../components/records/ClubRecords';
import HonoursBoard from '../components/records/HonoursBoard';
import SeasonIndex from '../components/records/SeasonIndex';
import { plural } from '../lib/format';
import { playerTotals } from '../lib/players';
import { clubPlates, clubRecords, seasonRecords } from '../lib/awards';

/**
 * The marks the club is measured against — the things that appear nowhere
 * else. A single season is read on Season, a single player on their own page;
 * this is what sits above both.
 */
export default function Records() {
  const { players, matches, appearances, seasonAwards, loading, error } = useData();

  const view = useMemo(() => {
    if (loading) return null;
    return {
      records: clubRecords(matches),
      seasons: seasonRecords(players, matches, appearances, seasonAwards),
      plates: clubPlates(players, matches, appearances),
      allTime: playerTotals(players, matches, appearances),
    };
  }, [loading, players, matches, appearances, seasonAwards]);

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const { records, seasons, plates, allTime } = view;

  return (
    <div>
      <h1>Records &amp; honours</h1>
      <p className="muted page-intro">
        {records.played > 0
          ? `${plural(records.played, 'game', 'games')} on record across ${plural(seasons.length, 'season', 'seasons')}.`
          : 'Nothing on record yet.'}{' '}
        A record nobody holds is still named below — the club is early, not empty.
      </p>

      <div className="section">
        <h2>Club records</h2>
        <ClubRecords records={records} />
      </div>

      <div className="section">
        <h2>Honours board</h2>
        <HonoursBoard seasons={seasons} />
      </div>

      <div className="section">
        <h2>Badge board</h2>
        <PlateShelf plates={plates} />
        <p className="muted card-foot">Every badge in the club, and who's closest to the next one.</p>
      </div>

      <div className="section">
        <h2>All-time leaders</h2>
        {/* Three of the six, because Records is about the marks above any one
            season and this page is already long. The same component draws the
            full set on Players, so the two can't drift apart. */}
        <LeaderBoards rows={allTime} stats={['goals', 'appearances', 'motm']} limit={5} />
        <p className="muted card-foot">
          Every season together.{' '}
          <Link className="more" to="/players?season=all">Players → All time</Link> has every
          board, and a season at a time.
        </p>
      </div>

      <div className="section">
        <h2>Season by season</h2>
        <SeasonIndex seasons={seasons} />
      </div>
    </div>
  );
}
