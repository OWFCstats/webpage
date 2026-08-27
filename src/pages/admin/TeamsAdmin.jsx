import { useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useData } from '../../context/DataContext';
import { opponentTeam, slugify } from '../../lib/matches';
import AdminList, { AdminRow } from '../../components/AdminList';

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
  const nameRef = useRef(null);

  // Counted through opponentTeam, not off opponent_team_id: a row saved before
  // the teams migration carries only the name, and counting the id alone let
  // its club be deleted out from under it — which breaks the opponent page the
  // same rows still resolve to by name.
  const matchCount = new Map();
  for (const m of matches) {
    const team = opponentTeam(m, teams);
    if (!team) continue;
    matchCount.set(team.id, (matchCount.get(team.id) ?? 0) + 1);
  }

  // Same reason as the squad list: the form sits above the whole list, so an
  // Edit tapped from the bottom of it has to bring the form to the admin.
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
    nameRef.current?.scrollIntoView({ block: 'center' });
    nameRef.current?.focus({ preventScroll: true });
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
        <h2>{editingId ? `Edit ${form.name || 'team'}` : 'Add team'}</h2>
        <form onSubmit={submit}>
          <div className="form-grid">
            <label className="field">
              <span>Name</span>
              <input type="text" ref={nameRef} value={form.name} required
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
        <AdminList
          filterable
          filterLabel="Find a club…"
          rows={sortedTeams}
          rowKey={(t) => t.id}
          filterValue={(t) => `${t.name} ${t.short_name ?? ''} ${t.pitch_name ?? ''} ${t.postcode ?? ''}`}
          emptyText="No teams yet — add one above."
        >
          {(t) => (
            <AdminRow
              title={
                <>
                  {t.is_club ? <strong>{t.name}</strong> : t.name}
                  {t.is_club && <span className="tag">us</span>}
                </>
              }
              meta={
                <>
                  {t.pitch_name ?? 'no pitch recorded'}
                  {t.postcode && ` · ${t.postcode}`}
                  {' · '}
                  {matchCount.get(t.id) ?? 0} match{(matchCount.get(t.id) ?? 0) === 1 ? '' : 'es'}
                </>
              }
              actions={
                <>
                  <button type="button" className="secondary small"
                    onClick={() => startEdit(t)}>Edit</button>
                  <button type="button" className="danger small"
                    onClick={() => remove(t)}>Delete</button>
                </>
              }
            />
          )}
        </AdminList>
      </div>
    </div>
  );
}
