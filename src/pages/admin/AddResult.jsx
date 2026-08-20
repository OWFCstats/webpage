import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useData } from '../../context/DataContext';
import { Spinner } from '../../components/bits';
import { formatDate, latestResult, seasonsOf } from '../../lib/stats';
import TeamPicker from '../../components/TeamPicker';
import SeasonPicker from '../../components/SeasonPicker';
import WalkoverForm from './WalkoverForm';

/**
 * Post-match entry as four questions, in the order the admin thinks about
 * them on a Sunday morning: what was the game, who played, who scored, and
 * the extras. Nothing is written to the database until the final step; every
 * step can go back. Subs and late dropouts stay in the full lineup editor —
 * this flow covers the common case with the fewest possible taps.
 */

const STEPS = ['The match', 'Who played?', 'Goals & assists', 'Cards & MOTM'];

function initials(name) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function Stepper({ value, onChange, label, max = 99 }) {
  return (
    <span className="stepper">
      <span className="label">{label}</span>
      <span className="stepper-controls">
        <button type="button" className="secondary small" aria-label={`Fewer ${label}`}
          onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0}>−</button>
        <b>{value}</b>
        <button type="button" className="secondary small" aria-label={`More ${label}`}
          onClick={() => onChange(Math.min(max, value + 1))}>+</button>
      </span>
    </span>
  );
}

export default function AddResult() {
  const { players, matches, appearances, teams, loading, refresh } = useData();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [showWalkover, setShowWalkover] = useState(false);

  const [form, setForm] = useState(() => ({
    season: '',
    date: '',
    kickoff_time: '',
    opponent: '',
    opponent_team_id: '',
    competition: 'League',
    venue: '',
    goals_for: '',
    goals_against: '',
    own_goals_for: 0,
  }));
  const [picked, setPicked] = useState(() => new Map()); // playerId -> {goals,assists,yellows,reds,motm}
  const [query, setQuery] = useState('');

  // Last game's squad, for the one-tap default: an amateur side turns out
  // largely the same people each week.
  const lastSquadIds = useMemo(() => {
    const last = latestResult(matches);
    if (!last) return new Set();
    return new Set(
      appearances.filter((a) => a.match_id === last.id && !a.dropout).map((a) => a.player_id),
    );
  }, [matches, appearances]);
  const lastMatch = latestResult(matches);
  const recentSeasons = seasonsOf(matches).slice(0, 3);
  const defaultSeason = recentSeasons[0] ?? '';

  if (loading) return <Spinner />;

  const active = players
    .filter((p) => p.status === 'active' || picked.has(p.id))
    .sort(
      (a, b) =>
        lastSquadIds.has(b.id) - lastSquadIds.has(a.id) ||
        a.name.localeCompare(b.name),
    );

  const gf = form.goals_for === '' ? null : Number(form.goals_for);
  const ga = form.goals_against === '' ? null : Number(form.goals_against);
  const detailsOk = form.date && form.opponent_team_id && (form.season || defaultSeason);
  const scored = [...picked.values()].reduce((s, v) => s + v.goals, 0);
  const ownGoals = Number(form.own_goals_for) || 0;
  const remaining = gf == null ? null : gf - ownGoals - scored;

  const blank = () => ({ goals: 0, assists: 0, yellows: 0, reds: 0, motm: false });

  function toggle(id) {
    setPicked((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, blank());
      return next;
    });
  }

  function patch(id, changes) {
    setPicked((prev) => {
      const next = new Map(prev);
      next.set(id, { ...next.get(id), ...changes });
      return next;
    });
  }

  async function save() {
    setBusy(true);
    setError(null);
    const payload = {
      season: (form.season || defaultSeason).trim(),
      date: form.date,
      kickoff_time: form.kickoff_time || null,
      opponent: form.opponent.trim(),
      opponent_team_id: form.opponent_team_id || null,
      competition: form.competition.trim() || 'League',
      venue: form.venue || null,
      goals_for: gf,
      goals_against: ga,
      own_goals_for: ownGoals,
      own_goals_against: 0,
      result: gf == null || ga == null ? null : gf > ga ? 'W' : gf < ga ? 'L' : 'D',
    };
    const { data: created, error: mErr } = await supabase
      .from('matches').insert(payload).select().single();
    if (mErr) {
      setBusy(false);
      setError(mErr.message);
      return;
    }
    const rows = [...picked.entries()].map(([player_id, v]) => ({
      match_id: created.id,
      player_id,
      started: true,
      dropout: false,
      goals: v.goals,
      assists: v.assists,
      yellows: v.yellows,
      reds: v.reds,
      motm: v.motm,
    }));
    if (rows.length > 0) {
      const { error: aErr } = await supabase.from('appearances').insert(rows);
      if (aErr) {
        setBusy(false);
        setError(`The match saved but the lineup didn't: ${aErr.message}. Open the lineup editor to finish it.`);
        await refresh();
        return;
      }
    }
    await refresh();
    navigate(`/matchday/${created.id}`);
  }

  const q = query.trim().toLowerCase();
  const listed = active.filter((p) => !q || p.name.toLowerCase().includes(q));
  const selected = active.filter((p) => picked.has(p.id));
  const nonScorers = selected.filter((p) => picked.get(p.id).goals === 0 && picked.get(p.id).assists === 0);

  if (showWalkover) {
    return (
      <div className="section wizard">
        <div className="section-head">
          <h2>Add result</h2>
        </div>
        <WalkoverForm onDone={() => setShowWalkover(false)} onCancel={() => setShowWalkover(false)} />
      </div>
    );
  }

  return (
    <div className="section wizard">
      <div className="section-head">
        <h2>Add result</h2>
        <span className="controls" style={{ marginBottom: 0 }}>
          <span className="muted">Step {step + 1} of {STEPS.length}</span>
          <button type="button" className="secondary small" onClick={() => setShowWalkover(true)}>
            Walkover
          </button>
        </span>
      </div>
      <div className="wizard-steps" aria-hidden="true">
        {STEPS.map((s, i) => (
          <span key={s} className={i < step ? 'done' : i === step ? 'on' : undefined} />
        ))}
      </div>
      <p className="label wizard-title">{STEPS[step]}</p>

      {step === 0 && (
        <div className="sheet">
          <div className="form-grid">
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <span>Season</span>
              <SeasonPicker
                seasons={recentSeasons}
                value={form.season || defaultSeason}
                onChange={(season) => setForm({ ...form, season })}
              />
            </div>
            <label className="field">
              <span>Date</span>
              <input type="date" value={form.date} required
                onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </label>
            <label className="field">
              <span>Kick-off (optional)</span>
              <input type="time" value={form.kickoff_time}
                onChange={(e) => setForm({ ...form, kickoff_time: e.target.value })} />
            </label>
            <div className="field">
              <span>Opponent</span>
              <TeamPicker
                teams={teams}
                value={form.opponent_team_id}
                onChange={(opponent_team_id, opponent) => setForm({ ...form, opponent_team_id, opponent })}
              />
            </div>
            <label className="field">
              <span>Competition</span>
              <select value={form.competition}
                onChange={(e) => setForm({ ...form, competition: e.target.value })}>
                <option value="League">League</option>
                <option value="Cup">Cup</option>
                <option value="Friendly">Friendly</option>
              </select>
            </label>
            <label className="field">
              <span>Venue (optional)</span>
              <select value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}>
                <option value="">— not recorded —</option>
                <option value="H">Home</option>
                <option value="A">Away</option>
                <option value="N">Neutral</option>
              </select>
            </label>
            <label className="field">
              <span>Goals for</span>
              <input type="number" min="0" value={form.goals_for}
                onChange={(e) => setForm({ ...form, goals_for: e.target.value })} />
            </label>
            <label className="field">
              <span>Goals against</span>
              <input type="number" min="0" value={form.goals_against}
                onChange={(e) => setForm({ ...form, goals_against: e.target.value })} />
            </label>
            <label className="field">
              <span>Own goals (for us)</span>
              <input type="number" min="0" value={form.own_goals_for}
                onChange={(e) => setForm({ ...form, own_goals_for: e.target.value })} />
            </label>
          </div>
          <p className="muted" style={{ marginTop: '0.6rem' }}>
            Leave the score blank to enter an upcoming fixture — the later steps
            still work for naming the squad.
          </p>
        </div>
      )}

      {step === 1 && (
        <div className="sheet">
          <div className="controls">
            <input
              type="text"
              placeholder="Search the squad…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search players"
            />
            {lastMatch && lastSquadIds.size > 0 && (
              <button
                type="button"
                className="secondary small"
                onClick={() =>
                  setPicked((prev) => {
                    const next = new Map(prev);
                    for (const id of lastSquadIds) if (!next.has(id)) next.set(id, blank());
                    return next;
                  })
                }
              >
                Select last squad ({formatDate(lastMatch.date)})
              </button>
            )}
          </div>
          <ul className="pick-list">
            {listed.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className={`pick-row${picked.has(p.id) ? ' picked' : ''}`}
                  aria-pressed={picked.has(p.id)}
                  onClick={() => toggle(p.id)}
                >
                  <span className="avatar">{initials(p.name)}</span>
                  <span className="who">
                    {p.name}
                    {lastSquadIds.has(p.id) && <span className="muted"> · played last game</span>}
                  </span>
                  <span className="tick" aria-hidden="true">{picked.has(p.id) ? '✓' : ''}</span>
                </button>
              </li>
            ))}
          </ul>
          {listed.length === 0 && <div className="empty">No players match.</div>}
        </div>
      )}

      {step === 2 && (
        <div className="sheet">
          {gf != null && (
            <div className={`notice ${remaining === 0 ? 'ok' : 'error'}`} style={{ marginBottom: '0.8rem' }}>
              {remaining === 0
                ? `All ${gf} goals accounted for${ownGoals > 0 ? ` (including ${ownGoals} own goal${ownGoals > 1 ? 's' : ''})` : ''}.`
                : remaining > 0
                  ? `${remaining} of ${gf} goals still unassigned. Saving is allowed — credit them later if unknown.`
                  : `Players are credited with ${scored} goals but the score was ${gf}. Check the numbers.`}
            </div>
          )}
          <ul className="stat-list">
            {selected.map((p) => {
              const v = picked.get(p.id);
              return (
                <li key={p.id} className="stat-row">
                  <span className="avatar">{initials(p.name)}</span>
                  <span className="who">{p.name}</span>
                  <span className="steppers">
                    <Stepper label="Goals" value={v.goals} onChange={(goals) => patch(p.id, { goals })} />
                    <Stepper label="Assists" value={v.assists} onChange={(assists) => patch(p.id, { assists })} />
                  </span>
                </li>
              );
            })}
          </ul>
          {selected.length === 0 && (
            <div className="empty">Nobody selected yet — go back a step and pick the squad.</div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="sheet">
          <h3>Man of the Match</h3>
          <div className="squad-pills" style={{ margin: '0.5rem 0 1.1rem' }}>
            {selected.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`squad-pill as-button${picked.get(p.id).motm ? ' motm' : ''}`}
                aria-pressed={picked.get(p.id).motm}
                onClick={() =>
                  setPicked((prev) => {
                    const next = new Map(prev);
                    const was = next.get(p.id).motm;
                    // Single winner: picking one clears the rest.
                    for (const [id, v] of next) next.set(id, { ...v, motm: false });
                    next.set(p.id, { ...next.get(p.id), motm: !was });
                    return next;
                  })
                }
              >
                {p.name}
              </button>
            ))}
          </div>
          <h3>Cards</h3>
          <p className="muted">Only if there were any.</p>
          <ul className="stat-list">
            {selected.map((p) => {
              const v = picked.get(p.id);
              return (
                <li key={p.id} className="stat-row">
                  <span className="avatar">{initials(p.name)}</span>
                  <span className="who">{p.name}</span>
                  <span className="steppers">
                    <Stepper label="Yellow" value={v.yellows} onChange={(yellows) => patch(p.id, { yellows })} max={2} />
                    <Stepper label="Red" value={v.reds} onChange={(reds) => patch(p.id, { reds })} max={1} />
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="muted" style={{ marginTop: '0.8rem' }}>
            Everyone saves as a starter. Subs and late dropouts can be set
            afterwards in the lineup editor — one click from the match list.
          </p>
        </div>
      )}

      {error && <div className="notice error" style={{ marginTop: '0.8rem' }}>{error}</div>}

      <div className="form-actions wizard-actions">
        {step > 0 ? (
          <button type="button" className="secondary" onClick={() => setStep(step - 1)}>Back</button>
        ) : (
          <Link className="btn secondary" to="/admin">Cancel</Link>
        )}
        {step === 1 && <span className="muted">{picked.size} selected</span>}
        {step === 2 && nonScorers.length > 0 && (
          <span className="muted">{nonScorers.length} with no goal involvement — that's fine</span>
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            disabled={step === 0 ? !detailsOk : step === 1 ? picked.size === 0 : false}
          >
            {step === 0 ? 'Next — who played?' : step === 1 ? 'Next — who scored?' : 'Next — cards & MOTM'}
          </button>
        ) : (
          <button type="button" onClick={save} disabled={busy}>
            {busy ? 'Saving…' : 'Save match'}
          </button>
        )}
      </div>
      <p className="muted wizard-note">
        Nothing is saved until the last step, and you can go back at any point.
      </p>
    </div>
  );
}
