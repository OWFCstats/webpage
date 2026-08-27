import PlayerPicker from '../PlayerPicker';

// The four typed columns, in the order the header row reads them. Each input
// carries its own caption because the header is hidden on a phone — see
// docs/DESIGN.md -> Mobile.
const STATS = [
  { key: 'goals', label: 'Goals' },
  { key: 'assists', label: 'Assists' },
  { key: 'yellows', label: 'YC' },
  { key: 'reds', label: 'RC' },
];

/**
 * One slot in the team sheet: who, what they were, and what they did.
 *
 * A dropout is picked but didn't play, so every figure on the row is zeroed
 * and disabled rather than hidden — the name stays on the sheet, which is the
 * whole point of recording one.
 */
export default function LineupSlot({ index, slot, players, taken, onUpdate, onPickMotm, onRemove }) {
  const off = !slot.playerId || slot.dropout;
  return (
    <div className="lineup-grid lineup-slot">
      <span className="slot-no">{index + 1}</span>
      <PlayerPicker
        players={players}
        value={slot.playerId}
        taken={taken}
        onChange={(playerId) => onUpdate({ playerId })}
      />
      <select
        className="slot-role"
        value={slot.dropout ? 'dropout' : slot.started ? 'started' : 'sub'}
        disabled={!slot.playerId}
        onChange={(e) => {
          const v = e.target.value;
          onUpdate(v === 'dropout' ? { dropout: true } : { dropout: false, started: v === 'started' });
        }}
        aria-label={`Slot ${index + 1} role`}
      >
        <option value="started">Started</option>
        <option value="sub">Sub</option>
        <option value="dropout">Dropped out</option>
      </select>
      {STATS.map(({ key, label }) => (
        <label className="lineup-stat" key={key}>
          <span className="label">{label}</span>
          <input
            type="number"
            min="0"
            inputMode="numeric"
            className="num"
            value={slot.dropout ? 0 : slot[key]}
            disabled={off}
            onChange={(e) => onUpdate({ [key]: e.target.value })}
            aria-label={`Slot ${index + 1} ${key}`}
          />
        </label>
      ))}
      <label className="lineup-stat lineup-motm">
        <span className="label">MOTM</span>
        <input
          type="checkbox"
          checked={slot.dropout ? false : slot.motm}
          disabled={off}
          onChange={(e) => onPickMotm(e.target.checked)}
          aria-label={`Slot ${index + 1} man of the match`}
        />
      </label>
      <button
        type="button"
        className="secondary small slot-remove"
        onClick={onRemove}
        aria-label={`Remove slot ${index + 1}`}
      >
        ×
      </button>
    </div>
  );
}
