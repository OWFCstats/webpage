import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useData } from '../../context/DataContext';
import { Spinner } from '../../components/bits';
import LineupSlot from '../../components/lineup/LineupSlot';
import { formatDate } from '../../lib/format';

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

  /** One a game — the badge says so and the wizard already enforced it, but
   *  this editor used a plain checkbox per slot, so a lineup could be saved
   *  with eleven Men of the Match and every one of them counted towards the
   *  award and the badge. Picking one clears the rest, as it does in the
   *  wizard. */
  function pickMotm(index, on) {
    setSlots((prev) => prev.map((s, i) => ({ ...s, motm: on && i === index })));
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

      <div className="sheet">
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
              <span className="label">#</span>
              <span className="label">Player</span>
              <span className="label">Role</span>
              <span className="label num">Goals</span>
              <span className="label num">Assists</span>
              <span className="label num">YC</span>
              <span className="label num">RC</span>
              <span className="label">MOTM</span>
              <span />
            </div>
            {slots.map((slot, i) => (
              <LineupSlot
                key={i}
                index={i}
                slot={slot}
                players={players}
                taken={taken}
                onUpdate={(patch) => update(i, patch)}
                onPickMotm={(on) => pickMotm(i, on)}
                onRemove={() => removeSlot(i)}
              />
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
        {/* Sticky on a phone, like the league grid's: fifteen slots is a long
            way to scroll back up to a save. */}
        <div className="form-actions lineup-actions">
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
