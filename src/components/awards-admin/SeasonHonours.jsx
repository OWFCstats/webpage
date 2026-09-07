import PlayerPicker from '../PlayerPicker';
import { honoursDate } from '../../lib/awards';
import { formatDate, formatDateTime, plural } from '../../lib/format';

/**
 * The three answers to "are this season's honours up yet". Automatic first
 * because it is the right answer for nearly every season and the one a save
 * should not quietly move a season off.
 *
 * A select rather than the segmented control the rest of the site would reach
 * for: three honest labels in a `.seg` want about 276px of a 375px phone's
 * 311px and more than a 320px one has at all, and `.seg` neither wraps nor
 * scrolls. A native picker is also the better control on the phone this page is
 * filled in on — one tap for a sheet of three, rather than three targets in a
 * row that has to be measured.
 */
const CHOICES = [
  { id: 'auto', label: 'Automatic' },
  { id: 'on', label: 'Published now' },
  { id: 'off', label: 'Held back' },
];

/**
 * What this season's honours are doing, in one line, in the admin's own terms.
 *
 * The rule itself is `honoursSettled` in `lib/awards.js` and this says the same
 * thing in words: the date it goes up on, or what it is still waiting for. An
 * admin standing in a pub deciding whether to choose *Published now* needs to
 * be told that it happens on its own in a fortnight, and there is nowhere else
 * on the site that could tell them.
 */
function stateLine(choice, season, unplayed, today) {
  if (choice === 'on') return 'On the honours board now.';
  if (choice === 'off') return 'Held back — the cabinet shows this season as in play.';
  const from = honoursDate(season);
  if (!from) return 'On the honours board.';
  if (today < from) return `Goes up on its own on ${formatDate(from)}.`;
  if (unplayed > 0) {
    return `${plural(unplayed, 'fixture', 'fixtures')} still in the diary — the honours wait for the last one.`;
  }
  return `On the honours board since ${formatDate(from)}.`;
}

/**
 * One season's end-of-season awards: when the four go up, and the one of them
 * nobody can derive.
 *
 * The two belong on the same block because they are one job done once a year at
 * the same table — the vote is taken at the dinner and the trophies go up that
 * night. Splitting them would mean an admin typing the winner on one screen and
 * publishing them on another, which is how a season ends up voted on and
 * invisible.
 */
export default function SeasonHonours({
  season,
  players,
  draft,
  award,
  status,
  unplayed,
  today,
  onChange,
}) {
  return (
    <div className="award-row">
      <div className="section-head">
        <h3>{season}</h3>
        <span className="muted">
          {award ? `Recorded ${formatDateTime(award.updated_at)}` : 'Not recorded yet'}
        </span>
      </div>

      <div className="field">
        <span>Honours</span>
        <select
          value={draft.honours}
          aria-label={`${season} honours`}
          onChange={(e) => onChange({ honours: e.target.value })}
        >
          {CHOICES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
        {/* `small`, not a second `span`: `.field > span` is the column-header
            voice a control's label wears, and this is a sentence. */}
        <small className="muted">
          {stateLine(draft.honours, season, unplayed, today)}
          {status && ` Set ${formatDateTime(status.updated_at)}.`}
        </small>
      </div>

      <div className="field">
        <span>Player of the Season</span>
        <PlayerPicker
          players={players}
          value={draft.player_id}
          onChange={(id) => onChange({ player_id: id ?? '' })}
          placeholder="Search player…"
        />
      </div>

      <label className="field">
        <span>Note (optional)</span>
        <input
          type="text"
          value={draft.note}
          placeholder="Voted at the end-of-season dinner"
          onChange={(e) => onChange({ note: e.target.value })}
        />
      </label>
    </div>
  );
}
