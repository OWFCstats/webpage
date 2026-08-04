import { useState } from 'react';

/**
 * Season selector: one-tap chips for the current + a couple of recent
 * seasons, since that covers nearly every entry. Starting a new season
 * only happens once a year, so it's a deliberate second action rather
 * than free text sitting right next to the chips.
 */
export default function SeasonPicker({ seasons, value, onChange }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const chips = value && !seasons.includes(value) ? [value, ...seasons] : seasons;

  function confirm() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange(trimmed);
    setAdding(false);
    setDraft('');
  }

  return (
    <div className="season-picker">
      <div className="chip-row" role="group" aria-label="Season">
        {chips.map((s) => (
          <button
            key={s}
            type="button"
            className={`chip-btn${value === s ? ' active' : ''}`}
            aria-pressed={value === s}
            onClick={() => { onChange(s); setAdding(false); }}
          >
            {s}
          </button>
        ))}
        <button
          type="button"
          className="chip-btn"
          onClick={() => { setAdding(true); setDraft(''); }}
        >
          + New season
        </button>
      </div>
      {adding && (
        <div className="season-new">
          <input
            type="text"
            value={draft}
            placeholder="2027/28"
            autoFocus
            aria-label="New season"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirm(); } }}
          />
          <button type="button" className="secondary small" onClick={confirm}>Use</button>
          <button type="button" className="secondary small" onClick={() => setAdding(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
