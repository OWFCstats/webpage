import { useState } from 'react';
import LeaderBoards from '../LeaderBoards';
import { plural } from '../../lib/format';

/**
 * The current season's boards, open and in full; every earlier season as a
 * thin banner underneath, collapsed until it's tapped. As the club plays more
 * seasons this grows by one banner a year rather than by a picker that hides
 * everything behind a single choice — the current season is the one thing
 * everyone opens this page to see, and the archive is there to be found, not
 * to be scrolled past.
 *
 * `boards` is `lib/players.js`'s `seasonPools()`, newest season first, one of
 * them flagged `current`. There's always at most one current board; the rest
 * are the archive, in the same order they arrived in.
 */
export default function SeasonBoards({ boards }) {
  const [open, setOpen] = useState(() => new Set());
  const archive = boards.filter((b) => !b.current);

  if (archive.length === 0) return null;

  return (
    <div className="season-archive">
      {archive.map((season) => {
        const isOpen = open.has(season.season);
        return (
          <details
            key={season.season}
            className="season-archive-entry"
            open={isOpen}
            onToggle={(e) => {
              setOpen((prev) => {
                const next = new Set(prev);
                if (e.target.open) next.add(season.season);
                else next.delete(season.season);
                return next;
              });
            }}
          >
            <summary>
              <span className="season-archive-name">{season.season}</span>
              <span className="season-archive-meta muted">
                {season.played > 0 ? plural(season.played, 'game', 'games') : 'No games played'}
              </span>
              <span className="season-archive-arrow" aria-hidden="true" />
            </summary>
            <div className="season-archive-panel">
              {season.played > 0 ? (
                <LeaderBoards rows={season.rows} />
              ) : (
                <p className="muted">Nothing recorded in {season.season}.</p>
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}
