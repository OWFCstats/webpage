import ResultList from '../ResultList';
import { monthYear, plural } from '../../lib/format';

/** One row: the record's name and its mark on the caption line, whatever holds
 *  the record underneath it. */
function Record({ label, mark, children }) {
  return (
    <div>
      <dt>
        {label}
        {mark && <span className="record-mark">{mark}</span>}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

/** A record one game holds: the result row, or the record named and admitted
 *  to. Naming a record nobody holds is the point — a list that hid its gaps
 *  would read as a club with no history rather than one in its first season. */
function Best({ label, mark, match, empty }) {
  return (
    <Record label={label} mark={match ? mark(match) : null}>
      {match ? <ResultList matches={[match]} /> : <span className="muted">{empty}</span>}
    </Record>
  );
}

/** A run's games as one line of chips rather than five 44px rows. This is a
 *  reference list: a run that cost as much page as the four records above it
 *  would crowd out the marks it sits beside. */
const RUN_SHOWN = 5;

/** When a run happened, in months — a run is remembered by the winter it was
 *  in, and two full dates don't fit the line the games are on. */
function runSpan(run) {
  const from = monthYear(run.from);
  const to = monthYear(run.to);
  return from === to ? from : `${from} – ${to}`;
}

function Run({ label, run, note, empty }) {
  if (!run) return <Record label={label}><span className="muted">{empty}</span></Record>;
  const shown = run.matches.slice(0, RUN_SHOWN);
  const tail = [
    run.count > shown.length && `+${run.count - shown.length} more`,
    runSpan(run),
  ].filter(Boolean).join(' · ');
  return (
    <Record label={label} mark={plural(run.count, 'game', 'games')}>
      <span className="record-run">
        <ResultList inline matches={shown} />
        <span className="muted">{tail}</span>
      </span>
      {note && <span className="muted record-note">{note}</span>}
    </Record>
  );
}

const margin = (m) => Math.abs(m.goals_for - m.goals_against);

/**
 * The club's own marks, as one ruled ledger. Six sheets sized to their own
 * contents used to say the same thing at six different heights and put six
 * scorelines in six different places; one list puts them in a column
 * (docs/DESIGN.md → *A list of records is a ledger*).
 */
export default function ClubRecords({ records }) {
  const {
    biggestWin, heaviestDefeat, highestScoring, firstCleanSheet,
    longestUnbeaten, longestWinning, runsCoincide, cleanSheets,
  } = records;

  return (
    <div className="sheet">
      <dl className="compare record-list">
        <Best
          label="Biggest win"
          mark={(m) => `won by ${margin(m)}`}
          match={biggestWin}
          empty="No win on record yet — the first one takes it."
        />
        <Best
          label="Heaviest defeat"
          mark={(m) => `lost by ${margin(m)}`}
          match={heaviestDefeat}
          empty="No defeat on record yet."
        />
        <Best
          label="Most goals in a game"
          mark={(m) => `${m.goals_for + m.goals_against} goals`}
          match={highestScoring}
          empty="No result on record yet."
        />
        <Best
          label="First clean sheet"
          mark={() => `${cleanSheets} kept`}
          match={firstCleanSheet}
          empty="Still waiting — no clean sheet on record yet."
        />
        {/* The runs last: they carry a line of chips each, and the four marks
            above them read as a column of scorelines when nothing breaks it. */}
        <Run
          label="Longest unbeaten run"
          run={longestUnbeaten}
          note={runsCoincide ? 'Also the club’s longest winning run.' : null}
          empty="No unbeaten run yet — a win or a draw starts one."
        />
        {/* Where the two runs hold the same games, one row says so: two rows
            print the same two matches back to back, which reads as a bug. */}
        {!runsCoincide && (
          <Run
            label="Longest winning run"
            run={longestWinning}
            empty="No winning run yet — the first win starts one."
          />
        )}
      </dl>
    </div>
  );
}
