import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { VenueBadge } from './bits';
import { dayMonth, formatDate, formatKickoff } from '../lib/format';
import { isPlayed, opponentTeam, resultOf } from '../lib/matches';

/**
 * The opponent twice over, and CSS picks which one is read. Below 900px the
 * rung is too narrow for "Old Amplefordians" and a name clipped mid-word is
 * the bug DESIGN.md names, so the club's own `short_name` is shown instead —
 * a column the schema already has, and a name the club chose rather than a
 * truncation. It's nullable, and a club that hasn't got one just keeps its
 * full name at every width.
 */
function Opponent({ match, teams }) {
  const short = opponentTeam(match, teams)?.short_name;
  return (
    <span className="op">
      {short && short !== match.opponent ? (
        <>
          <span className="full">{match.opponent}</span>
          <span className="short">{short}</span>
        </>
      ) : (
        match.opponent
      )}
      <VenueBadge venue={match.venue} />
    </span>
  );
}

function Rung({ match, gd, teams, current, next }) {
  const played = isPlayed(match);
  const result = resultOf(match);
  const kickoff = formatKickoff(match.kickoff_time);
  const label = played
    ? `${formatDate(match.date)} vs ${match.opponent}, ${match.goals_for}–${match.goals_against}`
    : `${formatDate(match.date)} vs ${match.opponent}, to play`;

  return (
    <Link
      to={`/matchday/${match.id}`}
      className={`rung${played ? '' : ' fixture'}${current ? ' now' : ''}`}
      aria-label={label}
      aria-current={current ? 'page' : undefined}
    >
      <span className="dt">{dayMonth(match.date)}</span>
      <Opponent match={match} teams={teams} />
      {played ? (
        <>
          <span className="sc">{match.goals_for}–{match.goals_against}</span>
          {/* The running figure, not this game's — a minus sign rather than a
              hyphen, because it is a quantity and not a scoreline. */}
          <span className="gd">{gd > 0 ? `+${gd}` : gd === 0 ? '0' : `−${Math.abs(gd)}`}</span>
          <span className={`result-pill ${result}`}>{result}</span>
        </>
      ) : (
        <span className="ahead">
          <span className="sc">{kickoff || 'To play'}</span>
          {next && <span className="block verdigris">Next</span>}
        </span>
      )}
    </Link>
  );
}

/**
 * The season, whole: one rung per game, newest first, with the running goal
 * difference down the right. It replaces four objects that each said part of
 * it — an archive stepper, a strip of coloured chips, a form strip repeating
 * those chips, and a next-fixture card repeating Home.
 *
 * `children` open under the current rung, which is how the match being read
 * sits inside its own season rather than above it. A caller with no current
 * match (Season) passes neither and gets one unbroken ladder.
 */
export default function SeasonLadder({ rungs, season, currentId, teams, children }) {
  if (rungs.length === 0) return null;
  const soonest = rungs.filter((r) => !isPlayed(r.match)).at(-1)?.match.id;

  return (
    <section className="season-ladder section">
      <div className="ladder-head">
        <h2>{season}</h2>
        <span className="cap">running goal difference</span>
      </div>
      <div className="ladder">
        {rungs.map(({ match, gd }) => {
          const current = match.id === currentId;
          return (
            <Fragment key={match.id}>
              <Rung
                match={match}
                gd={gd}
                teams={teams}
                current={current}
                next={match.id === soonest}
              />
              {current && children}
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
