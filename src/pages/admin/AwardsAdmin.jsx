import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useData } from '../../context/DataContext';
import { Spinner } from '../../components/bits';
import PlayerPicker from '../../components/PlayerPicker';
import { formatDateTime } from '../../lib/format';
import { seasonsOf } from '../../lib/matches';

/**
 * Player of the Season — the one award on the honours board no formula
 * produces. Golden Boot, Assist King, The Dependable and Most MOTM all come
 * off the appearance rows; this one is voted, so somebody has to type it.
 *
 * One block per season with a single save at the bottom, because it's entered
 * once a year on a phone at the end-of-season dinner, not week by week.
 */

// The award_key this page writes. The table is keyed rather than columned, so
// the next hand-picked award the club invents is another entry here and a row
// in `season_awards` — no migration.
const AWARD_KEY = 'player-of-the-season';

const BLANK = { player_id: '', note: '' };

export default function AwardsAdmin() {
  const { matches, loading } = useData();
  const seasons = seasonsOf(matches);

  if (loading) return <Spinner />;

  return (
    <div className="section">
      <div className="sheet">
        <h2>Player of the Season</h2>
        <p className="muted">
          Voted by the players. Everything else on the honours board is worked
          out from the results, so this is the only name the site can’t fill in
          for itself.
        </p>
      </div>

      {seasons.length > 0 ? (
        <AwardsEditor seasons={seasons} />
      ) : (
        <div className="sheet empty section">
          No season on record yet — add a result first and this fills in.
        </div>
      )}
    </div>
  );
}

function AwardsEditor({ seasons }) {
  const { players, seasonAwards, refresh } = useData();
  const existing = new Map(
    seasonAwards.filter((r) => r.award_key === AWARD_KEY).map((r) => [r.season, r]),
  );

  const [rows, setRows] = useState(() =>
    Object.fromEntries(
      seasons.map((season) => {
        const row = existing.get(season);
        return [season, { player_id: row?.player_id ?? '', note: row?.note ?? '' }];
      }),
    ),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  // Falls back to a blank draft rather than indexing straight in: a season
  // that appears after this form mounted (a first result entered elsewhere)
  // has no draft yet, and reading through it would take the page down.
  const draft = (season) => rows[season] ?? BLANK;

  function update(season, patch) {
    setRows((prev) => ({ ...prev, [season]: { ...(prev[season] ?? BLANK), ...patch } }));
    setSaved(false);
  }

  async function save() {
    setBusy(true);
    setError(null);
    const now = new Date().toISOString();
    const payload = seasons
      .filter((season) => draft(season).player_id)
      .map((season) => ({
        season,
        award_key: AWARD_KEY,
        player_id: draft(season).player_id,
        note: draft(season).note.trim() || null,
        updated_at: now,
      }));
    // A season cleared back to nobody deletes its row, so the honours board
    // goes back to "not voted yet" rather than keeping a name nobody picked.
    const cleared = seasons
      .filter((season) => !draft(season).player_id && existing.has(season))
      .map((season) => existing.get(season).id);

    let err = null;
    if (payload.length > 0) {
      ({ error: err } = await supabase
        .from('season_awards')
        .upsert(payload, { onConflict: 'season,award_key' }));
    }
    if (!err && cleared.length > 0) {
      ({ error: err } = await supabase.from('season_awards').delete().in('id', cleared));
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
      {seasons.map((season) => {
        const row = existing.get(season);
        return (
          <div className="award-row" key={season}>
            <div className="section-head">
              <h3>{season}</h3>
              <span className="muted">
                {row ? `Recorded ${formatDateTime(row.updated_at)}` : 'Not recorded yet'}
              </span>
            </div>
            <div className="field">
              <span>Winner</span>
              <PlayerPicker
                players={players}
                value={draft(season).player_id}
                onChange={(id) => update(season, { player_id: id ?? '' })}
                placeholder="Search player…"
              />
            </div>
            <label className="field">
              <span>Note (optional)</span>
              <input
                type="text"
                value={draft(season).note}
                placeholder="Voted at the end-of-season dinner"
                onChange={(e) => update(season, { note: e.target.value })}
              />
            </label>
          </div>
        );
      })}

      {error && <div className="notice error section">{error}</div>}
      {saved && <div className="notice ok section">Saved.</div>}

      <div className="form-actions">
        <button type="button" onClick={save} disabled={busy}>
          {busy ? 'Saving…' : 'Save awards'}
        </button>
      </div>
    </div>
  );
}
