import { ordinal } from '../../lib/format';

export default function RankCard({ ranks }) {
  return (
    <div className="sheet">
      <h3 className="block board">Where they rank</h3>
      <ul className="rank-list">
        {ranks.map((r) => (
          <li key={r.key}>
            <span className={`rank-pos${r.rank != null && r.rank <= 3 ? ' top' : ''}`}>
              {r.rank == null ? '—' : ordinal(r.rank)}
            </span>
            <span className="rank-den">of {r.of}</span>
            <span className="rank-what">{r.label}</span>
            <span className="rank-val">{r.value}</span>
          </li>
        ))}
      </ul>
      <p className="muted card-foot">Ranked against everyone who has played for the club.</p>
    </div>
  );
}
