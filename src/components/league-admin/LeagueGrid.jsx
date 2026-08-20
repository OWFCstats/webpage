// The columns that are actually typed. Order matches how a published table
// reads across, which is the order the eye copies them in.
const STATS = [
  { key: 'played', label: 'P' },
  { key: 'won', label: 'W' },
  { key: 'drawn', label: 'D' },
  { key: 'lost', label: 'L' },
  { key: 'goals_for', label: 'GF' },
  { key: 'goals_against', label: 'GA' },
];

/**
 * The division as one grid: a row per club, typed on a phone with one save at
 * the bottom. Points and goal difference are shown but never sent — both come
 * off W/D/L and the goals (see leagueStandings), so there's nothing to keep in
 * step and two fewer boxes to fill in.
 */
export default function LeagueGrid({ rows, clubs, taken, onUpdate, onMove, onRemove }) {
  return (
    <>
      <div className="league-grid league-head section">
        <span className="label">Pos</span>
        <span className="label">Club</span>
        {STATS.map((s) => <span key={s.key} className="label num">{s.label}</span>)}
        <span className="label num">GD</span>
        <span className="label num">Pts</span>
        <span />
      </div>

      {rows.map((row, i) => {
        const gd = (Number(row.goals_for) || 0) - (Number(row.goals_against) || 0);
        const pts = (Number(row.won) || 0) * 3 + (Number(row.drawn) || 0);
        return (
          <div className="league-grid league-row" key={i}>
            <input
              type="number"
              min="1"
              className="num lg-pos"
              value={row.position}
              placeholder="—"
              onChange={(e) => onUpdate(i, { position: e.target.value })}
              aria-label={`Row ${i + 1} position`}
            />
            <select
              className="lg-club"
              value={row.team_id}
              onChange={(e) => onUpdate(i, { team_id: e.target.value })}
              aria-label={`Row ${i + 1} club`}
            >
              <option value="">— pick a club —</option>
              {clubs.map((t) => (
                <option key={t.id} value={t.id} disabled={t.id !== row.team_id && taken.has(t.id)}>
                  {t.name}{t.is_club ? ' (us)' : ''}
                </option>
              ))}
            </select>
            {STATS.map((s) => (
              // The label reads as a caption on a phone, where the header row
              // is off; on a wide screen the header does that job instead.
              <label className="lg-stat" key={s.key}>
                <span className="label">{s.label}</span>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  className="num"
                  value={row[s.key]}
                  onChange={(e) => onUpdate(i, { [s.key]: e.target.value })}
                  aria-label={`Row ${i + 1} ${s.label}`}
                />
              </label>
            ))}
            <span className="num lg-derived">{gd > 0 ? `+${gd}` : gd}<em className="label">GD</em></span>
            <span className="num lg-derived lg-pts">{pts}<em className="label">Pts</em></span>
            <span className="lg-actions">
              <button type="button" className="secondary small" aria-label={`Move row ${i + 1} up`}
                onClick={() => onMove(i, -1)} disabled={i === 0}>↑</button>
              <button type="button" className="secondary small" aria-label={`Move row ${i + 1} down`}
                onClick={() => onMove(i, 1)} disabled={i === rows.length - 1}>↓</button>
              <button type="button" className="danger small" aria-label={`Remove row ${i + 1}`}
                onClick={() => onRemove(i)}>×</button>
            </span>
          </div>
        );
      })}
    </>
  );
}
