import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crest } from '../bits';
import { countdownParts, formatKickoff, weekdayDate } from '../../lib/format';
import { fixtureIcs, fixtureIcsFilename } from '../../lib/ics';
import { matchHomeAway, opponentInitials, venueTeam } from '../../lib/matches';

function downloadIcs(match, ground) {
  const blob = new Blob([fixtureIcs(match, ground)], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fixtureIcsFilename(match);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * The club band's own plate: the next fixture, home side first and away
 * second by venue — a scoreboard reads by venue, the same convention Phase
 * 20 set for Matchday, not "us" first. Kick-off sits centred between the two
 * sides with the ground under it; the date gets its own ruled line; the
 * countdown is live, in whole days, hours and minutes. *Match details* goes
 * to the fixture's own Matchday page, which already renders an unplayed
 * match as "– vs –" with "Kick-off" in place of "Full time"
 * (`components/matchday/Scoreboard.jsx`) — this card doesn't duplicate that,
 * it only carries what a reader decides *whether to go* from: who, when,
 * where, and how long until.
 */
export default function NextFixture({ next, teams }) {
  // A slow re-render so the tiles count down for a reader who leaves the tab
  // open. The layout harness pins the clock (see scripts/harness.mjs), so
  // this interval never fires during a screenshot and never changes what one
  // shows.
  const [, tick] = useState(0);
  useEffect(() => {
    if (!next) return undefined;
    const id = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, [next]);

  if (!next) {
    return (
      <div className="sheet club-plate fixture-card">
        <span className="block burnt">Next up</span>
        <div className="empty">No fixture scheduled.</div>
      </div>
    );
  }

  const home = matchHomeAway(next);
  const ground = venueTeam(next, teams);
  const parts = countdownParts(next.date, next.kickoff_time);

  return (
    <div className="sheet club-plate fixture-card">
      <span className="block burnt">Next up</span>
      <div className="fixture-teams">
        <span className={`fixture-team ${home.homeIsUs ? 'us' : 'them'}`}>
          {home.homeIsUs
            ? <Crest />
            : <span className="fixture-badge">{opponentInitials(next.opponent)}</span>}
          <strong>{home.homeTeam}</strong>
        </span>
        <div className="fixture-kickoff">
          <span className="fixture-time">{formatKickoff(next.kickoff_time) || 'TBC'}</span>
          {ground?.pitch_name && <span className="fixture-ground">{ground.pitch_name}</span>}
        </div>
        <span className={`fixture-team ${home.homeIsUs ? 'them' : 'us'}`}>
          <strong>{home.awayTeam}</strong>
          {home.homeIsUs
            ? <span className="fixture-badge">{opponentInitials(next.opponent)}</span>
            : <Crest />}
        </span>
      </div>
      <p className="fixture-date">{weekdayDate(next.date)}</p>
      <div className="home-stat-tiles fixture-tiles">
        <div className="home-stat-tile"><b>{parts.days}</b><em className="label">Days</em></div>
        <div className="home-stat-tile"><b>{parts.hours}</b><em className="label">Hrs</em></div>
        <div className="home-stat-tile"><b>{parts.minutes}</b><em className="label">Mins</em></div>
      </div>
      <div className="fixture-actions">
        <button type="button" onClick={() => downloadIcs(next, ground)}>Add to calendar</button>
        <Link className="more" to={`/matchday/${next.id}`}>Match details →</Link>
      </div>
    </div>
  );
}
