import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useData } from '../../context/DataContext';
import TeamPicker from '../../components/TeamPicker';
import SeasonPicker from '../../components/SeasonPicker';
import { seasonsOf } from '../../lib/matches';

/**
 * A walkover is awarded, not played: no team sheet, no individual scorers.
 * This form only asks for what a walkover actually has — the fixture and who
 * won — and writes the 3-0 scoreline itself rather than letting it be typed,
 * since the score is a fixed consequence of who won, not a fact to enter.
 */
export default function WalkoverForm({ onDone, onCancel }) {
  const { matches, teams, refresh } = useData();
  const navigate = useNavigate();
  const seasons = seasonsOf(matches);
  const defaultSeason = seasons[0] ?? '';

  const [season, setSeason] = useState(defaultSeason);
  const [date, setDate] = useState('');
  const [opponent, setOpponent] = useState('');
  const [opponentTeamId, setOpponentTeamId] = useState('');
  const [competition, setCompetition] = useState('League');
  const [venue, setVenue] = useState('');
  const [winner, setWinner] = useState(null); // 'us' | 'them'
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const ready = (season || defaultSeason).trim() && date && opponentTeamId && winner;

  async function save() {
    setBusy(true);
    setError(null);
    const usGoals = winner === 'us' ? 3 : 0;
    const themGoals = winner === 'us' ? 0 : 3;
    const payload = {
      season: (season || defaultSeason).trim(),
      date,
      opponent: opponent.trim(),
      opponent_team_id: opponentTeamId || null,
      competition: competition.trim() || 'League',
      venue: venue || null,
      goals_for: usGoals,
      goals_against: themGoals,
      own_goals_for: 0,
      own_goals_against: 0,
      result: winner === 'us' ? 'W' : 'L',
      walkover: true,
    };
    const { data, error: err } = await supabase.from('matches').insert(payload).select().single();
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    await refresh();
    onDone?.();
    navigate(`/matchday/${data.id}`);
  }

  return (
    <div className="sheet section">
      <h2>Walkover</h2>
      <p className="muted">
        The opposition didn't show — record the automatic 3–0 without a team sheet.
        No players or scorers are attached to this match.
      </p>
      <div className="form-grid">
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <span>Season</span>
          <SeasonPicker seasons={seasons} value={season || defaultSeason} onChange={setSeason} />
        </div>
        <label className="field">
          <span>Date</span>
          <input type="date" value={date} required onChange={(e) => setDate(e.target.value)} />
        </label>
        <div className="field">
          <span>Opponent</span>
          <TeamPicker
            teams={teams}
            value={opponentTeamId}
            onChange={(id, name) => { setOpponentTeamId(id); setOpponent(name); }}
          />
        </div>
        <label className="field">
          <span>Competition</span>
          <select value={competition} onChange={(e) => setCompetition(e.target.value)}>
            <option value="League">League</option>
            <option value="Cup">Cup</option>
            <option value="Friendly">Friendly</option>
          </select>
        </label>
        <label className="field">
          <span>Venue (optional)</span>
          <select value={venue} onChange={(e) => setVenue(e.target.value)}>
            <option value="">— not recorded —</option>
            <option value="H">Home</option>
            <option value="A">Away</option>
            <option value="N">Neutral</option>
          </select>
        </label>
      </div>

      <div className="field" style={{ marginTop: '0.9rem' }}>
        <span>Winner</span>
        <div className="seg" role="radiogroup" aria-label="Winner">
          <button
            type="button"
            role="radio"
            aria-checked={winner === 'us'}
            className={winner === 'us' ? 'active' : undefined}
            onClick={() => setWinner('us')}
          >
            Old Wellingtonians
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={winner === 'them'}
            className={winner === 'them' ? 'active' : undefined}
            onClick={() => setWinner('them')}
          >
            {opponent.trim() || 'Opponent'}
          </button>
        </div>
      </div>

      {winner && (
        <p className="muted" style={{ marginTop: '0.6rem' }}>
          Will record as{' '}
          <strong>{winner === 'us' ? '3–0' : '0–3'}</strong> ({winner === 'us' ? 'W' : 'L'}).
        </p>
      )}

      {error && <div className="notice error" style={{ marginTop: '0.8rem' }}>{error}</div>}

      <div className="form-actions">
        <button type="button" onClick={save} disabled={busy || !ready}>
          {busy ? 'Saving…' : 'Record walkover'}
        </button>
        <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
