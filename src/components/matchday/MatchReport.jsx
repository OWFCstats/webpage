import { Link } from 'react-router-dom';

/** The report if there is one; otherwise, for an admin, the prompt to write
 *  it. A visitor sees nothing rather than an empty heading. */
export default function MatchReport({ match, canWrite }) {
  if (match.report) {
    return (
      <div className="section sheet">
        <h2>Match report</h2>
        <div className="report-body">{match.report}</div>
      </div>
    );
  }
  if (!canWrite) return null;
  return (
    <div className="section">
      <Link className="more" to={`/admin/matches/${match.id}/report`}>Add a match report →</Link>
    </div>
  );
}
