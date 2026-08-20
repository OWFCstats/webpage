/** Where you are in the four questions: a bar per step, filled behind you. */
export default function WizardSteps({ steps, step }) {
  return (
    <>
      <div className="wizard-steps" aria-hidden="true">
        {steps.map((s, i) => (
          <span key={s} className={i < step ? 'done' : i === step ? 'on' : undefined} />
        ))}
      </div>
      <p className="label wizard-title">{steps[step]}</p>
    </>
  );
}
