import { formatDate, formatKickoff } from '../../lib/format';

/**
 * Which game this is — asked before anything is typed, because most of the
 * time the club already put it in the diary.
 *
 * Without this the wizard only ever inserted, so filling in a fixture that
 * already existed left the same match on the site twice: once as the result
 * and once, forever, as an upcoming game. The kick-off time and venue entered
 * with the fixture went with it, since the new row was typed from scratch.
 *
 * A fixture whose date has gone by is listed first and marked, because that is
 * the game the admin is almost certainly here about.
 */
export default function FixturePicker({ fixtures, today, chosenId, onChoose, onClear }) {
  if (fixtures.length === 0) return null;

  const chosen = fixtures.find((f) => f.id === chosenId) ?? null;

  if (chosen) {
    return (
      <div className="sheet fixture-picked">
        <span>
          Filling in <strong>{chosen.opponent}</strong>, {formatDate(chosen.date)}
          {chosen.kickoff_time ? ` · ${formatKickoff(chosen.kickoff_time)}` : ''}
          {chosen.venue ? ` · ${chosen.venue}` : ''} — the fixture already in the diary.
        </span>
        <button type="button" className="secondary small" onClick={onClear}>
          Not this one
        </button>
      </div>
    );
  }

  return (
    <div className="sheet">
      <h3>Which game?</h3>
      <p className="muted">
        Pick the fixture and it gets the score — one match, not two.
      </p>
      <ul className="pick-list">
        {fixtures.map((f) => (
          <li key={f.id}>
            <button type="button" className="pick-row" onClick={() => onChoose(f)}>
              <span className="who">
                {f.opponent}
                <span className="muted">
                  {' · '}{formatDate(f.date)}
                  {f.kickoff_time ? ` · ${formatKickoff(f.kickoff_time)}` : ''}
                </span>
              </span>
              {f.date <= today && <span className="tag orange">played</span>}
            </button>
          </li>
        ))}
      </ul>
      <div className="form-actions">
        <button type="button" className="secondary" onClick={() => onChoose(null)}>
          A game that isn’t listed
        </button>
      </div>
    </div>
  );
}
