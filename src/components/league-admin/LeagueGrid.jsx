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

/** What the form box will accept: W, D and L, upper-cased, five at most — the
 *  same rule as the check constraint on `league_rows.form`, so a string the
 *  database would reject never gets typed in the first place. Anything else is
 *  dropped as it is pressed rather than flagged on save: the alternative on a
 *  phone is a red box at the bottom of a sixteen-row table. */
const cleanForm = (value) => value.toUpperCase().replace(/[^WDL]/g, '').slice(0, 5);

/**
 * The division as one grid: a row per club, typed on a phone with one save at
 * the bottom. Points and goal difference are shown but never sent — both are
 * worked out from W/D/L, the goals and WO (see leagueStandings), so there's
 * nothing to keep in step. WO is how many of a club's losses were walkovers —
 * each one costs 3 points on top of the loss itself, for any club, not just us.
 *
 * Form is the one box here that isn't a number, and the one column that isn't
 * on every row. A rival's last five is typed, because a W/D/L total carries no
 * order and nothing we hold can produce it; ours is derived from our own league
 * results and shows as read-only chips, so the column has one source per row
 * and never two. `ourForm` is that derivation, handed down by the page.
 */
export default function LeagueGrid({ rows, clubs, taken, ourForm, onUpdate, onMove, onRemove }) {
  const clubById = new Map(clubs.map((t) => [t.id, t]));
  return (
    <>
      <div className="league-grid league-head section">
        <span className="label">Pos</span>
        <span className="label">Club</span>
        {STATS.map((s) => <span key={s.key} className="label num">{s.label}</span>)}
        <span className="label num">GD</span>
        <span className="label num">WO</span>
        <span className="label num">Pts</span>
        <span className="label">Form</span>
        <span />
      </div>

      {rows.map((row, i) => {
        const isUs = clubById.get(row.team_id)?.is_club === true;
        const gd = (Number(row.goals_for) || 0) - (Number(row.goals_against) || 0);
        const walkoverLosses = Number(row.walkover_losses) || 0;
        const pts = (Number(row.won) || 0) * 3 + (Number(row.drawn) || 0) - walkoverLosses * 3;
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
            <label className="lg-stat" key="walkover_losses">
              <span className="label">WO</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                className="num"
                value={row.walkover_losses}
                onChange={(e) => onUpdate(i, { walkover_losses: e.target.value })}
                aria-label={`Row ${i + 1} walkover losses`}
                title="Losses that were walkovers — each costs 3 points on top of the loss"
              />
            </label>
            <span className="num lg-derived lg-pts">{pts}<em className="label">Pts</em></span>
            {isUs ? (
              // Our own run, off our own results. Read-only rather than
              // disabled-and-empty: the point is that it is already known.
              <span className="lg-form lg-ours">
                <span className="label">Form, from our results</span>
                {ourForm.length > 0 ? (
                  <span className="chips">
                    {ourForm.map((r, n) => <span key={n} className={`chip ${r}`}>{r}</span>)}
                  </span>
                ) : (
                  <span className="muted">No league games yet</span>
                )}
              </span>
            ) : (
              <label className="lg-form">
                <span className="label">Form, oldest first — WDLWW</span>
                <input
                  type="text"
                  className="lg-form-input"
                  value={row.form}
                  placeholder="WDLWW"
                  maxLength={5}
                  // Belt and braces with cleanForm: the attribute is what a
                  // browser's own validation and a screen reader read, the
                  // function is what actually stops an X appearing. Empty is
                  // allowed — a club that has played nothing has no run.
                  pattern="[WDL]{0,5}"
                  title="Up to five results, oldest first — W, D or L"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  onChange={(e) => onUpdate(i, { form: cleanForm(e.target.value) })}
                  aria-label={`Row ${i + 1} recent form, oldest first`}
                />
              </label>
            )}
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
