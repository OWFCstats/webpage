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

const pad = (n) => String(n).padStart(2, '0');

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
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!next) return undefined;
    const id = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, [next]);
  // A new "next" fixture (the old one was played, or an earlier one was
  // added) means the last save no longer describes what's on the card.
  useEffect(() => { setSaved(false); }, [next?.id]);

  if (!next) {
    return (
      <div className="sheet club-plate fixture-card">
        <span className="block gold">Next match</span>
        <div className="empty">No fixture scheduled.</div>
      </div>
    );
  }

  const home = matchHomeAway(next);
  const ground = venueTeam(next, teams);
  const parts = countdownParts(next.date, next.kickoff_time);
  const kickoff = formatKickoff(next.kickoff_time);

  return (
    <div className="sheet club-plate fixture-card">
      <div className="nm-head">
        <span className="block gold">Next match</span>
        {next.competition && <span className="tag">{next.competition}</span>}
      </div>

      <div className="nm-teams">
        <div className="nm-team">
          <span className={`nm-badge ${home.homeIsUs ? 'us' : 'them'}`}>
            {home.homeIsUs
              ? <Crest />
              : opponentInitials(next.opponent)}
          </span>
          <strong>{home.homeTeam}</strong>
          <em>Home</em>
        </div>
        <div className="nm-mid">
          <span className="vs">vs</span>
          <span className="time">{kickoff || 'TBC'}</span>
          {ground?.pitch_name && <span className="where">{ground.pitch_name}</span>}
        </div>
        <div className="nm-team">
          <span className={`nm-badge ${home.homeIsUs ? 'them' : 'us'}`}>
            {home.homeIsUs
              ? opponentInitials(next.opponent)
              : <Crest />}
          </span>
          <strong>{home.awayTeam}</strong>
          <em>Away</em>
        </div>
      </div>

      <p className="nm-date">{weekdayDate(next.date)}</p>

      <div className="home-stat-tiles nm-count">
        <div className="tile"><b>{pad(parts.days)}</b><em className="label">Days</em></div>
        <div className="tile"><b>{pad(parts.hours)}</b><em className="label">Hrs</em></div>
        <div className="tile"><b>{pad(parts.minutes)}</b><em className="label">Min</em></div>
      </div>

      <div className="nm-actions">
        <button
          type="button"
          onClick={() => { downloadIcs(next, ground); setSaved(true); }}
        >
          Add to calendar
        </button>
        <Link className="btn secondary" to={`/matchday/${next.id}`}>Match details</Link>
      </div>
      {saved && (
        <p className="nm-said">
          Saved to your calendar, {weekdayDate(next.date).replace(/ \d{4}$/, '')}{kickoff ? ` ${kickoff}` : ''}.
        </p>
      )}
    </div>
  );
}
