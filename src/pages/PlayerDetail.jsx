import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, Spinner } from '../components/bits';
import BadgeShelf from '../components/player-detail/BadgeShelf';
import FirstsTable from '../components/player-detail/FirstsTable';
import FormCard from '../components/player-detail/FormCard';
import MatchLog from '../components/player-detail/MatchLog';
import MatesCard from '../components/player-detail/MatesCard';
import PlayerCareerChart from '../components/player-detail/PlayerCareerChart';
import PlayerHero from '../components/player-detail/PlayerHero';
import RankCard from '../components/player-detail/RankCard';
import SeasonTable from '../components/player-detail/SeasonTable';
import StatGrid from '../components/player-detail/StatGrid';
import { playerBadges } from '../lib/awards';
import { plural } from '../lib/format';
import { seasonsOf } from '../lib/matches';
import { playerProfile } from '../lib/players';

export default function PlayerDetail() {
  const { playerId } = useParams();
  const { players, matches, appearances, teams, seasonAwards, loading, error } = useData();
  const [params, setParams] = useSearchParams();
  const view = params.get('view') === 'stats' ? 'stats' : 'overview';

  const player = players.find((p) => p.id === playerId);
  const profile = useMemo(
    () => (player ? playerProfile(player, players, matches, appearances) : null),
    [player, players, matches, appearances],
  );
  const badges = useMemo(
    () => (player ? playerBadges(player, players, matches, appearances, seasonAwards) : null),
    [player, players, matches, appearances, seasonAwards],
  );

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;
  if (!player) {
    return (
      <div className="empty sheet">
        Player not found. <Link className="more" to="/players">All players →</Link>
      </div>
    );
  }

  const {
    career, log, arc, firsts, seasons,
    ranks, teammates, favouriteOpponent, form, scoringRun, sinceGoal,
    squadAverage, squadMax, availableGames, seasonsActive,
  } = profile;
  const played = career.appearances > 0;

  return (
    <div>
      <PlayerHero player={player} career={career} seasonsActive={seasonsActive} badges={badges} />

      {/* Badges first, above the view selector and above the stats: what a
          player has won and what's next is why they opened their own page. */}
      <div className="section">
        <h3 className="block gold">Badges</h3>
        <BadgeShelf badges={badges} />
      </div>

      {played && (
        <div className="player-views">
          <div className="seg" role="tablist" aria-label="Player view">
            <button
              type="button" role="tab" aria-selected={view === 'overview'}
              className={view === 'overview' ? 'active' : undefined}
              onClick={() => setParams({})}
            >
              Overview
            </button>
            <button
              type="button" role="tab" aria-selected={view === 'stats'}
              className={view === 'stats' ? 'active' : undefined}
              onClick={() => setParams({ view: 'stats' })}
            >
              Full stats
            </button>
          </div>
        </div>
      )}

      {!played && (
        <div className="empty sheet section">
          No appearances recorded yet. Everything on this page fills in from the first
          game. <Link className="more" to="/season">Fixtures →</Link>
        </div>
      )}

      {played && view === 'overview' && (
        <>
          <div className="section">
            <FirstsTable firsts={firsts} />
          </div>

          <div className="section">
            <FormCard
              form={form}
              scoringRun={scoringRun}
              sinceGoal={sinceGoal}
              favouriteOpponent={favouriteOpponent}
              teams={teams}
            />
          </div>

          <div className="section">
            <RankCard ranks={ranks} />
          </div>

          <p className="section more-hint-row">
            <button type="button" className="secondary small" onClick={() => setParams({ view: 'stats' })}>
              Full stats, season table and match log →
            </button>
          </p>
        </>
      )}

      {played && view === 'stats' && (
        <>
          <div className="section">
            <h3 className="block verdigris">Career, against the squad</h3>
            <StatGrid
              career={career}
              seasons={seasons}
              ranks={ranks}
              squadAverage={squadAverage}
              squadMax={squadMax}
            />
            <p className="muted card-foot">
              Played {career.appearances} of the {availableGames} games the club played across
              their {plural(seasonsActive.length, 'season', 'seasons')}
              {career.dropouts > 0 &&
                `, with ${plural(career.dropouts, 'late withdrawal', 'late withdrawals')}`}.
            </p>
          </div>

          <div className="section">
            <MatesCard teammates={teammates} />
          </div>

          <div className="section">
            <PlayerCareerChart arc={arc} career={career} />
          </div>

          <SeasonTable seasons={seasons} />

          <MatchLog log={log} seasons={seasonsOf(matches).filter((s) => seasonsActive.includes(s))} />
        </>
      )}
    </div>
  );
}
