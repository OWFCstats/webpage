import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Type-to-search player selector. Shows the chosen player's name in the input;
 * typing filters the list. Players already picked elsewhere in the lineup are
 * listed but disabled, so a squad can't contain the same person twice.
 */
export default function PlayerPicker({
  players,
  value,
  taken,
  onChange,
  placeholder = 'Search player…',
  // Off by default: an admin screen opens with several of these and focusing
  // one would pop the keyboard over the rest of the form. Home's "which one
  // are you" swaps this in on a tap, where the tap *was* the request to type.
  autoFocus = false,
}) {
  const selected = players.find((p) => p.id === value) ?? null;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return players
      .filter((p) => !q || p.name.toLowerCase().includes(q))
      .slice()
      .sort(
        (a, b) =>
          (a.status === 'inactive') - (b.status === 'inactive') ||
          a.name.localeCompare(b.name),
      );
  }, [players, query]);

  function choose(player) {
    if (taken?.has(player.id) && player.id !== value) return;
    onChange(player.id);
    setQuery('');
    setOpen(false);
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) setOpen(true);
      setHighlight((h) => {
        const next = e.key === 'ArrowDown' ? h + 1 : h - 1;
        return Math.max(0, Math.min(matches.length - 1, next));
      });
    } else if (e.key === 'Enter') {
      if (open && matches[highlight]) {
        e.preventDefault();
        choose(matches[highlight]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="picker" ref={boxRef}>
      <input
        type="text"
        className="picker-input"
        value={open ? query : selected?.name ?? ''}
        placeholder={selected ? selected.name : placeholder}
        onFocus={() => { setOpen(true); setQuery(''); setHighlight(0); }}
        onChange={(e) => { setQuery(e.target.value); setHighlight(0); setOpen(true); }}
        onKeyDown={onKeyDown}
        aria-label="Select player"
        autoComplete="off"
        autoFocus={autoFocus}
      />
      {selected && !open && (
        <button
          type="button"
          className="picker-clear"
          onClick={() => onChange(null)}
          aria-label={`Remove ${selected.name}`}
        >
          ×
        </button>
      )}
      {open && (
        <ul className="picker-list" role="listbox">
          {matches.length === 0 && <li className="picker-empty">No players match</li>}
          {matches.map((p, i) => {
            const isTaken = taken?.has(p.id) && p.id !== value;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={p.id === value}
                  disabled={isTaken}
                  className={`picker-option${i === highlight ? ' active' : ''}`}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => choose(p)}
                >
                  <span>{p.name}</span>
                  <span className="picker-meta">
                    {p.position ?? ''}
                    {p.status === 'inactive' ? ' · inactive' : ''}
                    {isTaken ? ' · already picked' : ''}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
