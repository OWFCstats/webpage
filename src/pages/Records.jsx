import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, HonourGrid, Spinner } from '../components/bits';
import BarBoard from '../components/BarBoard';
import ResultList from '../components/ResultList';
import {
  clubHallOfFame,
  clubRecords,
  formatDate,
  playerTotals,
  plural,
  seasonRecords,
} from '../lib/stats';

/**
 * The marks the club is measured against — the things that appear nowhere
 * else. A single season is read on Season, a single player on their own page;
 * this is what sits above both.
 */
export default function Records() {
  const { players, matches, appearances, loading, error } = useData();

  const view = useMemo(() => {
    if (loading) return null;
    return {
      records: clubRecords(matches),
      seasons: seasonRecords(players, matches, appearances),
      hallOfFame: clubHallOfFame(players, matches, appearances),
      allTime: playerTotals(players, matches, appearances),
    };
  }, [loading, players, matches, appearances]);

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const { records, seasons, hallOfFame, allTime } = view;

  return (
    <div>
      <h1>Records &amp; honours</h1>
      <p className="muted page-intro">
        {records.played > 0
          ? `${plural(records.played, 'game', 'games')} on record across ${plural(seasons.length, 'season', 'seasons')}.`
          : 'Nothing on record yet.'}{' '}
        A record nobody holds is still named below — the club is early, not empty.
      </p>

      <div className="section">
        <h2>Club records</h2>
        <ClubRecords records={records} />
      </div>

      <div className="section">
        <h2>Honours board</h2>
        <HonoursBoard seasons={seasons} />
      </div>

      <div className="section">
        <h2>Hall of fame</h2>
        <div className="sheet">
          <HonourGrid honours={hallOfFame} />
          <p className="muted card-foot">
            A badge belongs to the club as soon as anyone reaches it. The quiet ones
            are still there to be taken.
          </p>
        </div>
      </div>

      <div className="section">
        <h2>All-time leaders</h2>
        <div className="grid boards">
          <BarBoard title="Goals" rows={allTime} statKey="goals" limit={5} />
          <BarBoard title="Appearances" rows={allTime} statKey="appearances" limit={5} />
          <BarBoard title="Man of the Match" rows={allTime} statKey="motm" limit={5} />
        </div>
        <p className="muted card-foot">
          Every season together. <Link className="more" to="/players">Players</Link> has the
          same boards a season at a time.
        </p>
      </div>

      <div className="section">
        <h2>Season by season</h2>
        <SeasonIndex seasons={seasons} />
      </div>
    </div>
  );
}

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
          <ResultList matches={matches} />
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

function ClubRecords({ records }) {
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

function runFoot(run) {
  if (!run || run.count <= RUN_SHOWN) return null;
  return `…and ${plural(run.count - RUN_SHOWN, 'game', 'games')} more.`;
}

/** Whoever won an award, with the mark. Two names where two players finished
 *  level: the data can't say which of them mattered more. */
function Award({ award }) {
  if (award.leaders.length === 0) return <span className="muted">Not awarded</span>;
  return (
    <>
      {award.leaders.map((p, i) => (
        <span key={p.id}>
          {i > 0 && ' & '}
          <Link to={`/players/${p.id}`}>{p.name}</Link>
        </span>
      ))}{' '}
      <span className="muted">{award.value}</span>
      {award.leaders.length > 1 && <> <span className="tag">shared</span></>}
    </>
  );
}

/** One row per season, one column per award. Headers come from the awards
 *  themselves so the two stay in step. */
function HonoursBoard({ seasons }) {
  if (seasons.length === 0) {
    return <div className="empty sheet">No season on record yet. The first one fills this in.</div>;
  }
  return (
    <div className="board">
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Season</th>
              {seasons[0].awards.map((a) => (
                <th key={a.key}>{a.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {seasons.map((s) => (
              <tr key={s.season}>
                <td><strong>{s.season}</strong></td>
                {s.awards.map((a) => (
                  <td key={a.key}><Award award={a} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted card-foot">
        A shared award names everyone level at the top rather than picking one of them.
      </p>
    </div>
  );
}

/** An index, not a season view: one line each, and a link across to Season
 *  with that season already selected for anyone who wants the detail. */
function SeasonIndex({ seasons }) {
  if (seasons.length === 0) {
    return <div className="empty sheet">No season on record yet.</div>;
  }
  return (
    <div className="sheet">
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Season</th>
              <th>Competition</th>
              <th className="num">P</th>
              <th className="num">W</th>
              <th className="num">D</th>
              <th className="num">L</th>
              <th className="num">GF</th>
              <th className="num">GA</th>
              <th>Position</th>
              <th>Top scorer</th>
            </tr>
          </thead>
          <tbody>
            {seasons.map((s) => {
              const boot = s.awards.find((a) => a.key === 'goals');
              return (
                <tr key={s.season}>
                  <td>
                    <Link to={`/season?season=${encodeURIComponent(s.season)}`}>{s.season}</Link>
                  </td>
                  <td>
                    {s.competitions.length === 0
                      ? <span className="muted">—</span>
                      : s.competitions.map((c, i) => (
                          <span key={c}>{i > 0 && ' '}<span className="tag">{c}</span></span>
                        ))}
                  </td>
                  <td className="num">{s.summary.played}</td>
                  <td className="num">{s.summary.won}</td>
                  <td className="num">{s.summary.drawn}</td>
                  <td className="num">{s.summary.lost}</td>
                  <td className="num">{s.summary.goalsFor}</td>
                  <td className="num">{s.summary.goalsAgainst}</td>
                  <td><span className="muted">Not recorded</span></td>
                  <td><Award award={boot} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="muted card-foot">
        Final positions stay blank until standings are connected — where a season
        finished needs the other clubs' results, not just ours.
      </p>
    </div>
  );
}
