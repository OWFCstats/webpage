import { useData } from '../../context/DataContext';
import GoalsTrend from './GoalsTrend';
import GoldenBootRace from './GoldenBootRace';
import MatchMargins from './MatchMargins';
import PointsAccumulated from './PointsAccumulated';
import ResultSplit from './ResultSplit';
import ScorelineFrequency from './ScorelineFrequency';
import SeasonPerGameTiles from './SeasonPerGameTiles';

/**
 * Season → Stats: a stack of chart cards. `season` is a year, or `'all'` for
 * the season-by-season comparison.
 *
 * All seasons is one card and not the rest, because everything else here only
 * combines. A scoring race, a goals-per-match line, a season's own per-game
 * figures, its result split, its scorelines, its margins — run across every
 * season, each of those is a career total, and every season combined into one
 * board is Records' (CLAUDE.md → *Sections*). Points accumulated compares
 * instead — one line a season, side by side on a shared matchday axis — which
 * is the whole reason the mode exists.
 */
export default function SeasonStats({ season }) {
  const { players, matches, appearances } = useData();
  const allSeasons = season === 'all';

  return (
    <div className="chart-stack section">
      {!allSeasons && (
        <>
          <SeasonPerGameTiles season={season} matches={matches} appearances={appearances} />
          <ResultSplit season={season} matches={matches} />
          <GoldenBootRace
            season={season}
            players={players}
            matches={matches}
            appearances={appearances}
          />
        </>
      )}
      <PointsAccumulated season={season} matches={matches} />
      {!allSeasons && (
        <>
          <GoalsTrend season={season} matches={matches} />
          <ScorelineFrequency season={season} matches={matches} />
          <MatchMargins season={season} matches={matches} />
        </>
      )}
    </div>
  );
}
