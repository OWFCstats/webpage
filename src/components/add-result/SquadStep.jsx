import { formatDate, initials } from '../../lib/format';

/** Step two: who played. The last game's squad is one tap, because an amateur
 *  side turns out largely the same people each week — and so is everyone who
 *  said yes in the chat's poll, when one was entered for this fixture. Ringers
 *  aren't in the chat, so they are always picked by hand. */
export default function SquadStep({
  listed, picked, lastSquadIds, lastMatch, saidIn, query, setQuery, onToggle, onSelectLastSquad,
  onSelectSaidIn,
}) {
  return (
    <div className="sheet">
      <div className="controls">
        <input
          type="text"
          placeholder="Search the squad…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search players"
        />
        {saidIn.size > 0 && (
          <button type="button" className="secondary small" onClick={onSelectSaidIn}>
            Select available ({saidIn.size})
          </button>
        )}
        {lastMatch && lastSquadIds.size > 0 && (
          <button
            type="button"
            className="secondary small"
            onClick={onSelectLastSquad}
          >
            Select last squad ({formatDate(lastMatch.date)})
          </button>
        )}
      </div>
      <ul className="pick-list">
        {listed.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className={`pick-row${picked.has(p.id) ? ' picked' : ''}`}
              aria-pressed={picked.has(p.id)}
              onClick={() => onToggle(p.id)}
            >
              <span className="avatar">{initials(p.name)}</span>
              <span className="who">
                {p.name}
                {saidIn.has(p.id) && <span className="muted"> · said in</span>}
                {lastSquadIds.has(p.id) && <span className="muted"> · played last game</span>}
              </span>
              <span className="tick" aria-hidden="true">{picked.has(p.id) ? '✓' : ''}</span>
            </button>
          </li>
        ))}
      </ul>
      {listed.length === 0 && <div className="empty">No players match.</div>}
    </div>
  );
}
