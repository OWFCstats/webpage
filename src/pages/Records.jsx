import { useMemo } from 'react';
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
      badges: clubBadges(players, matches, appearances, seasonAwards),
      allTime: playerTotals(players, matches, appearances),
    };
  }, [loading, players, matches, appearances, seasonAwards]);

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const { records, seasons, badges, allTime } = view;

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
        <BadgeBoard badges={badges} />
        <p className="muted card-foot">Every badge has a page of its own — who holds it, and who's closest.</p>
      </div>

      <div className="section">
        <h2>All-time leaders</h2>
        {/* All six, same as Players — the cards this component draws are the
            whole reason this page fits at all now; see Phase 14. */}
        <LeaderBoards rows={allTime} />
        <p className="muted card-foot">Every season together. Players → Leaderboards has one season at a time.</p>
      </div>

      <div className="section">
        <h2>Season by season</h2>
        <SeasonIndex seasons={seasons} />
      </div>
    </div>
  );
}
