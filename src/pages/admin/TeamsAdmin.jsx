import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useData } from '../../context/DataContext';
import { slugify } from '../../lib/matches';
import SortableTable from '../../components/SortableTable';

const BLANK = {
  name: '',
  short_name: '',
  is_club: false,
  pitch_name: '',
  pitch_address: '',
  postcode: '',
  map_url: '',
  notes: '',
};

export default function TeamsAdmin() {
  const { teams, matches, leagueRows, refresh } = useData();
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const matchCount = new Map();
  for (const m of matches) {
    if (!m.opponent_team_id) continue;
    matchCount.set(m.opponent_team_id, (matchCount.get(m.opponent_team_id) ?? 0) + 1);
  }

  function startEdit(t) {
    setEditingId(t.id);
    setForm({
      name: t.name,
      short_name: t.short_name ?? '',
      is_club: t.is_club,
      pitch_name: t.pitch_name ?? '',
      pitch_address: t.pitch_address ?? '',
      postcode: t.postcode ?? '',
      map_url: t.map_url ?? '',
      notes: t.notes ?? '',
    });
    setError(null);
  }

  function reset() {
    setEditingId(null);
    setForm(BLANK);
    setError(null);
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      name: form.name.trim(),
      short_name: form.short_name.trim() || null,
      slug: slugify(form.name),
      is_club: form.is_club,
      pitch_name: form.pitch_name.trim() || null,
      pitch_address: form.pitch_address.trim() || null,
      postcode: form.postcode.trim() || null,
      map_url: form.map_url.trim() || null,
      notes: form.notes.trim() || null,
    };
    const { error: err } = editingId
      ? await supabase.from('teams').update(payload).eq('id', editingId)
      : await supabase.from('teams').insert(payload);
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    reset();
    refresh();
  }

  async function remove(t) {
    const count = matchCount.get(t.id) ?? 0;
    if (count > 0) {
      setError(`Can't delete ${t.name} — ${count} match${count === 1 ? '' : 'es'} reference it.`);
      return;
    }
    // League rows point at teams too, and the foreign key would refuse the
    // delete anyway — better to say which table is holding on to it than to
    // surface the constraint name.
    const inTables = leagueRows.filter((r) => r.team_id === t.id).length;
    if (inTables > 0) {
      setError(`Can't delete ${t.name} — it's in ${inTables} league table${inTables === 1 ? '' : 's'}.`);
      return;
    }
    if (!window.confirm(`Delete ${t.name}?`)) return;
    const { error: err } = await supabase.from('teams').delete().eq('id', t.id);
    if (err) setError(err.message);
    else refresh();
  }

  // Old Wellingtonians first, then everyone else alphabetically.
  const sortedTeams = teams.slice().sort((a, b) => {
    if (a.is_club !== b.is_club) return a.is_club ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="section">
      <div className="sheet">
        <h2>{editingId ? 'Edit team' : 'Add team'}</h2>
        <form onSubmit={submit}>
          <div className="form-grid">
            <label className="field">
              <span>Name</span>
              <input type="text" value={form.name} required
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="field">
              <span>Short name (optional)</span>
              <input type="text" value={form.short_name}
                onChange={(e) => setForm({ ...form, short_name: e.target.value })} />
            </label>
            <label className="field checkbox">
              <input type="checkbox" checked={form.is_club}
                onChange={(e) => setForm({ ...form, is_club: e.target.checked })} />
              <span>This is us (Old Wellingtonians)</span>
            </label>
            <label className="field">
              <span>Pitch name</span>
              <input type="text" value={form.pitch_name}
                onChange={(e) => setForm({ ...form, pitch_name: e.target.value })} />
            </label>
            <label className="field">
              <span>Pitch address</span>
              <input type="text" value={form.pitch_address}
                onChange={(e) => setForm({ ...form, pitch_address: e.target.value })} />
            </label>
            <label className="field">
              <span>Postcode</span>
              <input type="text" value={form.postcode}
                onChange={(e) => setForm({ ...form, postcode: e.target.value })} />
            </label>
            <label className="field">
              <span>Map URL</span>
              <input type="text" value={form.map_url}
                onChange={(e) => setForm({ ...form, map_url: e.target.value })} />
            </label>
          </div>
          <label className="field">
            <span>Notes</span>
            <textarea value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </label>
          {error && <div className="notice error" style={{ marginTop: '0.8rem' }}>{error}</div>}
          <div className="form-actions">
            <button type="submit" disabled={busy}>{editingId ? 'Save changes' : 'Add team'}</button>
            {editingId && <button type="button" className="secondary" onClick={reset}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="sheet section">
        <h2>Teams</h2>
        <SortableTable
          filterable
          rows={sortedTeams}
          rowKey={(t) => t.id}
          emptyText="No teams yet — add one above."
          columns={[
            { key: 'name', label: 'Name', render: (t) => t.is_club ? <strong>{t.name}</strong> : t.name },
            { key: 'pitch_name', label: 'Pitch', render: (t) => t.pitch_name ?? '—' },
            { key: 'postcode', label: 'Postcode', render: (t) => t.postcode ?? '—' },
            {
              key: 'matches',
              label: 'Matches',
              num: true,
              sortValue: (t) => matchCount.get(t.id) ?? 0,
              render: (t) => matchCount.get(t.id) ?? 0,
            },
            {
              key: 'actions',
              label: '',
              render: (t) => (
                <span className="controls" style={{ marginBottom: 0 }}>
                  <button className="secondary small" onClick={() => startEdit(t)}>Edit</button>
                  <button className="danger small" onClick={() => remove(t)}>Delete</button>
                </span>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
