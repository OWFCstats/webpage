import ResultList from '../ResultList';

/** Every meeting, oldest first, as the shared result row — the opponent is
 *  already this whole page, so the row drops the name and keeps the date and
 *  competition instead. */
export default function MeetingsTable({ meetings }) {
  return (
    <div className="section">
      <h2>Every meeting</h2>
      <div className="sheet">
        <ResultList
          matches={meetings}
          showOpponent={false}
          showMeta
          emptyText="No meetings recorded yet."
        />
      </div>
    </div>
  );
}
