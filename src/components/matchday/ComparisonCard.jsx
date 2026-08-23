import { Link } from 'react-router-dom';
import ResultList from '../ResultList';
import { opponentSlug } from '../../lib/matches';

const nf1 = (v) => (Math.round(v * 10) / 10).toFixed(1);

/** This game against the season around it: whether it was a normal afternoon
 *  or not, which is the question a scoreline on its own can't answer. */
export default function ComparisonCard({ match, avgFor, avgAgainst, priorMeetings, teams }) {
  return (
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
            <dd><ResultList matches={priorMeetings} inline /></dd>
          </div>
        )}
      </dl>
    </div>
  );
}
