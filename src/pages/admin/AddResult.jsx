import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useData } from '../../context/DataContext';
import { Spinner } from '../../components/bits';
import ExtrasStep from '../../components/add-result/ExtrasStep';
import GoalsStep from '../../components/add-result/GoalsStep';
import MatchStep from '../../components/add-result/MatchStep';
import SquadStep from '../../components/add-result/SquadStep';
import WalkoverForm from '../../components/WalkoverForm';
import WizardActions from '../../components/add-result/WizardActions';
import WizardSteps from '../../components/add-result/WizardSteps';
import { latestResult, seasonsOf } from '../../lib/matches';

/**
 * Post-match entry as four questions, in the order the admin thinks about
 * them on a Sunday morning: what was the game, who played, who scored, and
 * the extras. Nothing is written to the database until the final step; every
 * step can go back. Subs and late dropouts stay in the full lineup editor —
 * this flow covers the common case with the fewest possible taps.
 */

const STEPS = ['The match', 'Who played?', 'Goals & assists', 'Cards & MOTM'];

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
  const { lastMatch, lastSquadIds } = useMemo(() => {
    const last = latestResult(matches);
    const ids = last
      ? new Set(
          appearances.filter((a) => a.match_id === last.id && !a.dropout).map((a) => a.player_id),
        )
      : new Set();
    return { lastMatch: last, lastSquadIds: ids };
  }, [matches, appearances]);
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

  function selectLastSquad() {
    setPicked((prev) => {
      const next = new Map(prev);
      for (const id of lastSquadIds) if (!next.has(id)) next.set(id, blank());
      return next;
    });
  }

  function pickMotm(id) {
    setPicked((prev) => {
      const next = new Map(prev);
      const was = next.get(id).motm;
      // Single winner: picking one clears the rest.
      for (const [pid, v] of next) next.set(pid, { ...v, motm: false });
      next.set(id, { ...next.get(id), motm: !was });
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
      <WizardSteps steps={STEPS} step={step} />

      {step === 0 && (
        <MatchStep
          form={form}
          setForm={setForm}
          recentSeasons={recentSeasons}
          defaultSeason={defaultSeason}
          teams={teams}
        />
      )}

      {step === 1 && (
        <SquadStep
          listed={listed}
          picked={picked}
          lastSquadIds={lastSquadIds}
          lastMatch={lastMatch}
          query={query}
          setQuery={setQuery}
          onToggle={toggle}
          onSelectLastSquad={selectLastSquad}
        />
      )}

      {step === 2 && (
        <GoalsStep
          selected={selected}
          picked={picked}
          gf={gf}
          ownGoals={ownGoals}
          scored={scored}
          remaining={remaining}
          onPatch={patch}
        />
      )}

      {step === 3 && (
        <ExtrasStep selected={selected} picked={picked} onPatch={patch} onPickMotm={pickMotm} />
      )}

      {error && <div className="notice error" style={{ marginTop: '0.8rem' }}>{error}</div>}

      <WizardActions
        steps={STEPS}
        step={step}
        pickedCount={picked.size}
        nonScorerCount={nonScorers.length}
        detailsOk={detailsOk}
        busy={busy}
        onBack={() => setStep(step - 1)}
        onNext={() => setStep(step + 1)}
        onSave={save}
      />
    </div>
  );
}
