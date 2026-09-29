import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { ErrorNote, Spinner } from '../../components/bits';
import ChipFilter from '../../components/ChipFilter';
import PollMatches from '../../components/availability-admin/PollMatches';
import ReplyTally from '../../components/availability-admin/ReplyTally';
import { pollCounts, pollTally } from '../../lib/availability';
import { useAvailability } from '../../lib/useAvailability';
import { seasonsOf } from '../../lib/matches';
import { plural } from '../../lib/format';

/**
 * The group chat's polls, a season at a time: every game's poll to open, and
 * the tally of who answers them. Admin-only, like the table under it — see
 * `lib/availability.js`.
 */
export default function AvailabilityAdmin() {
  const { players, matches, loading, error: loadError } = useData();
  const seasons = seasonsOf(matches);
  const [picked, setPicked] = useState(null);
  // The newest season with a row, not the current one: a poll goes out for a
  // fixture before anything in its season has been played.
  const season = picked ?? seasons[0] ?? null;
  const inSeason = matches
    .filter((m) => m.season === season)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  const { rows, loading: pollLoading, error } = useAvailability(inSeason.map((m) => m.id));

  if (loading) return <Spinner />;
  if (loadError) return <ErrorNote message={loadError} />;

  const chatSize = players.filter((p) => p.in_chat).length;
  const { polls, tally } = pollTally(players, matches, rows, season);

  return (
    <div className="section">
      <div className="section-head">
        <h2>Availability</h2>
      </div>
      {seasons.length > 1 && (
        <ChipFilter
          label="Season"
          value={season}
          onChange={setPicked}
          options={seasons.map((s) => ({ value: s, label: s }))}
        />
      )}
      {error && <div className="notice error">{error}</div>}
      {pollLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="sheet">
            <h2>Polls</h2>
            <PollMatches matches={inSeason} counts={pollCounts(rows, players)} />
          </div>
          <div className="sheet section">
            <h2>Who replies</h2>
            <p className="muted">
              {chatSize} in the main chat · {plural(polls.length, 'poll', 'polls')} entered
              this season.
            </p>
            <ReplyTally tally={tally} polls={polls.length} />
          </div>
        </>
      )}
    </div>
  );
}
