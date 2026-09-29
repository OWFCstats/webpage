import { Link } from 'react-router-dom';
import AdminList, { AdminRow } from '../AdminList';
import { formatDate } from '../../lib/format';

/** Every game in the season, newest first, each with where its poll stands. */
export default function PollMatches({ matches, counts }) {
  return (
    <AdminList
      rows={matches}
      rowKey={(m) => m.id}
      emptyText="No games in this season yet — create a match first."
    >
      {(m) => {
        const c = counts.get(m.id);
        return (
          <AdminRow
            inline
            title={m.opponent}
            meta={
              <>
                {formatDate(m.date)} · {m.competition} ·{' '}
                {c ? `${c.yes} in · ${c.no} out · ${c.noReply} no reply` : 'no answers yet'}
              </>
            }
            actions={
              <Link className="btn secondary small" to={`/admin/matches/${m.id}/availability`}>
                {c ? 'Edit' : 'Enter'}
              </Link>
            }
          />
        );
      }}
    </AdminList>
  );
}
