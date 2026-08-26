import { useState } from 'react';
import { Link } from 'react-router-dom';
import { clampReport } from '../../lib/format';

const CLAMP = 300;

/** The report if there is one — its first ~300 characters with the rest
 *  behind one control, since reports run from two lines to a thousand
 *  characters and the long ones used to set the length of the whole page.
 *  For an admin with nothing to show, the prompt to write one; a visitor
 *  sees nothing rather than an empty heading. */
export default function MatchReport({ match, canWrite }) {
  const [open, setOpen] = useState(false);

  if (match.report) {
    const { head, rest } = clampReport(match.report, CLAMP);
    return (
      <div className="section sheet">
        <h2>Match report</h2>
        <div className="report">
          {head.map((p, i) => <p key={`head-${i}`}>{p}</p>)}
          {open && rest.map((p, i) => <p key={`rest-${i}`}>{p}</p>)}
          {rest.length > 0 && (
            <button
              type="button"
              className="report-more"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? 'Show less' : 'Read the rest'}
            </button>
          )}
        </div>
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
