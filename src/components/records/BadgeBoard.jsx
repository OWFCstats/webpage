import { Link } from 'react-router-dom';
import BadgeIcon from '../BadgeIcon';
import { plural } from '../../lib/format';

/** The three sizes on this page, each stated where the reason for it is. A
 *  career card's drawing is the biggest thing on the card and can afford 52; a
 *  trophy in the strip is the point of the strip, which is why it gets 64 and
 *  the strip got taller to hold it.
 *
 *  The stackables get 48 rather than 40 because of the hat-trick: it is the one
 *  drawing wider than it is tall — three footballs at 1.57 — and a square slot
 *  contains it to 63% of the slot's height, so beside the MOTM star at the same
 *  size it reads as the smaller badge. 48 is where the three balls separate.
 *  This is the row that can afford it: it is a flex row rather than an aligned
 *  column, so nothing downstream depends on the slot staying 40. */
const SIZE = { career: 52, event: 48, trophy: 64 };

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
 * A rung counts who is standing on it, not who has ever passed through it: a
 * player holds one metal, so the four rungs add up to the holder count in the
 * card's head rather than each repeating it (`DESIGN.md` → *A badge has its own
 * page*). Which is why a low rung can grey out while a higher one has metal on
 * it — everybody who reached it has moved up.
 *
 * A badge nobody in the club holds draws its **bronze** artwork, greyed — the
 * rung somebody is next in line for rather than a silhouette or a prize three
 * tiers away. `badge.top` being null is what says so, and `BadgeIcon` does the
 * greying; nothing here needs to know which drawing that is.
 *
 * The trophies carry no names here. The cabinet on the honours page holds those
 * season by season, and the four drawings are the way through to a badge's own
 * page rather than a second copy of the same four names.
 */
export default function BadgeBoard({ badges }) {
  return (
    <>
      <h3 className="label ruled">Career badges — four metals</h3>
      <div className="grid badge-cards">
        {badges.career.map((badge) => (
          <Link key={badge.key} className="sheet badge-card" to={`/records/badges/${badge.key}`}>
            <div className="badge-card-head">
              <BadgeIcon badge={badge.key} metal={badge.top} size={SIZE.career} />
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
            <BadgeIcon badge={badge.key} metal={badge.awarded > 0 ? 'gold' : null} size={SIZE.event} />
            <span className="what">
              <strong>{badge.label}</strong>
              <span className="muted">{eventLine(badge)}</span>
            </span>
            <span className="count">{badge.awarded > 0 ? `×${badge.awarded}` : '—'}</span>
          </Link>
        ))}
      </div>

      <h3 className="label ruled section">Season honours — one a season</h3>
      <div className="board trophy-cabinet">
        <div className="trophy-strip">
          {badges.trophies.map((badge) => (
            <Link key={badge.key} to={`/records/badges/${badge.key}`}>
              <BadgeIcon badge={badge.key} metal={badge.wins.length > 0 ? 'gold' : null} size={SIZE.trophy} />
              {badge.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
