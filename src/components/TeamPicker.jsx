import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useData } from '../context/DataContext';
import { slugify } from '../lib/stats';

/**
 * Select over the clubs in `teams` — never Old Wellingtonians itself, since
 * we're never our own opponent — with a lightweight inline way to add a club
 * that isn't listed yet. `onChange` receives both the chosen team's id and
 * name so callers can set `opponent_team_id` and the denormalised `opponent`
 * text together.
 */
export default function TeamPicker({ teams, value, onChange }) {
  const { refresh } = useData();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const clubs = teams.filter((t) => !t.is_club).sort((a, b) => a.name.localeCompare(b.name));

  function choose(id) {
    const team = clubs.find((t) => t.id === id);
    onChange(team?.id ?? '', team?.name ?? '');
  }

  async function addClub(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('teams')
      .insert({ name: trimmed, slug: slugify(trimmed), is_club: false })
      .select()
      .single();
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    await refresh();
    onChange(data.id, data.name);
    setName('');
    setAdding(false);
  }

  return (
    <div>
      <select value={value ?? ''} onChange={(e) => choose(e.target.value)} aria-label="Opponent">
        <option value="">— select a club —</option>
        {clubs.map((t) => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
      {adding ? (
        <div className="controls" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
          <input
            type="text"
            placeholder="New club name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <button type="button" className="small" disabled={busy || !name.trim()} onClick={addClub}>
            {busy ? 'Adding…' : 'Add'}
          </button>
          <button
            type="button"
            className="secondary small"
            onClick={() => { setAdding(false); setName(''); setError(null); }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button type="button" className="secondary small" style={{ marginTop: '0.5rem' }} onClick={() => setAdding(true)}>
          + Add a club
        </button>
      )}
      {error && <div className="notice error" style={{ marginTop: '0.5rem' }}>{error}</div>}
    </div>
  );
}
