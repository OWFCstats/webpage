import { Link } from 'react-router-dom';
import { Crest, VenueBadge } from '../bits';
import { countdownLabel, formatDate, formatKickoff } from '../../lib/format';

/** A compact row — who, when, and where. Full logistics (kickoff, ground,
 *  map) live on the fixture's own Matchday page, a tap away — the same trade
 *  Season's own upcoming list makes (see UpcomingFixtures). */
export default function NextFixture({ next }) {
  const countdown = next ? countdownLabel(next.date) : null;
  const kickoff = next ? formatKickoff(next.kickoff_time) : '';
  return (
    <section className="sheet home-widget home-next">
      <div className="block burnt">Upcoming</div>
      {next ? (
        <Link to={`/matchday/${next.id}`} className="fixture-row">
          <Crest />
          <span className="fixture-row-body">
            <strong>{next.opponent}</strong>
            <span className="muted">
              {formatDate(next.date)}{kickoff && ` · ${kickoff}`} <VenueBadge venue={next.venue} />
            </span>
          </span>
          {countdown && <span className="fixture-countdown">{countdown}</span>}
        </Link>
      ) : (
        <div className="empty">No fixture scheduled.</div>
      )}
    </section>
  );
}
