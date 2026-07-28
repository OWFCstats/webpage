import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useData } from '../../context/DataContext';
import { Spinner } from '../../components/bits';
import PlayerPicker from '../../components/PlayerPicker';
import { formatDate } from '../../lib/stats';

// A matchday squad is usually 11 + subs; start with enough slots for that and
// let the admin add more if needed.
const DEFAULT_SLOTS = 15;

const blankSlot = () => ({
  playerId: null,
  started: true,
  dropout: false,
  goals: 0,
  assists: 0,
  yellows: 0,
  reds: 0,
  motm: false,
});

export default function Lineup() {
  const { matchId } = useParams();
  const { players, matches, appearances, loading } = useData();
  const match = matches.find((m) => m.id === matchId);

  if (loading) return <Spinner />;
  if (!match) return <Navigate to="/admin/matches" replace />;

  return (
    <LineupInner
      key={matchId}
      match={match}
      players={players}
      existing={appearances.filter((a) => a.match_id === matchId)}
    />
  );
}

function LineupInner({ match, players, existing }) {
  const { refresh } = useData();

  // Saved appearances fill the first slots; the rest start empty.
  const [slots, setSlots] = useState(() => {
    const filled = existing
      .slice()
      .sort((a, b) => b.started - a.started)
      .map((a) => ({
        playerId: a.player_id,
        started: a.started,
        dropout: a.dropout ?? false,
        goals: a.goals,
        assists: a.assists,
        yellows: a.yellows,
        reds: a.reds,
        motm: a.motm,
      }));
    const pad = Math.max(DEFAULT_SLOTS - filled.length, 1);
    return [...filled, ...Array.from({ length: pad }, blankSlot)];
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const used = slots.filter((s) => s.playerId);
  const taken = new Set(used.map((s) => s.playerId));
  const active = used.filter((s) => !s.dropout);
  const starterCount = active.filter((s) => s.started).length;
  const dropoutCount = used.length - active.length;
  const goalsTotal = active.reduce((sum, s) => sum + Number(s.goals || 0), 0);
  const ownGoals = match.own_goals_for ?? 0;
  const goalsMismatch = match.goals_for != null && goalsTotal + ownGoals !== match.goals_for;

  function update(index, patch) {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
    setSaved(false);
  }

  function removeSlot(index) {
    setSlots((prev) => (prev.length <= 1 ? [blankSlot()] : prev.filter((_, i) => i !== index)));
    setSaved(false);
  }

  async function save() {
    setBusy(true);
    setError(null);
    const upserts = used.map((s) => ({
      match_id: match.id,
      player_id: s.playerId,
      started: s.dropout ? false : s.started,
      dropout: s.dropout,
      goals: s.dropout ? 0 : Number(s.goals) || 0,
      assists: s.dropout ? 0 : Number(s.assists) || 0,
      yellows: s.dropout ? 0 : Number(s.yellows) || 0,
      reds: s.dropout ? 0 : Number(s.reds) || 0,
      motm: s.dropout ? false : s.motm,
    }));
    const removedIds = existing.filter((a) => !taken.has(a.player_id)).map((a) => a.id);

    let err = null;
    if (upserts.length > 0) {
      ({ error: err } = await supabase
        .from('appearances')
        .upsert(upserts, { onConflict: 'match_id,player_id' }));
    }
    if (!err && removedIds.length > 0) {
      ({ error: err } = await supabase.from('appearances').delete().in('id', removedIds));
    }
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSaved(true);
    refresh();
  }

  return (
    <div className="section">
      <div className="section-head">
        <h2>Lineup &amp; stats — vs {match.opponent}, {formatDate(match.date)}</h2>
        <Link className="btn secondary small" to={`/admin/matches/${match.id}`}>Edit match</Link>
      </div>

      <div className="card">
        <p className="muted">
          Pick a player in each slot — start typing to search. Leave unused slots
          empty. {active.length} playing · {starterCount} starting
          {dropoutCount > 0 && ` · ${dropoutCount} dropped out`}.
        </p>
        {goalsMismatch && (
          <div className="notice error" style={{ margin: '0.6rem 0' }}>
            Player goals ({goalsTotal}) plus own goals ({ownGoals}) don’t add up
            to the match score ({match.goals_for}). Save is allowed, but check the numbers.
          </div>
        )}

        {players.length === 0 ? (
          <div className="empty">
            No players in the squad list yet — <Link to="/admin/players">add players</Link> first.
          </div>
        ) : (
          <>
            <div className="lineup-grid lineup-head">
              <span>#</span>
              <span>Player</span>
              <span>Role</span>
              <span className="num">Goals</span>
              <span className="num">Assists</span>
              <span className="num">YC</span>
              <span className="num">RC</span>
              <span>MOTM</span>
              <span />
            </div>
            {slots.map((slot, i) => (
              <div className="lineup-grid lineup-slot" key={i}>
                <span className="slot-no">{i + 1}</span>
                <PlayerPicker
                  players={players}
                  value={slot.playerId}
                  taken={taken}
                  onChange={(playerId) => update(i, { playerId })}
                />
                <select
                  value={slot.dropout ? 'dropout' : slot.started ? 'started' : 'sub'}
                  disabled={!slot.playerId}
                  onChange={(e) => {
                    const v = e.target.value;
                    update(i, v === 'dropout'
                      ? { dropout: true }
                      : { dropout: false, started: v === 'started' });
                  }}
                  aria-label={`Slot ${i + 1} role`}
                >
                  <option value="started">Started</option>
                  <option value="sub">Sub</option>
                  <option value="dropout">Dropped out</option>
                </select>
                {['goals', 'assists', 'yellows', 'reds'].map((stat) => (
                  <input
                    key={stat}
                    type="number"
                    min="0"
                    className="num"
                    value={slot.dropout ? 0 : slot[stat]}
                    disabled={!slot.playerId || slot.dropout}
                    onChange={(e) => update(i, { [stat]: e.target.value })}
                    aria-label={`Slot ${i + 1} ${stat}`}
                  />
                ))}
                <input
                  type="checkbox"
                  checked={slot.dropout ? false : slot.motm}
                  disabled={!slot.playerId || slot.dropout}
                  onChange={(e) => update(i, { motm: e.target.checked })}
                  aria-label={`Slot ${i + 1} man of the match`}
                />
                <button
                  type="button"
                  className="secondary small slot-remove"
                  onClick={() => removeSlot(i)}
                  aria-label={`Remove slot ${i + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
            <div className="form-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setSlots((p) => [...p, blankSlot()])}
              >
                Add slot
              </button>
            </div>
          </>
        )}

        {error && <div className="notice error" style={{ marginTop: '0.8rem' }}>{error}</div>}
        {saved && <div className="notice ok" style={{ marginTop: '0.8rem' }}>Saved.</div>}
        <div className="form-actions">
          <button onClick={save} disabled={busy || players.length === 0}>
            {busy ? 'Saving…' : 'Save lineup & stats'}
          </button>
          <Link className="btn secondary" to={`/admin/matches/${match.id}/report`}>
            Write match report
          </Link>
        </div>
      </div>
    </div>
  );
}
