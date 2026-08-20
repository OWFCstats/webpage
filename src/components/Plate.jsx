/**
 * The plate: the engraved nameplate every badge in the site is cut from. One
 * shape, three metals, and that's the whole language — a badge you recognise
 * across a room is worth more than a badge that's been decorated.
 *
 * The metal is the tier and the tier is also written on the plate, because
 * bronze and gold are close at this size and colour on its own would be the
 * only thing carrying it. An unearned plate keeps its place in the grid and
 * says what's left to go: a badge you can't see isn't an incentive.
 */
export function Plate({ tier, mark, label, note, earned }) {
  return (
    <div className={`plate ${tier}${earned ? ' earned' : ''}`}>
      {/* Two elements for one shape: the outer is the metal edge, the face
          sits a hairline inside it. A single element can't do both — a border
          follows the border box and the clipped corners cut through it. */}
      <span className="plate-face">
        <span className="label">{tier}</span>
        <span className="plate-mark">{mark}</span>
        <span className="plate-label">{label}</span>
        <span className="plate-note">{note}</span>
      </span>
    </div>
  );
}

/** A shelf of plates: a player's own, or the club's whole board. */
export default function PlateShelf({ plates }) {
  return (
    <div className="plates">
      {plates.map((p) => (
        <Plate key={p.key} {...p} />
      ))}
    </div>
  );
}
