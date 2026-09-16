import { Link } from 'react-router-dom';
import { VenueBadge } from './bits';
import { formatDate } from '../lib/format';
import { isPlayed, resultOf } from '../lib/matches';

/**
 * One row per match: result chip, opponent, our score always first, venue as
 * a letter — the one grid every scoreline on the site reads from, at every
 * width (DESIGN.md → Structure). `showOpponent` drops the name where the
 * caller has already named the opponent (a "how it compares" panel); the
 * grid collapses to match. `showMeta` adds date and competition as a second
 * line, for contexts long enough to want it.
 *
 * `inline` renders the same chip, score and venue as a compact run of links
 * rather than 44px rows — for a handful of prior meetings sitting inside
 * another card's own row, where a full-height list would cost more page than
 * the fact is worth. `showOpponent` applies here too; `HeadToHead` turns it
 * off because it has already named the one opponent every chip is against.
 *
 * A match carrying `tbc: true` is an empty slot rather than a fixture — a
 * plain "TBC" chip with no link, no pill and no venue, for a caller padding
 * a short list out to its usual length rather than losing the shape (Phase
 * 59's match outlook, whose diary can run short of three).
 */
export default function ResultList({
  matches,
  emptyText = 'Nothing here yet.',
  showMeta = false,
  showOpponent = true,
  inline = false,
}) {
  if (matches.length === 0) return <div className="empty">{emptyText}</div>;
  if (inline) {
    return (
      <span className="result-inline">
        {matches.map((m) => {
          if (m.tbc) {
            return <span key={m.id} className="result-chip tbc">TBC</span>;
          }
          const played = isPlayed(m);
          const result = played ? resultOf(m) : null;
          return (
            <Link key={m.id} to={`/matchday/${m.id}`} className="result-chip">
              <span className={`result-pill${result ? ` ${result}` : ' upcoming'}`}>
                {result ?? '–'}
              </span>{' '}
              {showOpponent && `${m.opponent} `}
              {played ? `${m.goals_for}–${m.goals_against}` : '–'} <VenueBadge venue={m.venue} />
            </Link>
          );
        })}
      </span>
    );
  }
  return (
    <ul className="result-list">
      {matches.map((m) => {
        const played = isPlayed(m);
        const result = played ? resultOf(m) : null;
        return (
          <li key={m.id}>
            <Link
              className={`result-row${showOpponent ? '' : ' no-opponent'}`}
              to={`/matchday/${m.id}`}
            >
              <span className={`result-pill${result ? ` ${result}` : ' upcoming'}`}>
                {result ?? '–'}
              </span>
              {showOpponent && <span className="result-opponent">{m.opponent}</span>}
              <span className="result-score">
                {played ? `${m.goals_for}–${m.goals_against}` : '–'}
              </span>
              <VenueBadge venue={m.venue} />
            </Link>
            {showMeta && (
              <span className="muted result-meta">{formatDate(m.date)} · {m.competition}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
