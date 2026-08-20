import Stepper from './Stepper';
import { initials } from '../../lib/format';

/** Step three: who scored. The notice reconciles the credited goals against
 *  the score, and lets the save through either way — an unattributed goal is a
 *  real thing on a Sunday, and a blocked save loses the whole entry. */
export default function GoalsStep({ selected, picked, gf, ownGoals, scored, remaining, onPatch }) {
  return (
    <div className="sheet">
      {gf != null && (
        <div className={`notice ${remaining === 0 ? 'ok' : 'error'}`} style={{ marginBottom: '0.8rem' }}>
          {remaining === 0
            ? `All ${gf} goals accounted for${ownGoals > 0 ? ` (including ${ownGoals} own goal${ownGoals > 1 ? 's' : ''})` : ''}.`
            : remaining > 0
              ? `${remaining} of ${gf} goals still unassigned. Saving is allowed — credit them later if unknown.`
              : `Players are credited with ${scored} goals but the score was ${gf}. Check the numbers.`}
        </div>
      )}
      <ul className="stat-list">
        {selected.map((p) => {
          const v = picked.get(p.id);
          return (
            <li key={p.id} className="stat-row">
              <span className="avatar">{initials(p.name)}</span>
              <span className="who">{p.name}</span>
              <span className="steppers">
                <Stepper label="Goals" value={v.goals} onChange={(goals) => onPatch(p.id, { goals })} />
                <Stepper label="Assists" value={v.assists} onChange={(assists) => onPatch(p.id, { assists })} />
              </span>
            </li>
          );
        })}
      </ul>
      {selected.length === 0 && (
        <div className="empty">Nobody selected yet — go back a step and pick the squad.</div>
      )}
    </div>
  );
}
