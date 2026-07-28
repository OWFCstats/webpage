import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useData } from '../../context/DataContext';
import SortableTable from '../../components/SortableTable';

const POSITIONS = ['GK', 'DEF', 'MID', 'FWD'];
const BLANK = { name: '', position: '', status: 'active' };

export default function PlayersAdmin() {
  const { players, refresh } = useData();
  const [form, setForm] = useState(BLANK);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  function startEdit(p) {
    setEditingId(p.id);
    setForm({ name: p.name, position: p.position ?? '', status: p.status });
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
    const payload = { name: form.name.trim(), position: form.position || null, status: form.status };
    const { error: err } = editingId
      ? await supabase.from('players').update(payload).eq('id', editingId)
      : await supabase.from('players').insert(payload);
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    reset();
    refresh();
  }

  async function remove(p) {
    if (!window.confirm(`Delete ${p.name}? Their appearances will be removed too.`)) return;
    const { error: err } = await supabase.from('players').delete().eq('id', p.id);
    if (err) setError(err.message);
    else refresh();
  }

  return (
    <div className="section">
      <div className="card">
        <h2>{editingId ? 'Edit player' : 'Add player'}</h2>
        <form onSubmit={submit}>
          <div className="form-grid">
            <label className="field">
              <span>Name</span>
              <input type="text" value={form.name} required
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="field">
              <span>Position (optional)</span>
              <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
                <option value="">— none —</option>
                {POSITIONS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Status</span>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </label>
          </div>
          {error && <div className="notice error" style={{ marginTop: '0.8rem' }}>{error}</div>}
          <div className="form-actions">
            <button type="submit" disabled={busy}>{editingId ? 'Save changes' : 'Add player'}</button>
            {editingId && <button type="button" className="secondary" onClick={reset}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="card section">
        <h2>Squad</h2>
        <SortableTable
          filterable
          rows={players}
          rowKey={(p) => p.id}
          initialSort={{ key: 'name', dir: 'asc' }}
          emptyText="No players yet — add the squad above."
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'position', label: 'Position', render: (p) => p.position ?? '—' },
            { key: 'status', label: 'Status' },
            {
              key: 'actions',
              label: '',
              render: (p) => (
                <span className="controls" style={{ marginBottom: 0 }}>
                  <button className="secondary small" onClick={() => startEdit(p)}>Edit</button>
                  <button className="danger small" onClick={() => remove(p)}>Delete</button>
                </span>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
