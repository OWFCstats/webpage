import { Link } from 'react-router-dom';
import BadgeIcon from '../BadgeIcon';

/** The trophy at cabinet size. 72px is what a plinth plus an object needs to
 *  read as two objects at arm's length rather than as a smudge with a name under
 *  it — three times the 20px the list version drew at, which is the whole point
 *  of the redesign. The 2×2 phone grid is what pays for it: four across at 375px
 *  gives a column 78px, and 78px of trophy with "Hugh Grindon" under it is the
 *  list again with extra steps. */
const SIZE = 72;

/**
 * Whoever won an award, and the mark behind it. Two names where two players
 * finished level — the rows can't say which of them mattered more, and a tie on
 * a derived award is kept whole by design.
 *
 * The mark goes *under* the names rather than after them, and carries its own
 * unit: "9" under a boot is a shirt number until it says "9 goals". The voted
 * award has no arithmetic behind it, so it says so — printing a figure there
 * would imply a formula picked the winner.
 */
function Winners({ award }) {
  if (award.leaders.length === 0) {
    return <span className="hc-none">Not awarded</span>;
  }
  return (
    <>
      <span className="hc-names">
        {award.leaders.map((p) => (
          <Link key={p.id} to={`/players/${p.id}`}>{p.name}</Link>
        ))}
      </span>
      <span className="hc-mark">
        {award.value != null ? `${award.value} ${award.unit}` : 'voted'}
        {award.leaders.length > 1 && <> · <span className="hc-shared">shared</span></>}
      </span>
    </>
  );
}

/**
 * The honours board as a trophy cabinet: one green band per season, the year in
 * its top left, and the four trophies standing along a shelf in the honours
 * order — Player of the Season, Golden Boot, Playmaker, The Dependable — each
 * with its winner underneath and their mark under the name.
 *
 * It was a list: four label/name rows a season with the names at the right-hand
 * edge, which said everything and showed nothing. The trophies are the club's
 * own drawings and they are the reason anyone opens this page; a cabinet puts
 * them at a size worth looking at and keeps the four in the same order and the
 * same place down every season, so a name can be found by which shelf it stands
 * on rather than by reading four labels.
 *
 * **A season nobody has won yet is still on the shelf**, four drawings drained
 * of their colour with *Not awarded* under each. That is not an empty state: it
 * is the season the reader is about to play, and the cabinet's job is to make
 * the gap in it look worth filling. Entering next season's fixtures is what puts
 * a season on this page, which is why the shim exists at all.
 *
 * Gold under Player of the Season and nothing under the other three — the same
 * hairline device the list carried, kept because it marks the one name the
 * players chose from the three the arithmetic did, and because a caption saying
 * so was longer than the rows above it.
 */
export default function HonoursBoard({ seasons }) {
  if (seasons.length === 0) {
    return <div className="empty sheet">No season on record yet. The first one fills this in.</div>;
  }
  return (
    /* One board, not one per season. The cabinet is the band and a season is a
       shelf inside it, ruled off from the next — which is both what a cabinet
       looks like and what keeps this page to a single dark surface
       (DESIGN.md → Board). */
    <div className="board honours-cabinet">
      {seasons.map((s) => (
        <section className="hc-season" key={s.season}>
          <h3 className="hc-year">{s.season}</h3>
          <ol className="hc-shelf">
            {s.awards.map((a) => (
              <li className={`hc-trophy${a.voted ? ' voted' : ''}`} key={a.key}>
                <Link className="hc-cup" to={`/records/badges/${a.key}`}>
                  <BadgeIcon
                    badge={a.key}
                    metal={a.leaders.length > 0 ? 'gold' : null}
                    size={SIZE}
                  />
                  <span className="hc-award">{a.label}</span>
                </Link>
                <Winners award={a} />
              </li>
            ))}
          </ol>
          {/* An admin's own words about the vote, once, under the shelf rather
              than in the column: a note is a sentence and a column is 160px, so
              in the trophy it folds the shelf out of shape. */}
          {s.awards.find((a) => a.note) && (
            <p className="hc-note">{s.awards.find((a) => a.note).note}</p>
          )}
        </section>
      ))}
    </div>
  );
}
