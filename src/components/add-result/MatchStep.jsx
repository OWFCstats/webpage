import SeasonPicker from '../SeasonPicker';
import TeamPicker from '../TeamPicker';

/** Step one: what the game was. Leaving the score blank is how an upcoming
 *  fixture gets entered, which is why nothing here is required but the date
 *  and the opponent. */
export default function MatchStep({ form, setForm, recentSeasons, defaultSeason, teams }) {
  return (
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
  );
}
