import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, Spinner } from '../components/bits';
import { formatDate } from '../lib/format';
import {
  currentStreak,
  isPlayed,
  opponentMatches,
  resultOf,
  seasonSummary,
  venueSummary,
} from '../lib/matches';

const US = 'Old Wellingtonians';

function streakSentence(streak) {
  if (!streak) return null;
  const verb = { W: 'Won', D: 'Drawn', L: 'Lost' }[streak.result];
  const noun = streak.count === 1 ? 'the last meeting' : `the last ${streak.count} meetings`;
  return `${verb} ${noun}`;
}

function RecordRow({ label, summary }) {
  return (
    <tr>
      <td><strong>{label}</strong></td>
      <td className="num">{summary.played}</td>
      <td className="num">{summary.won}</td>
      <td className="num">{summary.drawn}</td>
      <td className="num">{summary.lost}</td>
      <td className="num">{summary.goalsFor}</td>
      <td className="num">{summary.goalsAgainst}</td>
      <td className="num">{summary.goalsFor - summary.goalsAgainst}</td>
    </tr>
  );
}

export default function OpponentDetail() {
  const { name } = useParams();
  const { matches, teams, loading, error } = useData();

  const resolved = useMemo(() => opponentMatches(matches, teams, name), [matches, teams, name]);

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;
  if (!resolved) {
    return (
      <div className="empty sheet">
        Opponent not found. <Link className="more" to="/season">Full season →</Link>
      </div>
    );
  }

  const { team, matches: oppMatches } = resolved;
  const overall = seasonSummary(oppMatches);
  const { home, away } = venueSummary(oppMatches);
  const streak = currentStreak(oppMatches);
  const meetings = oppMatches.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
  const sentence = streakSentence(streak);
  const hasPitchDetails = team.pitch_name || team.pitch_address || team.postcode || team.map_url;

  return (
    <div>
      <div className="section-head">
        <h1>{team.name}</h1>
      </div>
      <p className="muted page-intro">Head-to-head record against {US}.</p>
      {sentence && <p className="muted">{sentence}.</p>}

      {hasPitchDetails && (
        <div className="sheet section">
          <h2>Pitch</h2>
          <dl className="compare">
            {team.pitch_name && (
              <div><dt>Pitch</dt><dd>{team.pitch_name}</dd></div>
            )}
            {team.pitch_address && (
              <div><dt>Address</dt><dd>{team.pitch_address}</dd></div>
            )}
            {team.postcode && (
              <div><dt>Postcode</dt><dd>{team.postcode}</dd></div>
            )}
            {team.map_url && (
              <div>
                <dt>Map</dt>
                <dd><a href={team.map_url} target="_blank" rel="noreferrer">Open in maps →</a></dd>
              </div>
            )}
          </dl>
        </div>
      )}

      <div className="sheet section">
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th></th>
                <th className="num">P</th>
                <th className="num">W</th>
                <th className="num">D</th>
                <th className="num">L</th>
                <th className="num">GF</th>
                <th className="num">GA</th>
                <th className="num">GD</th>
              </tr>
            </thead>
            <tbody>
              <RecordRow label="Overall" summary={overall} />
              <RecordRow label="Home" summary={home} />
              <RecordRow label="Away" summary={away} />
            </tbody>
          </table>
        </div>
      </div>

      <div className="section">
        <h2>Every meeting</h2>
        <div className="sheet">
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Home</th>
                  <th className="score-cell">Score</th>
                  <th>Away</th>
                  <th>Competition</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((m) => {
                  const weAreHome = m.venue !== 'A';
                  const homeTeam = weAreHome ? US : team.name;
                  const awayTeam = weAreHome ? team.name : US;
                  const homeGoals = weAreHome ? m.goals_for : m.goals_against;
                  const awayGoals = weAreHome ? m.goals_against : m.goals_for;
                  return (
                    <tr key={m.id}>
                      <td><Link to={`/matchday/${m.id}`}>{formatDate(m.date)}</Link></td>
                      <td>{homeTeam}</td>
                      <td className="score-cell">
                        {isPlayed(m) ? (
                          <>
                            <strong>{homeGoals}–{awayGoals}</strong>{' '}
                            <span className={`result-pill ${resultOf(m)}`}>{resultOf(m)}</span>
                          </>
                        ) : (
                          'v'
                        )}
                      </td>
                      <td>{awayTeam}</td>
                      <td><span className="tag">{m.competition}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {meetings.length === 0 && <div className="empty">No meetings recorded yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
