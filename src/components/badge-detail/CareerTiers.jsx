import { Link } from 'react-router-dom';
import BadgeIcon from '../BadgeIcon';
import { plural } from '../../lib/format';

/** What an empty rung says. A rung with metal above it is empty because
 *  everyone who reached it has gone past — a badge stops being bronze the day
 *  it becomes silver — where "nobody yet" would read as never reached. */
function emptyLine(tiers, index) {
  return tiers.some((t, i) => i > index && t.count > 0) ? 'all moved up' : 'nobody yet';
}

/** Every holder at every tier, in the ladder's own order. A name appears on one
 *  rung only — the metal it holds — because reaching silver is what leaves
 *  bronze behind, and a player listed twice reads as two players. An empty rung
 *  keeps its place: where the metal stops is the story on a club this young,
 *  and a tier nobody has reached is a live target rather than a gap.
 *
 *  This is the one page in the site that sets all four drawings of a badge side
 *  by side, which is how somebody learns that a crest changes shape as well as
 *  colour on the way up — so the drawings are 40px here rather than the 28 they
 *  were when a tier was a tint. */
export default function CareerTiers({ badge, tiers, chasing }) {
  return (
    <>
      <div className="sheet">
        {tiers.map((tier, i) => (
          <section className="badge-tier" key={tier.metal}>
            <div className="badge-tier-head">
              <span className="tier-name">
                <BadgeIcon badge={badge.key} metal={tier.metal} size={40} />
                <b>{tier.metal}</b>
                <span className="at">{tier.threshold}+</span>
              </span>
              <span className="at">
                {tier.count === 0
                  ? emptyLine(tiers, i)
                  : plural(tier.count, 'holder', 'holders')}
              </span>
            </div>
            {tier.holders.length > 0 && (
              <ul className="badge-names">
                {tier.holders.map((holder) => (
                  <li key={holder.player.id}>
                    <Link to={`/players/${holder.player.id}`}>{holder.player.name}</Link>{' '}
                    <span className="when">
                      {holder.count}
                      {holder.since && ` · ${holder.since}`}
                    </span>
                  </li>
                ))}
                {tier.more > 0 && <li className="when">+{tier.more} more</li>}
              </ul>
            )}
          </section>
        ))}
      </div>

      {chasing.length > 0 && (
        <div className="sheet section">
          <h2 className="label ruled">Closest to their next one</h2>
          <ul className="badge-names">
            {chasing.map((row) => (
              <li key={row.player.id}>
                <Link to={`/players/${row.player.id}`}>{row.player.name}</Link>{' '}
                <span className="when">{row.need} to {row.metal}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
