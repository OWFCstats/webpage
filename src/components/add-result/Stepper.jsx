/** A figure with a − and a + either side of it: the only control on the wizard
 *  that has to work with a thumb, one-handed, standing up. */
export default function Stepper({ value, onChange, label, max = 99 }) {
  return (
    <span className="stepper">
      <span className="label">{label}</span>
      <span className="stepper-controls">
        <button type="button" className="secondary small" aria-label={`Fewer ${label}`}
          onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0}>−</button>
        <b>{value}</b>
        <button type="button" className="secondary small" aria-label={`More ${label}`}
          onClick={() => onChange(Math.min(max, value + 1))}>+</button>
      </span>
    </span>
  );
}
