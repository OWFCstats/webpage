import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { ErrorNote, FormBadges, Spinner, VenueBadge } from '../components/bits';
import {
  fixtures,
  formatDate,
  formatKickoff,
  formOf,
  isPlayed,
  latestResult,
  matchContext,
  matchTitle,
  opponentSlug,
  resultOf,
  seasonsOf,
  venueTeam,
} from '../lib/stats';

function initials(name) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function opponentInitials(name) {
  const words = name.split(' ').filter((w) => /[a-z0-9]/i.test(w));
  return words.map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

const nf1 = (v) => (Math.round(v * 10) / 10).toFixed(1);

/** Next-up fixture card: shared between the normal view and the
 *  season-hasn't-started state, so there's one place that knows its shape. */
function NextUp({ next, teams }) {
  if (!next) return null;
  const kickoff = formatKickoff(next.kickoff_time);
  const venue = venueTeam(next, teams);
  const venueParts = venue
    ? [venue.pitch_name, venue.pitch_address, venue.postcode].filter(Boolean)
    : [];
  return (
    <div className="next-up">
      <div className="label">Next up</div>
      <strong>
        <Link to={`/opponents/${opponentSlug(teams, next)}`}>{next.opponent}</Link>{' '}
        <VenueBadge venue={next.venue} />
      </strong>
      <span className="muted">
        {formatDate(next.date)}{kickoff && ` · ${kickoff}`} · {next.competition}
      </span>
      {(venueParts.length > 0 || venue?.map_url) && (
        <span className="muted fixture-location">
          {venueParts.join(', ')}
          {venue.map_url && (
            <>
              {venueParts.length > 0 && ' · '}
              <a href={venue.map_url} target="_blank" rel="noreferrer">Map</a>
            </>
          )}
        </span>
      )}
    </div>
  );
}

export default function Matchday() {
  const { matchId } = useParams();
  const { players, matches, appearances, teams, loading, error } = useData();
  const { session } = useAuth();

  const view = useMemo(() => {
    const seasons = seasonsOf(matches);
    const currentSeason = seasons[0] ?? null;

    // With no id in the URL, land on the most recent PLAYED match in the
    // current season. A season that hasn't kicked off yet has none — that's
    // handled by the caller, not by falling back to an older season.
    const match = matchId
      ? matches.find((m) => m.id === matchId) ?? null
      : latestResult(currentSeason ? matches.filter((m) => m.season === currentSeason) : []);

    const season = match ? match.season : currentSeason;
    const seasonMatches = season ? matches.filter((m) => m.season === season) : [];
    const seasonOrdered = seasonMatches.slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const seasonPlayed = seasonOrdered.filter(isPlayed);
    const idx = match ? seasonPlayed.findIndex((m) => m.id === match.id) : -1;

    const currentSeasonMatches = currentSeason ? matches.filter((m) => m.season === currentSeason) : [];

    return {
      currentSeason,
      season,
      match,
      seasonOrdered,
      prevMatch: idx > 0 ? seasonPlayed[idx - 1] : null,
      nextMatch: idx !== -1 && idx < seasonPlayed.length - 1 ? seasonPlayed[idx + 1] : null,
      ctx: match ? matchContext(match, players, matches, appearances) : null,
      form: formOf(currentSeasonMatches),
      nextFixture: fixtures(matches)[0],
    };
  }, [matchId, players, matches, appearances]);

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  if (matches.length === 0 && players.length === 0) {
    return (
      <div className="empty sheet">
        <h1>Old Wellingtonians FC</h1>
        <p>No data yet. Once the first players and matches are entered, stats will appear here.</p>
      </div>
    );
  }

  const { currentSeason, season, match, seasonOrdered, prevMatch, nextMatch, ctx, form, nextFixture } = view;

  if (matchId && !match) {
    return <div className="empty sheet">Match not found. <Link className="more" to="/season">Full season →</Link></div>;
  }

  if (!match) {
    return (
      <div>
        <div className="section-head">
          <h1>{currentSeason ? `Season ${currentSeason}` : 'Old Wellingtonians FC'}</h1>
        </div>
        <p className="muted">{currentSeason ?? 'The new season'} hasn’t started yet.</p>
        <div className="sheet section form-next">
          <div>
            <div className="label">Form</div>
            <FormBadges matches={form} />
          </div>
          <NextUp next={nextFixture} teams={teams} />
        </div>
      </div>
    );
  }

  const played = isPlayed(match);
  const cleanSheet = played && match.goals_against === 0;
  const {
    squad, scorers, motm, debutIds, seasonAppCount, boot,
    margin, bestMargin, avgFor, avgAgainst, priorMeetings, matchNumber, seasonGames,
  } = ctx;
  const star = motm[0];
  const kickoff = formatKickoff(match.kickoff_time);
  const venue = venueTeam(match, teams);
  const venueParts = venue
    ? [venue.pitch_name, venue.pitch_address, venue.postcode].filter(Boolean)
    : [];
  const dropouts = appearances.filter((a) => a.match_id === match.id && a.dropout);
  const dropoutNames = dropouts
    .map((a) => players.find((p) => p.id === a.player_id)?.name)
    .filter(Boolean);

  // Facts worth a line, computed from rows that already exist. Rendered only
  // when they're true, so a quiet 0–0 gets a quiet page.
  const milestones = [];
  const debutants = squad.filter((a) => debutIds.has(a.player_id));
  if (played && debutants.length > 0) {
    milestones.push({
      n: debutants.length,
      head: debutants.length === 1
        ? `${debutants[0].player.name} — first game of the season`
        : `${debutants.length} first appearances of the season`,
      sub: debutants.length === 1 ? null : debutants.map((a) => a.player.name).join(', '),
    });
  }
  const debutScorers = debutants.filter((a) => a.goals > 0);
  for (const a of debutScorers) {
    milestones.push({ n: a.goals, head: `${a.player.name} scores on their first appearance`, sub: null });
  }
  const mostApps = squad
    .slice()
    .sort((a, b) => (seasonAppCount.get(b.player_id) ?? 0) - (seasonAppCount.get(a.player_id) ?? 0))[0];
  if (played && mostApps && (seasonAppCount.get(mostApps.player_id) ?? 0) >= 5) {
    milestones.push({
      n: seasonAppCount.get(mostApps.player_id),
      head: `${mostApps.player.name} — appearance ${seasonAppCount.get(mostApps.player_id)} of the season`,
      sub: 'Most in the squad',
    });
  }
  if (played && margin != null && margin === bestMargin && margin > 0) {
    milestones.push({ n: `+${margin}`, head: 'Best winning margin of the season so far', sub: null });
  }
  if (cleanSheet) {
    milestones.push({ n: 0, head: 'Clean sheet — credited to the whole squad', sub: null });
  }

  return (
    <div>
      <div className="board scoreboard">
        <div className="sb-top">
          <div className="sb-side us">
            <span className="badge">OW</span>
            <span className="team">Old Wellingtonians</span>
            <span className="sub">{squad.length > 0 ? `${squad.length} in the squad` : match.season}</span>
          </div>
          <div className="sb-mid">
            {played ? (
              <>
                <span className="score">{match.goals_for}–{match.goals_against}</span>
                <span className="state label">
                  {match.walkover ? 'Awarded (walkover)' : 'Full time'} · {match.competition}{' '}
                  <span className={`result-pill ${resultOf(match)}`}>{resultOf(match)}</span>
                </span>
              </>
            ) : (
              <>
                <span className="score upcoming">v</span>
                <span className="state label">{formatDate(match.date)} · {match.competition}</span>
              </>
            )}
          </div>
          <div className="sb-side them">
            <span className="badge">{opponentInitials(match.opponent)}</span>
            <Link to={`/opponents/${opponentSlug(teams, match)}`} className="team">{match.opponent}</Link>
            <span className="sub">
              {formatDate(match.date)}{kickoff && ` · ${kickoff}`} <VenueBadge venue={match.venue} />
            </span>
            {(venueParts.length > 0 || venue?.map_url) && (
              <span className="sub">
                {venueParts.join(', ')}
                {venue.map_url && (
                  <>
                    {venueParts.length > 0 && ' · '}
                    <a href={venue.map_url} target="_blank" rel="noreferrer">Map</a>
                  </>
                )}
              </span>
            )}
          </div>
        </div>
        {played && (scorers.length > 0 || match.own_goals_for > 0) && (
          <div className="sb-strip">
            {scorers.length > 0 && (
              <span>
                Scorers{' '}
                <strong>
                  {scorers.map((a) => `${a.player.name}${a.goals > 1 ? ` ×${a.goals}` : ''}`).join(', ')}
                </strong>
              </span>
            )}
            {match.own_goals_for > 0 && <span>Own goals <strong>{match.own_goals_for}</strong></span>}
          </div>
        )}
      </div>

      <div className="section">
        {played && (
          <div className="matchday-stepper">
            {prevMatch ? (
              <Link className="nav" to={`/matchday/${prevMatch.id}`} aria-label={`Previous matchday: vs ${matchTitle(prevMatch)}`}>
                ← Previous
              </Link>
            ) : (
              <span className="nav disabled">← Previous</span>
            )}
            <span className="count">Matchday {matchNumber} of {seasonGames} · {season}</span>
            {nextMatch ? (
              <Link className="nav" to={`/matchday/${nextMatch.id}`} aria-label={`Next matchday: vs ${matchTitle(nextMatch)}`}>
                Next →
              </Link>
            ) : (
              <span className="nav disabled">Next →</span>
            )}
          </div>
        )}

        {seasonOrdered.length > 0 && (
          <>
            <div className="label">Jump to a matchday</div>
            <div className="jump-strip">
              {seasonOrdered.map((m) => {
                const current = m.id === match.id;
                return isPlayed(m) ? (
                  <Link
                    key={m.id}
                    to={`/matchday/${m.id}`}
                    className={`form-badge ${resultOf(m)}${current ? ' current' : ''}`}
                    title={`${formatDate(m.date)} vs ${m.opponent} (${m.goals_for}–${m.goals_against})`}
                    aria-current={current ? 'page' : undefined}
                  >
                    {resultOf(m)}
                  </Link>
                ) : (
                  <Link
                    key={m.id}
                    to={`/matchday/${m.id}`}
                    className={`form-badge fixture${current ? ' current' : ''}`}
                    title={`${formatDate(m.date)} vs ${m.opponent} (upcoming)`}
                    aria-current={current ? 'page' : undefined}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      <div className="sheet section form-next">
        <div>
          <div className="label">Form</div>
          <FormBadges matches={form} />
        </div>
        <NextUp next={nextFixture} teams={teams} />
      </div>

      {played && (star || avgFor != null) && (
        <div className="grid match-cards section">
          {star && (
            <div className="sheet">
              <h3 className="label ruled">Man of the Match</h3>
              <div className="motm-feature">
                <span className="avatar">{initials(star.player.name)}</span>
                <span>
                  <Link to={`/players/${star.player.id}`} className="motm-name">{star.player.name}</Link>
                  <span className="muted motm-line">
                    {[
                      star.goals > 0 && `${star.goals} goal${star.goals > 1 ? 's' : ''}`,
                      star.assists > 0 && `${star.assists} assist${star.assists > 1 ? 's' : ''}`,
                      `appearance ${seasonAppCount.get(star.player_id) ?? '—'} of the season`,
                    ].filter(Boolean).join(' · ')}
                  </span>
                </span>
              </div>
              {boot.length > 0 && (
                <p className="muted boot-line">
                  Golden Boot after this game:{' '}
                  {boot.map((r) => `${r.player.name} ${r.goals}`).join(' · ')}
                </p>
              )}
            </div>
          )}
          {avgFor != null && (
            <div className="sheet">
              <h3 className="label ruled">How it compares</h3>
              <dl className="compare">
                <div>
                  <dt>This game</dt>
                  <dd><strong>{match.goals_for}</strong> scored · <strong>{match.goals_against}</strong> conceded</dd>
                </div>
                <div>
                  <dt>Season average before it</dt>
                  <dd><strong>{nf1(avgFor)}</strong> scored · <strong>{nf1(avgAgainst)}</strong> conceded</dd>
                </div>
                {priorMeetings.length > 0 && (
                  <div>
                    <dt>
                      Earlier against{' '}
                      <Link to={`/opponents/${opponentSlug(teams, match)}`}>{match.opponent}</Link>
                    </dt>
                    <dd>
                      {priorMeetings.map((m) => (
                        <Link key={m.id} to={`/matchday/${m.id}`} className="prior-meeting">
                          <span className={`result-pill ${resultOf(m)}`}>{resultOf(m)}</span>{' '}
                          {m.goals_for}–{m.goals_against} <VenueBadge venue={m.venue} />
                        </Link>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>
      )}

      {milestones.length > 0 && (
        <div className="sheet section">
          <h3 className="label ruled">Worth noting</h3>
          <ul className="milestones">
            {milestones.map((m, i) => (
              <li key={i}>
                <span className="badge-num">{m.n}</span>
                <span>
                  <strong>{m.head}</strong>
                  {m.sub && <span className="muted"> — {m.sub}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {match.report ? (
        <div className="section sheet">
          <h2>Match report</h2>
          <div className="report-body">{match.report}</div>
        </div>
      ) : played && session ? (
        <div className="section">
          <Link className="more" to={`/admin/matches/${match.id}/report`}>Add a match report →</Link>
        </div>
      ) : null}

      {squad.length > 0 && (
        <div className="section sheet">
          <h2>The squad</h2>
          <div className="squad-pills">
            {squad.map((a) => (
              <Link
                key={a.id}
                to={`/players/${a.player.id}`}
                className={`squad-pill${a.motm ? ' motm' : a.goals > 0 ? ' scored' : ''}`}
              >
                {a.player.name}
                {(a.goals > 0 || a.assists > 0) && (
                  <em>
                    {a.goals > 0 && `${a.goals}G`}
                    {a.goals > 0 && a.assists > 0 && ' '}
                    {a.assists > 0 && `${a.assists}A`}
                  </em>
                )}
                {debutIds.has(a.player_id) && <em>1st</em>}
                {a.yellows > 0 && <em className="card-mark">YC</em>}
                {a.reds > 0 && <em className="card-mark">RC</em>}
              </Link>
            ))}
          </div>
          {dropoutNames.length > 0 && (
            <p className="muted" style={{ marginTop: '0.7rem' }}>
              Late dropouts (within 24h): {dropoutNames.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
