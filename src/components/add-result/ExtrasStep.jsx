import Stepper from './Stepper';
import { initials } from '../../lib/format';

/** Step four: the extras. MOTM is a single winner, so picking one clears the
 *  rest — that rule lives with the state, in the page. */
export default function ExtrasStep({ selected, picked, onPatch, onPickMotm }) {
  return (
    <div className="sheet">
      <h3>Man of the Match</h3>
      <div className="squad-pills" style={{ margin: '0.5rem 0 1.1rem' }}>
        {selected.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`squad-pill as-button${picked.get(p.id).motm ? ' motm' : ''}`}
            aria-pressed={picked.get(p.id).motm}
            onClick={() => onPickMotm(p.id)}
          >
            {p.name}
          </button>
        ))}
      </div>
      <h3>Cards</h3>
      <p className="muted">Only if there were any.</p>
      <ul className="stat-list">
        {selected.map((p) => {
          const v = picked.get(p.id);
          return (
            <li key={p.id} className="stat-row">
              <span className="avatar">{initials(p.name)}</span>
              <span className="who">{p.name}</span>
              <span className="steppers">
                <Stepper label="Yellow" value={v.yellows} onChange={(yellows) => onPatch(p.id, { yellows })} max={2} />
                <Stepper label="Red" value={v.reds} onChange={(reds) => onPatch(p.id, { reds })} max={1} />
              </span>
            </li>
          );
        })}
      </ul>
      <p className="muted" style={{ marginTop: '0.8rem' }}>
        Everyone saves as a starter. Subs and late dropouts can be set
        afterwards in the lineup editor — one click from the match list.
      </p>
    </div>
  );
}
