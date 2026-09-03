import BadgeIcon from '../BadgeIcon';
import { initials } from '../../lib/format';

/** What a badge draws at in the hero band. 34px rather than the shelf's 40: the
 *  band already carries a 62px crest, a headline and five figures, and the row
 *  here is a glance at what somebody has rather than the section that names each
 *  one. At the 24px it was, a crest's frame and the thing inside it were one
 *  blob — which is the whole reason the club redrew these. */
const SIZE = 34;

/**
 * All-time totals across the top, in the same dark band the Match Centre uses,
 * with what they have won under the name. Held badges only: a row of empty
 * trophies over a debutant's stats is a list of things they haven't done, and
 * the shelf below the hero is where the unearned ones are named and chased.
 */
export default function PlayerHero({ player, career, seasonsActive, badges, isMe, onToggleMe }) {
  const metals = badges.career.filter((b) => b.metal);
  const events = badges.events.filter((b) => b.count > 0);
  const trophies = badges.trophies.filter((b) => b.seasons.length > 0);
  const span = seasonsActive.length
    ? `${seasonsActive[0]}${seasonsActive.length > 1 ? ` – ${seasonsActive[seasonsActive.length - 1]}` : ''}`
    : 'No appearances yet';
  return (
    <div className="board player-hero">
      <span className="crest">{initials(player.name)}</span>
      <div className="who">
        <h1>{player.name}</h1>
        <div className="sub">
          {player.position && <span className="tag dark">{player.position}</span>}
          {player.status === 'inactive' && <span className="tag dark">inactive</span>}
          {/* The state, said in the same device the other two facts about this
              player use. The control in the corner is the action, and the two
              are separate on purpose: a single toggle labelled "This is me"
              and filled gold reads as an offer on a site where gold *is* the
              offer, whichever way round it is drawn. */}
          {isMe && <span className="tag gold">You</span>}
          <span>
            {seasonsActive.length > 0 && `${seasonsActive.length} season${seasonsActive.length > 1 ? 's' : ''} · `}
            {span}
          </span>
        </div>
        {metals.length + events.length + trophies.length > 0 && (
          /* One label for the row rather than one per drawing, the same trade
             the squad tile makes: the badges are the content here, and a screen
             reader wants to be told there is a shelf and what is on it. */
          <div
            className="badge-row hero-badges"
            role="img"
            aria-label={`Badges: ${[
              ...metals.map((b) => `${b.label} ${b.metal}`),
              ...events.map((b) => `${b.label} ×${b.count}`),
              ...trophies.map((b) => `${b.label} ${b.seasons.join(', ')}`),
            ].join(', ')}`}
          >
            {metals.map((badge) => (
              <BadgeIcon key={badge.key} badge={badge.key} metal={badge.metal} size={SIZE} />
            ))}
            {events.map((badge) => (
              <span key={badge.key} className="badge-stack">
                <BadgeIcon badge={badge.key} metal="gold" size={SIZE} />
                <span className="times">×{badge.count}</span>
              </span>
            ))}
            {trophies.map((badge) => (
              <BadgeIcon key={badge.key} badge={badge.key} metal="gold" size={SIZE} />
            ))}
          </div>
        )}
      </div>
      {/* In the board's top-right corner, and after the name in reading order:
          a player opens their own page for what they have won, and the offer to
          claim the page is an offer, not the content. Under the badges it sat
          between the two things they came for — the shelf and the career line —
          and pushed both down a row on a phone. The corner is the one place on
          this band that holds nothing at any width.

          The label says what the tap does, both ways round, because there is
          no reading of "This is me" in gold that means "already claimed" on
          a site where a gold button is the thing to press. The state is the
          tag beside the name instead. What either way sets is a cookie on
          this phone and nothing else — DESIGN.md → *What the site remembers,
          and what it doesn't*. */}
      <button
        type="button"
        className={isMe ? 'me-toggle secondary' : 'me-toggle'}
        onClick={onToggleMe}
      >
        {isMe ? 'Not me?' : 'This is me'}
      </button>
      <div className="career-line">
        <div><span className="v">{career.appearances}</span><span className="label">Apps</span></div>
        <div><span className="v">{career.goals}</span><span className="label">Goals</span></div>
        <div><span className="v">{career.assists}</span><span className="label">Assists</span></div>
        <div><span className="v">{career.cleanSheets}</span><span className="label">Clean sheets</span></div>
        <div><span className="v">{career.motm}</span><span className="label">MOTM</span></div>
      </div>
    </div>
  );
}
