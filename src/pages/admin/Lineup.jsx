import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useData } from '../../context/DataContext';
import { Spinner } from '../../components/bits';
import { formatDate } from '../../lib/stats';

const BLANK_STATS = { started: true, goals: 0, assists: 0, yellows: 0, reds: 0, motm: false };

export default function Lineup() {
  const { matchId } = useParams();
  const { players, matches, appearances, loading } = useData();
  const match = matches.find((m) => m.id === matchId);

  if (loading) return <Spinner />;
  if (!match) return <Navigate to="/admin/matches" replace />;

  const existing = appearances.filter((a) => a.match_id === matchId);
  return (
    <LineupInner
      key={matchId}
      match={match}
      players={players}
      existing={existing}
    />
  );
}

function LineupInner({ match, players, existing }) {
  const { refresh } = useData();
  // rows: playerId -> stats (present = in the squad for this match)
  const [rows, setRows] = useState(() => {
    const map = new Map();
    for (const a of existing) {
      map.set(a.player_id, {
        started: a.started,
        goals: a.goals,
        assists: a.assists,
        yellows: a.yellows,
        reds: a.reds,
        motm: a.motm,
      });
    }
    return map;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const ordered = useMemo(() => {
    const posRank = { GK: 0, DEF: 1, MID: 2, FWD: 3 };
    return players
      .slice()
      .sort(
        (a, b) =>
          (a.status === 'inactive') - (b.status === 'inactive') ||
          posRank[a.position] - posRank[b.position] ||
          a.name.localeCompare(b.name),
      );
  }, [players]);

  const selectedCount = rows.size;
  const starterCount = [...rows.values()].filter((r) => r.started).length;
  const goalsTotal = [...rows.values()].reduce((sum, r) => sum + Number(r.goals || 0), 0);
  const ownGoals = match.own_goals_for ?? 0;
  const goalsMismatch =
    match.goals_for != null && goalsTotal + ownGoals !== match.goals_for;

  function toggle(playerId) {
    setRows((prev) => {
      const next = new Map(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.set(playerId, { ...BLANK_STATS });
      return next;
    });
    setSaved(false);
  }

  function update(playerId, key, value) {
    setRows((prev) => {
      const next = new Map(prev);
      next.set(playerId, { ...next.get(playerId), [key]: value });
      return next;
    });
    setSaved(false);
  }

  async function save() {
    setBusy(true);
    setError(null);
    const upserts = [...rows.entries()].map(([player_id, r]) => ({
      match_id: match.id,
      player_id,
      started: r.started,
      goals: Number(r.goals) || 0,
      assists: Number(r.assists) || 0,
      yellows: Number(r.yellows) || 0,
      reds: Number(r.reds) || 0,
      motm: r.motm,
    }));
    const removedIds = existing
      .filter((a) => !rows.has(a.player_id))
      .map((a) => a.id);

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
        <h2>
          Lineup & stats — vs {match.opponent}, {formatDate(match.date)}
        </h2>
        <Link className="btn secondary small" to={`/admin/matches/${match.id}`}>Edit match</Link>
      </div>

      <div className="card">
        <p className="muted">
          Tick a player to put them in the squad, then mark starters and fill in
          their numbers. {selectedCount} selected · {starterCount} starting.
        </p>
        {goalsMismatch && (
          <div className="notice error" style={{ margin: '0.6rem 0' }}>
            Player goals ({goalsTotal}) plus own goals ({ownGoals}) don’t add up
            to the match score ({match.goals_for}). Save is allowed, but check the numbers.
          </div>
        )}
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Squad</th>
                <th>Player</th>
                <th>Pos</th>
                <th>Started</th>
                <th className="num">Goals</th>
                <th className="num">Assists</th>
                <th className="num">Yellows</th>
                <th className="num">Reds</th>
                <th>MOTM</th>
              </tr>
            </thead>
            <tbody>
              {ordered.map((p) => {
                const row = rows.get(p.id);
                const inSquad = Boolean(row);
                return (
                  <tr key={p.id} className="lineup-row">
                    <td>
                      <input
                        type="checkbox"
                        checked={inSquad}
                        onChange={() => toggle(p.id)}
                        aria-label={`Select ${p.name}`}
                      />
                    </td>
                    <td>
                      {p.name}
                      {p.status === 'inactive' && <span className="muted"> (inactive)</span>}
                    </td>
                    <td>{p.position}</td>
                    {inSquad ? (
                      <>
                        <td>
                          <select
                            value={row.started ? 'started' : 'sub'}
                            onChange={(e) => update(p.id, 'started', e.target.value === 'started')}
                          >
                            <option value="started">Started</option>
                            <option value="sub">Sub</option>
                          </select>
                        </td>
                        {['goals', 'assists', 'yellows', 'reds'].map((stat) => (
                          <td key={stat} className="num">
                            <input
                              type="number"
                              min="0"
                              value={row[stat]}
                              onChange={(e) => update(p.id, stat, e.target.value)}
                              aria-label={`${p.name} ${stat}`}
                            />
                          </td>
                        ))}
                        <td>
                          <input
                            type="checkbox"
                            checked={row.motm}
                            onChange={(e) => update(p.id, 'motm', e.target.checked)}
                            aria-label={`${p.name} man of the match`}
                          />
                        </td>
                      </>
                    ) : (
                      <td colSpan={6} className="muted">—</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {players.length === 0 && (
          <div className="empty">
            No players in the squad list yet — <Link to="/admin/players">add players</Link> first.
          </div>
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
