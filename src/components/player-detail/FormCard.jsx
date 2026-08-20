import { Link } from 'react-router-dom';
import { formatDate } from '../../lib/format';
import { opponentSlug, resultOf } from '../../lib/matches';

export default function FormCard({ form, scoringRun, sinceGoal, favouriteOpponent, teams }) {
  const scoredIn = form.filter((f) => f.app.goals > 0).length;
  return (
    <div className="sheet">
      <h3 className="label ruled">Last {form.length} played</h3>
      <div className="form-games">
        {form.map(({ app, match }) => (
          <Link key={app.id} to={`/matchday/${match.id}`} className="fg" title={`${formatDate(match.date)} vs ${match.opponent}`}>
            <span className={`result-pill ${resultOf(match)}`}>{resultOf(match)}</span>
            <span className="fg-op">{match.opponent}</span>
            <span className={`fg-mine${app.goals + app.assists === 0 ? ' blank' : ''}`}>
              {app.goals + app.assists === 0
                ? '–'
                : [app.goals > 0 && `${app.goals}G`, app.assists > 0 && `${app.assists}A`].filter(Boolean).join(' ')}
            </span>
          </Link>
        ))}
      </div>
      <p className="muted card-foot">
        {scoredIn > 0
          ? `Scored in ${scoredIn} of the last ${form.length}.`
          : `No goals in the last ${form.length}.`}
        {scoringRun > 1 && ` On a ${scoringRun}-game scoring run.`}
        {scoringRun === 0 && sinceGoal > form.length && ` ${sinceGoal} games since the last one.`}
      </p>
      {favouriteOpponent && (
        <p className="muted card-foot">
          {favouriteOpponent.goals} goal{favouriteOpponent.goals > 1 ? 's' : ''} in {favouriteOpponent.games} v{' '}
          <Link to={`/opponents/${opponentSlug(teams, favouriteOpponent)}`}>{favouriteOpponent.opponent}</Link> — more than
          against anyone else.
        </p>
      )}
    </div>
  );
}
