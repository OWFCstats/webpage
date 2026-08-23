import { Link } from 'react-router-dom';
import BadgeIcon from '../BadgeIcon';
import { plural } from '../../lib/format';

/** What a career badge has come to in the club: how many hold it and who has
 *  most. A badge nobody holds says so — the club is early, not empty. */
function heldLine(badge) {
  if (badge.holders === 0) return badge.team ? 'The club has never kept one' : 'Nobody yet';
  return `${plural(badge.holders, 'holder', 'holders')} · ${badge.leader.player.name} on ${badge.leader.count}`;
}

/** The same line for a stackable, where the count is already printed at the
 *  right-hand edge: one holder is a name, not a tally of one. */
function eventLine(badge) {
  if (badge.awarded === 0) return 'Not won yet';
  if (badge.holders === 1) return badge.leader.player.name;
  return `${plural(badge.holders, 'player', 'players')} · ${badge.leader.player.name} on ${badge.leader.count}`;
}

/**
 * The badge board: four career badges, two stackables and four trophies. Not
 * twenty-four plates — the ladder this replaced printed every category three
 * times and said "Nobody yet" nineteen times over.
 *
 * The trophies carry no names here. The honours board immediately above holds
 * them season by season, and the four icons are the way through to a badge's
 * own page rather than a second copy of the same four names.
 */
export default function BadgeBoard({ badges }) {
  return (
    <>
      <h3 className="label ruled">Career badges — four metals</h3>
      <div className="grid badge-cards">
        {badges.career.map((badge) => (
          <Link key={badge.key} className="sheet badge-card" to={`/records/badges/${badge.key}`}>
            <div className="badge-card-head">
              <BadgeIcon badge={badge.key} metal={badge.top} size={44} />
              <div>
                <h3>{badge.label}</h3>
                <span className="badge-holds">{heldLine(badge)}</span>
              </div>
            </div>
            <ol className="badge-ladder">
              {badge.tiers.map((tier) => (
                <li
                  key={tier.metal}
                  className={`badge-rung ${tier.metal}${tier.holders === 0 ? ' unheld' : ''}`}
                >
                  <span className="bead" />
                  <span className="at">{tier.threshold}</span>
                  {tier.holders === 0 ? 'nobody' : `${tier.holders} hold`}
                </li>
              ))}
            </ol>
          </Link>
        ))}
      </div>

      <h3 className="label ruled section">Events — they stack</h3>
      <div className="sheet">
        {badges.events.map((badge) => (
          <Link key={badge.key} className="badge-line" to={`/records/badges/${badge.key}`}>
            <BadgeIcon badge={badge.key} metal={badge.awarded > 0 ? 'gold' : null} size={34} />
            <span className="what">
              <strong>{badge.label}</strong>
              <span className="muted">{eventLine(badge)}</span>
            </span>
            <span className="count">{badge.awarded > 0 ? `×${badge.awarded}` : '—'}</span>
          </Link>
        ))}
      </div>

      <h3 className="label ruled section">Season honours — one a season</h3>
      <div className="board">
        <div className="trophy-strip">
          {badges.trophies.map((badge) => (
            <Link key={badge.key} to={`/records/badges/${badge.key}`}>
              <BadgeIcon
                badge={badge.key}
                metal={badge.wins.length > 0 ? 'gold' : null}
                on="board"
                size={40}
              />
              {badge.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
