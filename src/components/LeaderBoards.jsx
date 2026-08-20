import BarBoard, { LeadBoard } from './BarBoard';

/**
 * The stats a leaderboard runs through, in the order it reads them: what a
 * player wants their name against first. One list, in one place, because
 * Players and Records ask the same question of the same rows — and because the
 * next stat the club starts counting should appear on both by being added here.
 *
 * `unit` is only set where a per-game rate means something. "1.00 appearances
 * per game" is arithmetic, not a fact about a player.
 */
const STATS = [
  { key: 'goals', label: 'Goals', unit: 'goals' },
  { key: 'assists', label: 'Assists', unit: 'assists' },
  { key: 'goalInvolvements', label: 'Goals + assists', unit: 'involvements' },
  { key: 'appearances', label: 'Appearances' },
  { key: 'motm', label: 'Man of the Match' },
  { key: 'cleanSheets', label: 'Clean sheets' },
];

export const LEADERBOARD_STATS = STATS.map((s) => s.key);

/**
 * Every board at once, rather than one behind a row of chips. Clicking to find
 * out who is top of anything is what made the old page read as a database — the
 * whole point of the board is that you can see where your name isn't.
 *
 * `lead` promotes one stat to the dark headline band. At most one: a page
 * carries a single `.board`, and the stat the page is really about is the one
 * that earns it (see docs/DESIGN.md, *Surfaces*).
 */
export default function LeaderBoards({ rows, lead = null, stats = LEADERBOARD_STATS, limit = 6 }) {
  const chosen = stats.map((key) => STATS.find((s) => s.key === key)).filter(Boolean);
  const headline = lead ? chosen.find((s) => s.key === lead) : null;
  const rest = chosen.filter((s) => s !== headline);

  return (
    <>
      {headline && (
        <LeadBoard
          title={headline.label}
          unit={headline.unit}
          rows={rows}
          statKey={headline.key}
          limit={limit}
        />
      )}
      <div className={`grid boards${headline ? ' section' : ''}`}>
        {rest.map((s) => (
          <BarBoard key={s.key} title={s.label} rows={rows} statKey={s.key} limit={limit} />
        ))}
      </div>
    </>
  );
}
