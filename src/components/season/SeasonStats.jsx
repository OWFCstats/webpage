import { useData } from '../../context/DataContext';
import GoalsTrend from './GoalsTrend';
import GoldenBootRace from './GoldenBootRace';
import PointsAccumulated from './PointsAccumulated';

/**
 * Season → Stats: a stack of chart cards. `season` is a year, or `'all'` for
 * the season-by-season comparison.
 *
 * All seasons is one card and not three, because the other two only combine.
 * A scoring race or a goals-per-match line drawn across every season is a
 * career board, and every season combined into one board is Records'
 * (CLAUDE.md → *Sections*). Points accumulated compares instead — one line a
 * season, side by side on a shared matchday axis — which is the whole reason
 * the mode exists.
 */
export default function SeasonStats({ season }) {
  const { players, matches, appearances } = useData();
  const allSeasons = season === 'all';

  return (
    <div className="chart-stack section">
      {!allSeasons && (
        <GoldenBootRace
          season={season}
          players={players}
          matches={matches}
          appearances={appearances}
        />
      )}
      <PointsAccumulated season={season} matches={matches} />
      {!allSeasons && <GoalsTrend season={season} matches={matches} />}
    </div>
  );
}
