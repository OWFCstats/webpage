export default function SeasonCards({ seasons, bestSeason }) {
  if (seasons.length === 0) return null;
  return (
    <div className="section">
      <h3 className="block board">Season by season</h3>
      <div className="season-cards">
        {seasons.map((s) => (
          <div key={s.season} className={`sheet season-card${bestSeason && s.season === bestSeason.season ? ' best' : ''}`}>
            <div className="sc-year">
              {s.season}
              {bestSeason && s.season === bestSeason.season && <span className="tag gold">Best</span>}
            </div>
            <div className="sc-row">
              <div><span className="v">{s.appearances}</span><span className="label">Apps</span></div>
              <div><span className="v">{s.goals}</span><span className="label">Goals</span></div>
              <div><span className="v">{s.assists}</span><span className="label">Assists</span></div>
              <div><span className="v">{s.cleanSheets}</span><span className="label">CS</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
