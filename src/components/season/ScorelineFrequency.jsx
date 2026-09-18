import { useMemo } from 'react';
import { scorelineFrequency } from '../../lib/matches';

// Seven rows fit a phone without the card growing past the tiles above it —
// the full list is still in `lib/matches.js`, just not all drawn.
const SHOWN = 7;

/** Which final scores have actually come round again, as bars rather than a
 *  data table — every figure here is already printed on the row. One season
 *  at a time: across every season this is a career tally, and that's
 *  Records' (CLAUDE.md → *Sections*). */
export default function ScorelineFrequency({ season, matches }) {
  const entries = useMemo(
    () => scorelineFrequency(matches.filter((m) => m.season === season)),
    [season, matches],
  );
  const shown = entries.slice(0, SHOWN);
  const max = shown[0]?.count ?? 0;

  return (
    <section className="sheet">
      <span className="label ruled">Most frequent scorelines</span>
      {shown.length === 0 ? (
        <div className="empty">Not enough data yet — this fills in as matches are recorded.</div>
      ) : (
        <div className="hbars">
          {shown.map((e) => (
            <div className="hbar" key={e.scoreline}>
              <span className="k">{e.scoreline}</span>
              <span className="track">
                <i
                  className={`fill${e.count === max ? '' : ' quiet'}`}
                  style={{ width: `${(e.count / max) * 100}%` }}
                />
              </span>
              <span className="v">{e.count}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
