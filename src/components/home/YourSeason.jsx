import { useState } from 'react';
import { Link } from 'react-router-dom';
import PlayerPicker from '../PlayerPicker';
import { plural } from '../../lib/format';

/**
 * Home, addressed to whoever is holding the phone.
 *
 * Unpicked it is one row asking a question, because most of the people who see
 * it have never played for the club and a card of blanks is worse than a
 * question. Picked it is this season's apps, goals and assists — the figures a
 * player opens the site to check on a Sunday morning, without navigating to
 * find them. Career totals and badges are one tap away through the name; this
 * card is deliberately just the season snapshot, not the whole shelf.
 *
 * Picking is a preference on this phone and nothing else: no account, no row,
 * nothing sent anywhere. DESIGN.md → *What the site remembers, and what it
 * doesn't*, and *Home, addressed to the reader* for what this says and why it
 * says only this much.
 */
export default function YourSeason({ players, player, summary, onPick, onForget }) {
  const [picking, setPicking] = useState(false);

  if (!player) {
    return (
      /* `asking` trims the widget's padding to the row inside it: unpicked,
         this section is one control on a page already 500px over its height
         budget, and a sheet's full padding around a single line is height
         spent on nothing for every reader who has never played for the club. */
      <section className="sheet home-widget home-me asking">
        {picking ? (
          <>
            <span className="label home-me-find">Find your name</span>
            <PlayerPicker
              players={players}
              value={null}
              onChange={(id) => id && onPick(id)}
              placeholder="Type your name…"
              autoFocus
            />
          </>
        ) : (
          <button type="button" className="home-me-ask" onClick={() => setPicking(true)}>
            <span>Do you play for us?</span>
            <span className="home-me-ask-more">Pick your name →</span>
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="sheet home-widget home-me">
      <div className="home-widget-head">
        <div>
          <span className="label">Your season</span>
          {/* The name is the heading and the heading is a link: the one place
              on Home that leads to the reader's own page, which is where
              everything this card has room for one line of is written out. */}
          <h2><Link to={`/players/${player.id}`}>{player.name}</Link></h2>
        </div>
        <button type="button" className="secondary small" onClick={onForget}>Not you?</button>
      </div>

      {summary.apps > 0 ? (
        <div className="home-stat-tiles">
          <div className="home-stat-tile">
            <b>{summary.apps}</b>
            <em className="label">Apps</em>
          </div>
          <div className="home-stat-tile">
            <b>{summary.goals}</b>
            <em className="label">Goals</em>
          </div>
          <div className="home-stat-tile">
            <b>{summary.assists}</b>
            <em className="label">Assists</em>
          </div>
        </div>
      ) : (
        <p className="muted home-me-none">
          {summary.played > 0
            ? `No appearances yet — ${plural(summary.played, 'game', 'games')} played so far this season.`
            : 'Nothing played yet this season.'}
        </p>
      )}
    </section>
  );
}
