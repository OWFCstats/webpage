import { isPlayed } from '../../lib/matches';

/**
 * Facts worth a line, read off rows that already exist. Nothing here is stored
 * and nothing is invented: each line is only built when it's true, so a quiet
 * 0–0 gets a quiet page and the section disappears entirely.
 *
 * The phrasing lives with the component rather than in `lib/` because it's
 * copy about one match, not a derivation anything else can reuse.
 */
function milestonesOf(match, ctx) {
  const { squad, debutIds, seasonAppCount, margin, bestMargin } = ctx;
  const played = isPlayed(match);
  const milestones = [];

  const debutants = squad.filter((a) => debutIds.has(a.player_id));
  if (played && debutants.length > 0) {
    milestones.push({
      n: debutants.length,
      head: debutants.length === 1
        ? `${debutants[0].player.name} — first game of the season`
        : `${debutants.length} first appearances of the season`,
      sub: debutants.length === 1 ? null : debutants.map((a) => a.player.name).join(', '),
    });
  }
  for (const a of debutants.filter((d) => d.goals > 0)) {
    milestones.push({ n: a.goals, head: `${a.player.name} scores on their first appearance`, sub: null });
  }
  const mostApps = squad
    .slice()
    .sort((a, b) => (seasonAppCount.get(b.player_id) ?? 0) - (seasonAppCount.get(a.player_id) ?? 0))[0];
  if (played && mostApps && (seasonAppCount.get(mostApps.player_id) ?? 0) >= 5) {
    milestones.push({
      n: seasonAppCount.get(mostApps.player_id),
      head: `${mostApps.player.name} — appearance ${seasonAppCount.get(mostApps.player_id)} of the season`,
      sub: 'Most in the squad',
    });
  }
  if (played && margin != null && margin === bestMargin && margin > 0) {
    milestones.push({ n: `+${margin}`, head: 'Best winning margin of the season so far', sub: null });
  }
  if (played && match.goals_against === 0) {
    milestones.push({ n: 0, head: 'Clean sheet — credited to the whole squad', sub: null });
  }
  return milestones;
}

export default function WorthNoting({ match, ctx }) {
  const milestones = milestonesOf(match, ctx);
  if (milestones.length === 0) return null;
  return (
    <div className="sheet section">
      <h3 className="label ruled">Worth noting</h3>
      <ul className="milestones">
        {milestones.map((m, i) => (
          <li key={i}>
            <span className="badge-num">{m.n}</span>
            <span>
              <strong>{m.head}</strong>
              {m.sub && <span className="muted"> — {m.sub}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
