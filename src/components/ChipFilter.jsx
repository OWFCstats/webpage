/**
 * A row of chips that picks one value — a season, a filter. The markup
 * `MatchesAdmin` writes out by hand, for the pages that came after it.
 */
export default function ChipFilter({ label, options, value, onChange }) {
  return (
    <div className="chip-row" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={`chip-btn${value === o.value ? ' active' : ''}`}
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
