import ResultList from '../ResultList';
import { formatDate, plural } from '../../lib/format';

/**
 * One record per card: the mark in the headline, the game that holds it in the
 * result row beneath. A record nobody holds keeps its card and says so —
 * naming it is the point, and an empty widget would read as a fault.
 */
function Record({ label, headline, span, matches = [], foot, empty }) {
  return (
    <div className="sheet record">
      <h3 className="label ruled">{label}</h3>
      {headline ? (
        <>
          <div className="record-headline">{headline}</div>
          {span && <div className="muted record-span">{span}</div>}
          <ResultList matches={matches} showMeta />
          {foot && <p className="muted card-foot">{foot}</p>}
        </>
      ) : (
        <p className="muted record-empty">{empty}</p>
      )}
    </div>
  );
}

/** A long run would grow its card past everything around it, so the card
 *  carries the start of the run and counts the rest. */
const RUN_SHOWN = 5;

function runFoot(run) {
  if (!run || run.count <= RUN_SHOWN) return null;
  return `…and ${plural(run.count - RUN_SHOWN, 'game', 'games')} more.`;
}

export default function ClubRecords({ records }) {
  const { biggestWin, heaviestDefeat, highestScoring, longestUnbeaten, longestWinning, firstCleanSheet } = records;
  const margin = (m) => Math.abs(m.goals_for - m.goals_against);
  const runSpan = (run) => `${formatDate(run.from)} – ${formatDate(run.to)}`;

  return (
    <div className="grid records">
      <Record
        label="Biggest win"
        headline={biggestWin && `Won by ${margin(biggestWin)}`}
        matches={biggestWin ? [biggestWin] : []}
        empty="No win on record yet — the first one takes it."
      />
      <Record
        label="Heaviest defeat"
        headline={heaviestDefeat && `Lost by ${margin(heaviestDefeat)}`}
        matches={heaviestDefeat ? [heaviestDefeat] : []}
        empty="No defeat on record yet."
      />
      <Record
        label="Most goals in a game"
        headline={highestScoring && `${highestScoring.goals_for + highestScoring.goals_against} goals`}
        span={highestScoring && 'Both sides combined'}
        matches={highestScoring ? [highestScoring] : []}
        empty="No result on record yet."
      />
      <Record
        label="First clean sheet"
        headline={firstCleanSheet && `${firstCleanSheet.goals_for}–0`}
        span={firstCleanSheet && `${plural(records.cleanSheets, 'clean sheet', 'clean sheets')} in all`}
        matches={firstCleanSheet ? [firstCleanSheet] : []}
        empty="Still waiting — no clean sheet on record yet."
      />
      {/* The two runs last: they carry several rows each, and a tall card in
          the middle of the grid leaves a hole beside the short ones. */}
      <Record
        label="Longest unbeaten run"
        headline={longestUnbeaten && plural(longestUnbeaten.count, 'game', 'games')}
        span={longestUnbeaten && runSpan(longestUnbeaten)}
        matches={longestUnbeaten ? longestUnbeaten.matches.slice(0, RUN_SHOWN) : []}
        foot={runFoot(longestUnbeaten)}
        empty="No unbeaten run yet — a win or a draw starts one."
      />
      <Record
        label="Longest winning run"
        headline={longestWinning && plural(longestWinning.count, 'game', 'games')}
        span={longestWinning && runSpan(longestWinning)}
        matches={longestWinning ? longestWinning.matches.slice(0, RUN_SHOWN) : []}
        foot={runFoot(longestWinning)}
        empty="No winning run yet — the first win starts one."
      />
    </div>
  );
}
