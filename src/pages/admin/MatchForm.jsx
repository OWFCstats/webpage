import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useData } from '../../context/DataContext';
import { Spinner } from '../../components/bits';

function toInputs(match) {
  return {
    season: match?.season ?? '',
    date: match?.date ?? '',
    opponent: match?.opponent ?? '',
    competition: match?.competition ?? 'League',
    goals_for: match?.goals_for ?? '',
    goals_against: match?.goals_against ?? '',
    own_goals_for: match?.own_goals_for ?? 0,
    own_goals_against: match?.own_goals_against ?? 0,
  };
}

export default function MatchForm() {
  const { matchId } = useParams();
  const isNew = !matchId;
  const { matches, loading } = useData();
  const match = isNew ? null : matches.find((m) => m.id === matchId);

  // Mount the form only once data is loaded, so edit state seeds correctly
  // even on a hard refresh of an edit URL.
  if (loading) return <Spinner />;
  if (!isNew && !match) return <Navigate to="/admin/matches" replace />;
  return <MatchFormInner key={matchId ?? 'new'} match={match} isNew={isNew} matchId={matchId} />;
}

function MatchFormInner({ match, isNew, matchId }) {
  const navigate = useNavigate();
  const { refresh } = useData();
  const [form, setForm] = useState(() => toInputs(match));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const gf = form.goals_for === '' ? null : Number(form.goals_for);
  const ga = form.goals_against === '' ? null : Number(form.goals_against);
  const played = gf != null && ga != null;
  const result = !played ? null : gf > ga ? 'W' : gf < ga ? 'L' : 'D';

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      season: form.season.trim(),
      date: form.date,
      opponent: form.opponent.trim(),
      competition: form.competition.trim(),
      goals_for: gf,
      goals_against: ga,
      own_goals_for: Number(form.own_goals_for) || 0,
      own_goals_against: Number(form.own_goals_against) || 0,
      result,
    };
    const query = isNew
      ? supabase.from('matches').insert(payload).select().single()
      : supabase.from('matches').update(payload).eq('id', matchId).select().single();
    const { data, error: err } = await query;
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    // Wait for the reload so the lineup page can find the new match.
    await refresh();
    navigate(`/admin/matches/${data.id}/lineup`);
  }

  async function remove() {
    if (!window.confirm('Delete this match and all its player stats?')) return;
    const { error: err } = await supabase.from('matches').delete().eq('id', matchId);
    if (err) {
      setError(err.message);
      return;
    }
    refresh();
    navigate('/admin/matches');
  }

  return (
    <div className="section card">
      <h2>{isNew ? 'Create match' : `Edit match — vs ${match.opponent}`}</h2>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label className="field">
            <span>Season</span>
            <input type="text" value={form.season} placeholder="2025/26" required onChange={set('season')} />
          </label>
          <label className="field">
            <span>Date</span>
            <input type="date" value={form.date} required onChange={set('date')} />
          </label>
          <label className="field">
            <span>Opponent</span>
            <input type="text" value={form.opponent} required onChange={set('opponent')} />
          </label>
          <label className="field">
            <span>Competition</span>
            <input type="text" value={form.competition} required onChange={set('competition')} />
          </label>
        </div>
        <h3 style={{ marginTop: '1.2rem' }}>Score</h3>
        <p className="muted">Leave both blank for an upcoming fixture. Own goals are the portion of each side’s total scored by the opposition.</p>
        <div className="form-grid">
          <label className="field">
            <span>Goals for</span>
            <input type="number" min="0" value={form.goals_for} onChange={set('goals_for')} />
          </label>
          <label className="field">
            <span>Goals against</span>
            <input type="number" min="0" value={form.goals_against} onChange={set('goals_against')} />
          </label>
          <label className="field">
            <span>Own goals (for us)</span>
            <input type="number" min="0" value={form.own_goals_for} onChange={set('own_goals_for')} />
          </label>
          <label className="field">
            <span>Own goals (against us)</span>
            <input type="number" min="0" value={form.own_goals_against} onChange={set('own_goals_against')} />
          </label>
        </div>
        <p className="muted" style={{ marginTop: '0.6rem' }}>
          Result: {played ? <strong>{result} ({gf}–{ga})</strong> : 'not played yet'}
        </p>
        {error && <div className="notice error">{error}</div>}
        <div className="form-actions">
          <button type="submit" disabled={busy}>
            {isNew ? 'Create & pick lineup' : 'Save & go to lineup'}
          </button>
          <Link className="btn secondary" to="/admin/matches">Back</Link>
          {!isNew && <button type="button" className="danger" onClick={remove}>Delete match</button>}
        </div>
      </form>
    </div>
  );
}
