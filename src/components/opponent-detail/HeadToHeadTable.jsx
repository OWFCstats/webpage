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

/** The record against one club, split by where it was played. */
export default function HeadToHeadTable({ overall, home, away }) {
  return (
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
  );
}
