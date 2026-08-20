import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useData } from '../../context/DataContext';
import { Spinner } from '../../components/bits';
import SeasonPicker from '../../components/SeasonPicker';
import LeagueGrid from '../../components/league-admin/LeagueGrid';
import { formatDateTime } from '../../lib/format';
import { leagueStandings } from '../../lib/league';
import { seasonsOf } from '../../lib/matches';

/**
 * The one screen on this site that takes numbers nobody here played for: the
 * published league table, typed in after the results come in. It's edited on a
 * phone on a Saturday night, so the whole division is one grid with one save
 * at the bottom — no per-row submit, no navigation between clubs.
 *
 * Points and goal difference are shown but never sent: both are derived from
 * W/D/L and the goals (see leagueStandings), so there's nothing to keep in
 * step and two fewer boxes to fill in.
 */

const blankRow = () => ({
  team_id: '',
  position: '',
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goals_for: 0,
  goals_against: 0,
});

export default function LeagueAdmin() {
  const { matches, leagueRows, teams, loading } = useData();
  const seasons = seasonsOf(matches);
  const [season, setSeason] = useState(() => seasons[0] ?? '');

  if (loading) return <Spinner />;

  return (
    <div className="section">
      <div className="sheet">
        <h2>League table</h2>
        <p className="muted">
          Standings as published by the league — the only figures here that
          aren’t worked out from our own results.
        </p>
        <div className="field section">
          <span>Season</span>
          <SeasonPicker seasons={seasons.slice(0, 3)} value={season} onChange={setSeason} />
        </div>
      </div>

      {season ? (
        // Keyed on the season so switching seasons loads that table fresh
        // rather than leaving the previous one's numbers in the boxes.
        <SeasonEditor
          key={season}
          season={season}
          existing={leagueRows.filter((r) => r.season === season)}
          teams={teams}
        />
      ) : (
        <div className="sheet empty">Pick a season above to enter its table.</div>
      )}
    </div>
  );
}

function SeasonEditor({ season, existing, teams }) {
  const { refresh } = useData();
  const { rows: sorted, division: savedDivision, updatedAt } = leagueStandings(existing, teams, season);

  const [division, setDivision] = useState(savedDivision ?? '');
  const [rows, setRows] = useState(() =>
    sorted.length > 0
      ? sorted.map((r) => ({
          team_id: r.team_id,
          position: r.position ?? '',
          played: r.played,
          won: r.won,
          drawn: r.drawn,
          lost: r.lost,
          goals_for: r.goals_for,
          goals_against: r.goals_against,
        }))
      : [blankRow()],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const clubs = teams.slice().sort((a, b) => a.name.localeCompare(b.name));
  const used = rows.filter((r) => r.team_id);
  const taken = new Set(used.map((r) => r.team_id));
  const duplicate = taken.size !== used.length;

  function update(index, patch) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    setSaved(false);
  }

  function removeRow(index) {
    setRows((prev) => (prev.length <= 1 ? [blankRow()] : prev.filter((_, i) => i !== index)));
    setSaved(false);
  }

  /** Swap a row with its neighbour, positions included — dragging a club up
   *  the table shouldn't leave its typed position behind. */
  function move(index, delta) {
    const to = index + delta;
    if (to < 0 || to >= rows.length) return;
    setRows((prev) => {
      const next = prev.slice();
      const a = { ...next[index] };
      const b = { ...next[to] };
      [a.position, b.position] = [b.position, a.position];
      next[index] = b;
      next[to] = a;
      return next;
    });
    setSaved(false);
  }

  /** Number the rows 1..n down the grid, for the common case where the order
   *  on screen is already right and only the numbers are missing. */
  function renumber() {
    setRows((prev) => prev.map((r, i) => ({ ...r, position: i + 1 })));
    setSaved(false);
  }

  async function save() {
    if (duplicate) {
      setError('Two rows have the same club — each club appears once per season.');
      return;
    }
    setBusy(true);
    setError(null);
    // One timestamp for the whole save: the table was published as a table,
    // not row by row.
    const now = new Date().toISOString();
    const payload = used.map((r) => ({
      season,
      division: division.trim() || null,
      team_id: r.team_id,
      position: r.position === '' ? null : Number(r.position),
      played: Number(r.played) || 0,
      won: Number(r.won) || 0,
      drawn: Number(r.drawn) || 0,
      lost: Number(r.lost) || 0,
      goals_for: Number(r.goals_for) || 0,
      goals_against: Number(r.goals_against) || 0,
      updated_at: now,
    }));
    // Rows dropped from the grid are deleted, so relegating a club out of the
    // division doesn't leave it sitting in the table forever.
    const removedIds = existing.filter((r) => !taken.has(r.team_id)).map((r) => r.id);

    let err = null;
    if (payload.length > 0) {
      ({ error: err } = await supabase
        .from('league_rows')
        .upsert(payload, { onConflict: 'season,team_id' }));
    }
    if (!err && removedIds.length > 0) {
      ({ error: err } = await supabase.from('league_rows').delete().in('id', removedIds));
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
    <div className="sheet section">
      <div className="section-head">
        <h2>{season}</h2>
        <span className="muted">
          {updatedAt ? `Last updated ${formatDateTime(updatedAt)}` : 'Not entered yet'}
        </span>
      </div>

      <label className="field">
        <span>Division</span>
        <input
          type="text"
          value={division}
          placeholder="Arthurian League Division 5"
          onChange={(e) => { setDivision(e.target.value); setSaved(false); }}
        />
      </label>

      <LeagueGrid
        rows={rows}
        clubs={clubs}
        taken={taken}
        onUpdate={update}
        onMove={move}
        onRemove={removeRow}
      />

      <div className="form-actions">
        <button type="button" className="secondary" onClick={() => { setRows((p) => [...p, blankRow()]); setSaved(false); }}>
          Add a club
        </button>
        <button type="button" className="secondary" onClick={renumber}>Number 1–{rows.length}</button>
      </div>

      <p className="muted section">
        Leave a position blank and the club is ranked on points, then goal
        difference, then goals scored. Type one — or use the arrows — wherever
        the league’s own order differs, after a tie-break or a points deduction.
      </p>

      {duplicate && (
        <div className="notice error">Two rows have the same club — each club appears once per season.</div>
      )}
      {error && <div className="notice error" style={{ marginTop: '0.8rem' }}>{error}</div>}
      {saved && <div className="notice ok" style={{ marginTop: '0.8rem' }}>Saved.</div>}

      <div className="form-actions league-actions">
        <button type="button" className="league-save" onClick={save} disabled={busy || duplicate}>
          {busy ? 'Saving…' : `Save table (${used.length} club${used.length === 1 ? '' : 's'})`}
        </button>
      </div>
    </div>
  );
}
