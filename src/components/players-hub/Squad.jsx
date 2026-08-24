import { useState } from 'react';
import { Link } from 'react-router-dom';
import BadgeIcon from '../BadgeIcon';
import { heldBadges } from '../../lib/awards';
import { initials } from '../../lib/format';

/**
 * The row shape, once. Apps first, because turning up is the thing this club is
 * trying to reward, and three figures rather than four because a fourth column
 * leaves a 375px phone no room for a name. MOTM has a board of its own one tap
 * away, which is what pays for leaving it out here.
 *
 * Both views read this list: the team sheet turns it into a head and three
 * columns, a card turns it into three label/value pairs. That sharing is the
 * point — the alternative is two definitions of what a squad row says, which is
 * how they drift into disagreeing about which figures matter.
 *
 * One `label` each, not two: a tile spells nothing out that the column head
 * doesn't, because at 12px with the label style's tracking "ASSISTS" wants 57px
 * and a tile on a 375px phone gives a figure 47px.
 */
const FIGURES = [
  { key: 'appearances', label: 'Apps' },
  { key: 'goals', label: 'G' },
  { key: 'assists', label: 'A' },
];

/** The two ways to read the same roster. */
const LAYOUTS = [
  { id: 'list', label: 'List' },
  { id: 'cards', label: 'Cards' },
];

/** How many names show before "Show all" is needed. The roster is the whole
 *  club's history by default now, not one season's ~50, so an all-time list
 *  needs a default short enough to open on — top 20 by appearances, the same
 *  order the list is already sorted in. */
const CAP = 20;

/** A zero is the quietest thing in the row: it's true, and it isn't the point. */
function Figure({ value, className }) {
  return <span className={`${className}${value === 0 ? ' nil' : ''}`}>{value}</span>;
}

/**
 * One roster row. A team sheet, not three tallies bolted to a name: the figures
 * sit in fixed columns under a single set of heads, so goals line up down the
 * page and a name can be found by its row rather than read for its labels.
 */
function SquadRow({ row }) {
  const { player } = row;
  return (
    <li>
      <Link className="player-row" to={`/players/${player.id}`}>
        <span className="avatar">{initials(player.name)}</span>
        <span className="who">{player.name}</span>
        {FIGURES.map((f) => (
          <Figure key={f.key} className="fig" value={row[f.key]} />
        ))}
      </Link>
    </li>
  );
}

/**
 * One roster tile. The same three figures as the row, plus the thing a list has
 * no column for: the badges this player holds, drawn rather than counted. That
 * is the whole reason this view exists — the badges are the site's argument for
 * turning up, and without it they are invisible unless you open a profile.
 *
 * The badges are always career-wide; the figures are too, by default, now that
 * the roster opens on the club's whole history. A season filter narrows just
 * the figures — silver appearances beside one game says "this is someone who
 * has been here for years and played once this time" — which is why the card-
 * foot note below only shows up in that case.
 *
 * No monogram: the tile's picture is the shelf. A monogram beside the name
 * costs 40px of a 141px measure and puts nearly every name on two lines, and a
 * stand-in for a photo we don't have is not worth a name being folded in half.
 * The list is where it earns its place.
 */
function SquadCard({ row, badges }) {
  const { player } = row;
  const held = heldBadges(badges);
  return (
    <Link className="sheet squad-card" to={`/players/${player.id}`}>
      <span className="who">{player.name}</span>
      <span className="squad-card-figs">
        {FIGURES.map((f) => (
          <span key={f.key}>
            <span className="label">{f.label}</span>
            <Figure className="v" value={row[f.key]} />
          </span>
        ))}
      </span>
      {/* No count and no year list beside a badge: those are what a shelf is
          for, and a tile this narrow spends its room on the drawings.

          21px, and the two pixels matter. A medal's footprint is the drawing
          plus 0.4 of it plus the rim, so four across plus their gaps is 137.6px
          against the 141.5px a tile has on a 375px phone. At 22 it is 143.2 and
          three go across, which costs half the squad a second shelf row. */}
      {held.length > 0 ? (
        // One label for the row rather than six: the drawings are the content
        // here, and `role="img"` is what lets a screen reader be told there is a
        // shelf and what is on it instead of reading six unlabelled spans.
        <span
          className="badge-row squad-card-badges"
          role="img"
          aria-label={`Badges: ${held.map((b) => `${b.label} ${b.mark}`).join(', ')}`}
        >
          {held.map((b) => (
            <BadgeIcon key={b.key} badge={b.key} metal={b.metal} size={21} />
          ))}
        </span>
      ) : (
        <span className="squad-card-badges none">Nothing on the shelf yet</span>
      )}
    </Link>
  );
}

/**
 * The squad: every player the club has ever picked, by default — not one
 * season's roster. Two views over the same rows: the team sheet, and the
 * tiles that put the badges on the page.
 *
 * **Nobody is behind more than one tap.** A season's worth of names fits a
 * phone; the club's whole history doesn't, so the list opens on the top 20 by
 * appearances — the order it's already sorted in — with one "Show all"
 * beneath it. A search always searches every name regardless of the cap: this
 * is the page a player opens to find their own, and a result hidden behind
 * "Show all" would be worse than no cap at all.
 *
 * `scope` names the one season the rows were filtered to, or null for the
 * all-time default — so a search that finds nobody can say where it looked,
 * and offer to widen the search rather than send the reader to another page
 * that shows the same roster.
 */
export default function Squad({
  rows,
  badges = null,
  layout = 'list',
  onLayout,
  scope = null,
  onSearchAllTime,
  emptyText = 'No appearances recorded yet.',
}) {
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const q = query.trim().toLowerCase();
  const sorted = rows
    .filter((r) => !q || r.player.name.toLowerCase().includes(q))
    .sort(
      (a, b) =>
        b.appearances - a.appearances ||
        b.goalInvolvements - a.goalInvolvements ||
        a.player.name.localeCompare(b.player.name),
    );
  const capped = !q && !showAll && sorted.length > CAP;
  const listed = capped ? sorted.slice(0, CAP) : sorted;

  // Nobody picked and nobody matched are two states, and only one of them wants
  // a search box: an empty squad has nothing to narrow, where a search that
  // found nobody needs the box it was typed into back. So this one returns early
  // and the other keeps the controls.
  if (rows.length === 0) return <div className="empty sheet">{emptyText}</div>;

  const showAllButton = capped && (
    <div className="squad-more-row">
      <button type="button" className="more squad-more" onClick={() => setShowAll(true)}>
        Show all {sorted.length} players →
      </button>
    </div>
  );

  return (
    <div>
      <div className="controls squad-controls">
        <input
          type="text"
          placeholder="Search the squad…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search players"
        />
        <div className="seg" role="tablist" aria-label="Squad layout">
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              type="button"
              role="tab"
              aria-selected={layout === l.id}
              className={layout === l.id ? 'active' : undefined}
              onClick={() => onLayout(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {listed.length === 0 ? (
        <div className="empty sheet">
          {scope ? `Nobody in ${scope} matches “${query.trim()}”.` : `Nobody matches “${query.trim()}”.`}{' '}
          {scope && onSearchAllTime && (
            <button type="button" className="more" onClick={onSearchAllTime}>
              Search all time →
            </button>
          )}
        </div>
      ) : layout === 'cards' ? (
        <>
          <div className="grid squad-cards">
            {listed.map((r) => (
              <SquadCard key={r.player.id} row={r} badges={badges?.get(r.player.id) ?? null} />
            ))}
          </div>
          {showAllButton}
          {scope && <p className="muted card-foot">Badges are career-wide; the figures are {scope}'s.</p>}
        </>
      ) : (
        <div className="sheet">
          <div className="squad-head">
            {FIGURES.map((f) => (
              <span key={f.key} className="label">{f.label}</span>
            ))}
          </div>
          <ul className="player-list">
            {listed.map((r) => (
              <SquadRow key={r.player.id} row={r} />
            ))}
          </ul>
          {showAllButton}
        </div>
      )}
    </div>
  );
}
