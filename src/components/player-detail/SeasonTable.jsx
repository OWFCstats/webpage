/** Every column, one row a season. The overview's season cards carry the four
 *  figures worth a glance; this is the one that settles an argument. */
export default function SeasonTable({ seasons }) {
  return (
    <div className="section sheet">
      <h2>Season by season</h2>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Season</th>
              <th className="num">Apps</th>
              <th className="num">Starts</th>
              <th className="num">Goals</th>
              <th className="num">Assists</th>
              <th className="num">G+A</th>
              <th className="num">MOTM</th>
              <th className="num">Clean sheets</th>
              <th className="num">Yellows</th>
              <th className="num">Reds</th>
              <th className="num">Dropouts</th>
            </tr>
          </thead>
          <tbody>
            {seasons.map((s) => (
              <tr key={s.season}>
                <td><strong>{s.season}</strong></td>
                <td className="num">{s.appearances}</td>
                <td className="num">{s.starts}</td>
                <td className="num">{s.goals}</td>
                <td className="num">{s.assists}</td>
                <td className="num">{s.goalInvolvements}</td>
                <td className="num">{s.motm}</td>
                <td className="num">{s.cleanSheets}</td>
                <td className="num">{s.yellows}</td>
                <td className="num">{s.reds}</td>
                <td className="num">{s.dropouts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {seasons.length === 0 && <div className="empty">No appearances yet.</div>}
    </div>
  );
}
