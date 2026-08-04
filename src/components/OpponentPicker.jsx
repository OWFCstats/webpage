import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Type-to-search opponent selector, modelled on PlayerPicker. Unlike a
 * player, an opponent isn't a closed set: picking a suggestion guarantees
 * an exact match against existing rows, but typing something not in the
 * list is always allowed and commits as-is (after normalization) rather
 * than being blocked.
 */
export default function OpponentPicker({ opponents, value, onChange, placeholder = 'Search opponent…' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        if (open) commitFreeText(query);
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, query, opponents]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return opponents
      .filter((o) => !q || o.toLowerCase().includes(q))
      .slice()
      .sort((a, b) => a.localeCompare(b));
  }, [opponents, query]);

  // Trims, and snaps to the existing opponent's exact stored casing if one
  // matches case-insensitively — so "old stoics" and "Old Stoics" never
  // end up as two different opponents in the data.
  function commitFreeText(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    const existing = opponents.find((o) => o.toLowerCase() === trimmed.toLowerCase());
    onChange(existing ?? trimmed);
  }

  function choose(opponent) {
    onChange(opponent);
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
      e.preventDefault();
      if (open && matches[highlight]) {
        choose(matches[highlight]);
      } else {
        commitFreeText(query);
        setQuery('');
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setQuery('');
      setOpen(false);
    } else if (e.key === 'Tab' && open) {
      commitFreeText(query);
      setOpen(false);
    }
  }

  return (
    <div className="picker" ref={boxRef}>
      <input
        type="text"
        className="picker-input"
        value={open ? query : value ?? ''}
        placeholder={placeholder}
        onFocus={() => { setOpen(true); setQuery(value ?? ''); setHighlight(0); }}
        onChange={(e) => { setQuery(e.target.value); setHighlight(0); setOpen(true); }}
        onKeyDown={onKeyDown}
        aria-label="Opponent"
        autoComplete="off"
      />
      {open && (
        <ul className="picker-list" role="listbox">
          {matches.length === 0 && <li className="picker-empty">No matches — press Enter to use what you typed</li>}
          {matches.map((o, i) => (
            <li key={o}>
              <button
                type="button"
                role="option"
                aria-selected={o === value}
                className={`picker-option${i === highlight ? ' active' : ''}`}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => choose(o)}
              >
                <span>{o}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
