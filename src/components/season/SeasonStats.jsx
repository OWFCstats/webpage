import { useData } from '../../context/DataContext';
import DivisionRatios from './DivisionRatios';
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
 * is the whole reason the mode exists. The division's own figures aren't in
 * that argument at all: `league_rows` holds one table a season, so there is no
 * all-seasons division to draw.
 *
 * The division card sits second, straight under the club's own per-game
 * numbers, because those two read as one thought — what we did a game, then
 * what everyone else did — and because a card nobody scrolls to is a card
 * nobody reads (docs/DESIGN.md → *Page length*).
 */
export default function SeasonStats({ season }) {
  const { players, matches, appearances, leagueRows, teams } = useData();
  const allSeasons = season === 'all';

  return (
    <div className="chart-stack section">
      {!allSeasons && (
        <>
          <SeasonPerGameTiles season={season} matches={matches} appearances={appearances} />
          <DivisionRatios season={season} leagueRows={leagueRows} teams={teams} />
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
