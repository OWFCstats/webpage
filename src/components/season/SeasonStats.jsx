import { useData } from '../../context/DataContext';
import AppearanceSpread from './AppearanceSpread';
import DivisionRatios from './DivisionRatios';
import GamesAgainstContributions from './GamesAgainstContributions';
import GoldenBootRace from './GoldenBootRace';
import MatchMargins from './MatchMargins';
import PointsAccumulated from './PointsAccumulated';
import ResultSplit from './ResultSplit';
import ScorelineFrequency from './ScorelineFrequency';
import SeasonPerGameTiles from './SeasonPerGameTiles';
import VenueGoalsSplit from './VenueGoalsSplit';

/**
 * Season → Stats, built to Draft D. `season` is a year, or `'all'` for the
 * season-by-season comparison.
 *
 * All seasons is Points accumulated alone, and nothing else here: a scoring
 * race, a season's own per-game figures, its result split, its scorelines,
 * its margins, who played how often and what they produced — run across
 * every season each of those is a career total, and every season combined
 * into one board is Records' (CLAUDE.md → *Sections*). Points accumulated
 * compares instead — one line a season, side by side on a shared matchday
 * axis — which is the whole reason the mode exists, and the only reason it
 * draws under a single season is gone once there's nothing to compare it
 * against, so it sits out there too.
 *
 * Under a single season: six tiles with no heading of their own — the tiles
 * are the heading — then the division (what everyone else did), then four
 * compact cards whose every figure is printed on them and so carry no data
 * table, then the scoring race full width, and the scatter and the spread two
 * across. Those last three keep a data table, because a dot or a line hides a
 * name behind it — behind a quiet *Data* link in the foot.
 */
export default function SeasonStats({ season }) {
  const { players, matches, appearances, leagueRows, teams } = useData();
  const allSeasons = season === 'all';

  if (allSeasons) {
    return (
      <div className="chart-stack section">
        <PointsAccumulated season={season} matches={matches} />
      </div>
    );
  }

  return (
    <div className="chart-stack section">
      <SeasonPerGameTiles season={season} matches={matches} appearances={appearances} />
      <DivisionRatios season={season} leagueRows={leagueRows} teams={teams} />
      <div className="stats-two">
        <ResultSplit season={season} matches={matches} />
        <VenueGoalsSplit season={season} matches={matches} />
        <ScorelineFrequency season={season} matches={matches} />
        <MatchMargins season={season} matches={matches} />
      </div>
      <GoldenBootRace
        season={season}
        players={players}
        matches={matches}
        appearances={appearances}
      />
      <div className="stats-two">
        <GamesAgainstContributions
          season={season}
          players={players}
          matches={matches}
          appearances={appearances}
        />
        <AppearanceSpread
          season={season}
          players={players}
          matches={matches}
          appearances={appearances}
        />
      </div>
    </div>
  );
}
