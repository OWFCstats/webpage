import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useData } from '../../context/DataContext';
import { Spinner } from '../../components/bits';
import SeasonHonours from '../../components/awards-admin/SeasonHonours';
import { todayISO } from '../../lib/format';
import { isPlayed, seasonsOf } from '../../lib/matches';

/**
 * The end-of-season awards, one block a season: when the four go up, and the
 * one of them no formula produces.
 *
 * **Publishing is here because the honours are end-of-season awards and three
 * of the four are derived**, which means they have a winner from the first
 * whistle — after one game of 2026/27 all eleven players who turned up led the
 * appearance column and all eleven held The Dependable. `honoursSettled` in
 * `lib/awards.js` publishes a season on 1 July once its diary is empty, and
 * these switches are the override for the two things a calendar can't know:
 * the club wanting the trophies up on the night of the dinner, and a season
 * that has to be pulled back after a result went in wrong.
 *
 * One save at the bottom for both, because this page is opened once a year on a
 * phone at that dinner, not week by week.
 */

// The award_key this page writes. `season_awards` is keyed rather than
// columned, so the next hand-picked award the club invents is another entry
// here and a row in that table — no migration.
const AWARD_KEY = 'player-of-the-season';

const BLANK = { player_id: '', note: '', honours: 'auto' };

export default function AwardsAdmin() {
  const { matches, loading } = useData();
  const seasons = seasonsOf(matches);

  if (loading) return <Spinner />;

  return (
    <div className="section">
      <div className="sheet">
        <h2>Season honours</h2>
        <p className="muted">
          The four trophies go up on their own once a season is over. Player of
          the Season is voted, so it is the only name the site can’t fill in for
          itself.
        </p>
      </div>

      {seasons.length > 0 ? (
        <HonoursEditor seasons={seasons} />
      ) : (
        <div className="sheet empty section">
          No season on record yet — add a result first and this fills in.
        </div>
      )}
    </div>
  );
}

function HonoursEditor({ seasons }) {
  const { players, matches, seasonAwards, seasonStatus, refresh } = useData();
  const today = todayISO();
  const awards = new Map(
    seasonAwards.filter((r) => r.award_key === AWARD_KEY).map((r) => [r.season, r]),
  );
  const status = new Map(seasonStatus.map((r) => [r.season, r]));

  // How many fixtures a season still has in the diary — the other half of the
  // automatic rule, and the thing that stops 1 July trampling a cup final.
  const unplayed = new Map(
    seasons.map((s) => [s, matches.filter((m) => m.season === s && !isPlayed(m)).length]),
  );

  const [rows, setRows] = useState(() =>
    Object.fromEntries(
      seasons.map((season) => {
        const award = awards.get(season);
        const state = status.get(season);
        return [season, {
          player_id: award?.player_id ?? '',
          note: award?.note ?? '',
          // No row is "automatic", which is where every season starts and where
          // nearly all of them stay — so a save must be able to put a season
          // back to it, which is what deletes the row again.
          honours: state ? (state.honours_published ? 'on' : 'off') : 'auto',
        }];
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
    const has = (season) => Boolean(draft(season).player_id);
    const overridden = (season) => draft(season).honours !== 'auto';

    // Four writes, and each one is skipped when it has nothing to say. A season
    // cleared back to nobody deletes its award row so the cabinet goes back to
    // "not voted yet" rather than keeping a name nobody picked; a season put
    // back to Automatic deletes its status row for the same reason.
    const steps = [
      seasons.filter(has).length > 0 && (() => supabase
        .from('season_awards')
        .upsert(
          seasons.filter(has).map((season) => ({
            season,
            award_key: AWARD_KEY,
            player_id: draft(season).player_id,
            note: draft(season).note.trim() || null,
            updated_at: now,
          })),
          { onConflict: 'season,award_key' },
        )),
      seasons.some((s) => !has(s) && awards.has(s)) && (() => supabase
        .from('season_awards')
        .delete()
        .in('id', seasons.filter((s) => !has(s) && awards.has(s)).map((s) => awards.get(s).id))),
      seasons.filter(overridden).length > 0 && (() => supabase
        .from('season_status')
        .upsert(
          seasons.filter(overridden).map((season) => ({
            season,
            honours_published: draft(season).honours === 'on',
            updated_at: now,
          })),
          { onConflict: 'season' },
        )),
      seasons.some((s) => !overridden(s) && status.has(s)) && (() => supabase
        .from('season_status')
        .delete()
        .in(
          'id',
          seasons.filter((s) => !overridden(s) && status.has(s)).map((s) => status.get(s).id),
        )),
    ];

    for (const step of steps) {
      if (!step) continue;
      const { error: err } = await step();
      if (err) {
        setBusy(false);
        setError(err.message);
        return;
      }
    }

    setBusy(false);
    setSaved(true);
    refresh();
  }

  return (
    <div className="sheet section">
      {seasons.map((season) => (
        <SeasonHonours
          key={season}
          season={season}
          players={players}
          draft={draft(season)}
          award={awards.get(season) ?? null}
          status={status.get(season) ?? null}
          unplayed={unplayed.get(season) ?? 0}
          today={today}
          onChange={(patch) => update(season, patch)}
        />
      ))}

      {error && <div className="notice error section">{error}</div>}
      {saved && <div className="notice ok section">Saved.</div>}

      <div className="form-actions">
        <button type="button" onClick={save} disabled={busy}>
          {busy ? 'Saving…' : 'Save honours'}
        </button>
      </div>
    </div>
  );
}
