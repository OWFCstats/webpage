import ResultList from '../ResultList';

/** What's still to play, on the same row every scoreline on the site reads
 *  from — full logistics (kickoff, ground, map) live on the fixture's own
 *  Matchday page, a tap away. Renders nothing at the end of a season rather
 *  than an empty list. */
export default function UpcomingFixtures({ upcoming }) {
  if (upcoming.length === 0) return null;
  return (
    <div className="flat-block">
      <div className="block burnt">Upcoming</div>
      <ResultList matches={upcoming} showMeta emptyText="Nothing upcoming yet." />
    </div>
  );
}
