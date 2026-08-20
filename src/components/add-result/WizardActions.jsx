import { Link } from 'react-router-dom';

/**
 * Back, forward, and finally save. The Next button names the step it's going
 * to rather than saying "Next", because on a phone the button is the only
 * thing on screen saying what happens when you tap it.
 *
 * The counts beside it are reassurance, not validation: a squad with nobody on
 * the scoresheet is a normal Sunday, and the flow says so instead of blocking.
 */
export default function WizardActions({
  steps, step, pickedCount, nonScorerCount, detailsOk, busy, onBack, onNext, onSave,
}) {
  return (
    <>
      <div className="form-actions wizard-actions">
        {step > 0 ? (
          <button type="button" className="secondary" onClick={onBack}>Back</button>
        ) : (
          <Link className="btn secondary" to="/admin">Cancel</Link>
        )}
        {step === 1 && <span className="muted">{pickedCount} selected</span>}
        {step === 2 && nonScorerCount > 0 && (
          <span className="muted">{nonScorerCount} with no goal involvement — that's fine</span>
        )}
        {step < steps.length - 1 ? (
          <button
            type="button"
            onClick={onNext}
            disabled={step === 0 ? !detailsOk : step === 1 ? pickedCount === 0 : false}
          >
            {step === 0 ? 'Next — who played?' : step === 1 ? 'Next — who scored?' : 'Next — cards & MOTM'}
          </button>
        ) : (
          <button type="button" onClick={onSave} disabled={busy}>
            {busy ? 'Saving…' : 'Save match'}
          </button>
        )}
      </div>
      <p className="muted wizard-note">
        Nothing is saved until the last step, and you can go back at any point.
      </p>
    </>
  );
}
