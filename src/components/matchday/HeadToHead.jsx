import { Link } from 'react-router-dom';
import ResultList from '../ResultList';
import { CLUB_NAME, opponentSlug } from '../../lib/matches';
import { formatDateTime, ordinal, plural } from '../../lib/format';

const nf1 = (v) => (Math.round(v * 10) / 10).toFixed(1);

// Higher is better for points, wins, draws and goals scored; fewer is
// better for losses and goals conceded — the football reading of each
// figure, not just which number happens to be larger.
const FIGURES = [
  { key: 'points', label: 'Points', higherIsBetter: true },
  { key: 'won', label: 'Won', higherIsBetter: true },
  { key: 'drawn', label: 'Drawn', higherIsBetter: true },
  { key: 'lost', label: 'Lost', higherIsBetter: false },
  { key: 'goals_for', label: 'Scored', higherIsBetter: true },
  { key: 'goals_against', label: 'Conceded', higherIsBetter: false },
];

/** One figure, two mirrored bars growing outward from a centre label. The
 *  leading side keeps its own colour; the trailing side takes --ink-soft. A
 *  genuine tie leads neither, so three wins each doesn't read as one side
 *  being behind. */
function TapeRow({ label, higherIsBetter, a, b }) {
  const max = Math.max(a, b);
  const widthA = max > 0 ? (a / max) * 100 : 0;
  const widthB = max > 0 ? (b / max) * 100 : 0;
  const aLeads = a !== b && (higherIsBetter ? a > b : a < b);
  const bLeads = a !== b && (higherIsBetter ? b > a : b < a);
  return (
    <div className="tape-row">
      <span className={`v a${bLeads ? ' behind' : ''}`}>{a}</span>
      <span className="t a"><i style={{ width: `${widthA}%` }} /></span>
      <span className="k">{label}</span>
      <span className="t b"><i style={{ width: `${widthB}%` }} /></span>
      <span className={`v b${aLeads ? ' behind' : ''}`}>{b}</span>
    </div>
  );
}

/**
 * How this opponent compares: every meeting this season first — prior
 * meetings plus this one, on ResultList's compact inline variant — then the
 * league tape, where both sides have a row in the same table this season.
 *
 * The empty branch is the common one: a friendly, a cup tie, or a club with
 * no row in the division has no tape. The meetings list still stands alone,
 * with the two figures a scoreline can't show by itself — this game against
 * the season average before it.
 */
export default function HeadToHead({
  match, teams, priorMeetings, avgFor, avgAgainst, us, them, division, updatedAt,
}) {
  const meetings = [...priorMeetings, match];
  const hasTape = Boolean(us && them);

  return (
    <div className="section sheet">
      <h3 className="block verdigris">Head to head</h3>
      <ResultList matches={meetings} inline />

      {hasTape ? (
        <>
          <div className="tape-head">
            <span className="side a">{CLUB_NAME}<span className="pos">{ordinal(us.rank)}</span></span>
            <span className="label">{division}</span>
            <span className="side b">
              <Link to={`/opponents/${opponentSlug(teams, match)}`}>{them.name}</Link>
              <span className="pos">{ordinal(them.rank)}</span>
            </span>
          </div>
          <div className="tape">
            {FIGURES.map((f) => (
              <TapeRow
                key={f.key}
                label={f.label}
                higherIsBetter={f.higherIsBetter}
                a={us[f.key]}
                b={them[f.key]}
              />
            ))}
          </div>
          <p className="tape-foot muted">
            {us.played === them.played
              ? `${plural(us.played, 'league game', 'league games')} each`
              : `${us.played} league games for us, ${them.played} for them`}
            , standings entered {formatDateTime(updatedAt)}.
          </p>
        </>
      ) : (
        <dl className="compare">
          <div>
            <dt>This game</dt>
            <dd><strong>{match.goals_for}</strong> scored · <strong>{match.goals_against}</strong> conceded</dd>
          </div>
          {avgFor != null && (
            <div>
              <dt>Season average before it</dt>
              <dd><strong>{nf1(avgFor)}</strong> scored · <strong>{nf1(avgAgainst)}</strong> conceded</dd>
            </div>
          )}
        </dl>
      )}
    </div>
  );
}
