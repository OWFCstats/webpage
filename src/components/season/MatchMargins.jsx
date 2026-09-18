import { useMemo } from 'react';
import { marginBuckets, seasonSummary } from '../../lib/matches';
import { plural } from '../../lib/format';

/** How the season's decided games tended to go, draws included — a goal
 *  either way is the common case everywhere, and this is where that stops
 *  being true. `marginBuckets` already splits wins from losses; the row here
 *  is the two combined, with the split named in its title for whoever
 *  hovers or taps it. */
export default function MatchMargins({ season, matches }) {
  const { rows, max } = useMemo(() => {
    const pool = matches.filter((m) => m.season === season);
    const drawn = seasonSummary(pool).drawn;
    const rows = [
      { margin: 'Draw', count: drawn, title: `${plural(drawn, 'draw', 'draws')}` },
      ...marginBuckets(pool).map((b) => ({
        margin: b.margin === '4+' ? 'By 4+' : `By ${b.margin}`,
        count: b.wins + b.losses,
        title: `${plural(b.wins, 'win', 'wins')}, ${plural(b.losses, 'loss', 'losses')}`,
      })),
    ];
    const max = Math.max(...rows.map((r) => r.count), 0);
    return { rows, max };
  }, [season, matches]);

  const hasData = rows.some((r) => r.count > 0);

  return (
    <section className="sheet">
      <span className="label ruled">Winning and losing margins</span>
      {!hasData ? (
        <div className="empty">Not enough data yet — this fills in as matches are recorded.</div>
      ) : (
        <div className="hbars">
          {rows.map((r) => (
            <div className="hbar" key={r.margin} title={r.title}>
              <span className="k">{r.margin}</span>
              <span className="track">
                <i
                  className={`fill${r.count === max ? '' : ' quiet'}`}
                  style={{ width: `${max ? (r.count / max) * 100 : 0}%` }}
                />
              </span>
              <span className="v">{r.count}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
