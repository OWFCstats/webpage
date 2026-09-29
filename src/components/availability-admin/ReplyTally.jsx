import AdminList, { AdminRow } from '../AdminList';
import { formatDate } from '../../lib/format';

/**
 * Who answers, worst first. An Out is as good as an In here: what the tally
 * is for is finding the members who never answer at all.
 */
export default function ReplyTally({ tally, polls }) {
  return (
    <AdminList
      filterable
      filterLabel="Find a name…"
      rows={tally}
      rowKey={(t) => t.player.id}
      filterValue={(t) => t.player.name}
      emptyText="Nobody is marked as in the main chat yet — tick them on Players."
    >
      {(t) => (
        <AdminRow
          title={
            <>
              {t.player.name}
              {t.replied === 0 && polls > 0 && <span className="tag orange">never replied</span>}
            </>
          }
          meta={
            t.replied === 0
              ? `Replied 0 of ${polls}`
              : `Replied ${t.replied} of ${polls} · ${t.yes} in · ${t.no} out · last ${formatDate(t.lastReply)}`
          }
        />
      )}
    </AdminList>
  );
}
