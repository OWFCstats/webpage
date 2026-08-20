import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useData } from '../../context/DataContext';
import { Spinner } from '../../components/bits';
import { formatDate } from '../../lib/stats';

export default function ReportEditor() {
  const { matchId } = useParams();
  const { matches, loading } = useData();
  const match = matches.find((m) => m.id === matchId);

  if (loading) return <Spinner />;
  if (!match) return <Navigate to="/admin/matches" replace />;
  return <ReportInner key={matchId} match={match} />;
}

function ReportInner({ match }) {
  const { refresh } = useData();
  const [text, setText] = useState(match.report ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setBusy(true);
    setError(null);
    const { error: err } = await supabase
      .from('matches')
      .update({ report: text.trim() === '' ? null : text })
      .eq('id', match.id);
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSaved(true);
    refresh();
  }

  return (
    <div className="section sheet">
      <h2>Match report — vs {match.opponent}, {formatDate(match.date)}</h2>
      <p className="muted">Plain text; paragraphs are preserved. Leave empty to remove the report.</p>
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setSaved(false); }}
        placeholder="How did it go?"
      />
      {error && <div className="notice error" style={{ marginTop: '0.8rem' }}>{error}</div>}
      {saved && <div className="notice ok" style={{ marginTop: '0.8rem' }}>Saved.</div>}
      <div className="form-actions">
        <button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save report'}</button>
        <Link className="btn secondary" to="/admin/matches">Back to matches</Link>
      </div>
    </div>
  );
}
