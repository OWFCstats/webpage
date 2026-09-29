import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { ErrorNote, Spinner } from '../../components/bits';
import AdminList from '../../components/AdminList';
import ChipFilter from '../../components/ChipFilter';
import AnswerRow from '../../components/match-availability/AnswerRow';
import { answersFor, pollList } from '../../lib/availability';
import { useAvailability } from '../../lib/useAvailability';
import { formatDate } from '../../lib/format';

/**
 * One match's poll, typed in from the group chat. Open before the game, and
 * after it too — an answer missed on the night is fixed here the same way.
 * Every tap saves on its own (see `useAvailability`).
 */
export default function MatchAvailability() {
  const { matchId } = useParams();
  const { players, matches, loading, error: loadError } = useData();
  const match = matches.find((m) => m.id === matchId);
  const { rows, loading: pollLoading, error, setAnswer } = useAvailability(match ? [match.id] : []);
  const [show, setShow] = useState('all');

  if (loading) return <Spinner />;
  if (loadError) return <ErrorNote message={loadError} />;
  if (!match) return <Navigate to="/admin/availability" replace />;

  const answers = answersFor(rows, match.id);
  const asked = pollList(players, answers);
  const yes = asked.filter((p) => answers.get(p.id) === true).length;
  const no = asked.filter((p) => answers.get(p.id) === false).length;
  const none = asked.length - yes - no;
  const listed = asked.filter((p) =>
    show === 'all' ? true : show === 'none' ? !answers.has(p.id) : answers.get(p.id) === (show === 'in'),
  );

  return (
    <div className="section">
      <div className="section-head">
        <h2>Availability — vs {match.opponent}, {formatDate(match.date)}</h2>
        <Link className="btn secondary small" to={`/admin/matches/${match.id}/lineup`}>Lineup</Link>
      </div>

      <div className="sheet">
        {error && <div className="notice error">{error}</div>}
        {pollLoading ? (
          <Spinner />
        ) : asked.length === 0 ? (
          <div className="empty">
            Nobody is marked as in the main chat yet — tick them
            on <Link to="/admin/players">Players</Link>, then come back to the poll.
          </div>
        ) : (
          <>
            <p className="muted">{yes} in · {no} out · {none} no reply</p>
            <ChipFilter
              label="Show"
              value={show}
              onChange={setShow}
              options={[
                { value: 'all', label: `All ${asked.length}` },
                { value: 'none', label: `No reply ${none}` },
                { value: 'in', label: `In ${yes}` },
                { value: 'out', label: `Out ${no}` },
              ]}
            />
            <AdminList
              filterable
              filterLabel="Find a name…"
              rows={listed}
              rowKey={(p) => p.id}
              filterValue={(p) => p.name}
              emptyText="Nobody in this group."
            >
              {(p) => (
                <AnswerRow
                  player={p}
                  answer={answers.get(p.id)}
                  onAnswer={(value) => setAnswer(match.id, p.id, value, answers.get(p.id) ?? null)}
                />
              )}
            </AdminList>
          </>
        )}
      </div>
    </div>
  );
}
