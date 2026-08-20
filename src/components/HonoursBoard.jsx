import { Link } from 'react-router-dom';

/**
 * Whoever won an award, with the mark behind it. Two names where two players
 * finished level: the rows can't say which of them mattered more. A voted
 * award has no mark — printing one would imply the arithmetic decided it.
 */
export function Award({ award }) {
  if (award.leaders.length === 0) {
    return <span className="muted">{award.voted ? 'Not voted yet' : 'Not awarded'}</span>;
  }
  return (
    <>
      {award.leaders.map((p, i) => (
        <span key={p.id}>
          {i > 0 && ' & '}
          <Link to={`/players/${p.id}`}>{p.name}</Link>
        </span>
      ))}{' '}
      {award.value != null && <span className="muted">{award.value}</span>}
      {award.leaders.length > 1 && <> <span className="tag">shared</span></>}
    </>
  );
}

/**
 * The honours board: the school-hall board, ruled and gilded rather than
 * boxed. One block per season, newest first, with the awards running down it
 * and the names in gold at the right-hand edge.
 *
 * Not a matrix. Five awards plus a season is six columns of names, and no
 * condensed face fits that on a 375px phone — so the season heads its block
 * instead of holding a column. On a wide screen the year moves into a left
 * gutter, which puts the reading order back where a printed board has it.
 */
export default function HonoursBoard({ seasons }) {
  if (seasons.length === 0) {
    return <div className="empty sheet">No season on record yet. The first one fills this in.</div>;
  }
  return (
    <div className="board honours-board">
      {seasons.map((s) => (
        <section className="hb-season" key={s.season}>
          <h3 className="hb-year">{s.season}</h3>
          <dl className="hb-awards">
            {s.awards.map((a) => (
              <div className={`hb-award${a.voted ? ' voted' : ''}`} key={a.key}>
                <dt className="label">{a.label}</dt>
                <dd>
                  <Award award={a} />
                  {a.note && <span className="hb-note">{a.note}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      <p className="muted card-foot">
        Four of the five come straight off our own rows, and a shared one names
        everyone level at the top. Player of the Season is the exception: the
        players vote for it, so it’s the one name here nobody worked out.
      </p>
    </div>
  );
}
