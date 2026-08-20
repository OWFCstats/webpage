import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ErrorNote, SeasonSelect, Spinner } from '../components/bits';
import SortableTable from '../components/SortableTable';
import BarBoard from '../components/BarBoard';
import { playerTotals, rate, seasonsOf } from '../lib/stats';

// Each board's colour comes from its stat, in lib/tokens.js.
const BOARDS = [
  { key: 'goals', label: 'Goals' },
  { key: 'assists', label: 'Assists' },
  { key: 'goalInvolvements', label: 'G+A' },
  { key: 'appearances', label: 'Apps' },
  { key: 'motm', label: 'MOTM' },
  { key: 'cleanSheets', label: 'Clean sheets' },
];

// The card list leads with regulars; the long tail of one-game players
// collapses behind one honest link instead of padding the page with zeroes.
const SHOW_FIRST = 12;

function initials(name) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function PlayersHub() {
  const { players, matches, appearances, loading, error } = useData();
  const [params, setParams] = useSearchParams();
  const [season, setSeason] = useState('all');
  const [full, setFull] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState('');
  const stat = BOARDS.some((b) => b.key === params.get('stat'))
    ? params.get('stat')
    : 'goals';

  const rows = useMemo(() => {
    if (loading) return [];
    const pool = season === 'all' ? matches : matches.filter((m) => m.season === season);
    return playerTotals(players, pool, appearances).filter(
      (r) => r.appearances > 0 || r.dropouts > 0,
    );
  }, [loading, season, players, matches, appearances]);

  if (loading) return <Spinner />;
  if (error) return <ErrorNote message={error} />;

  const seasons = seasonsOf(matches);
  const board = BOARDS.find((b) => b.key === stat);
  const q = query.trim().toLowerCase();
  const listed = rows
    .filter((r) => !q || r.player.name.toLowerCase().includes(q))
    .sort(
      (a, b) =>
        b[stat] - a[stat] ||
        b.appearances - a.appearances ||
        a.player.name.localeCompare(b.player.name),
    );
  const visible = q || showAll ? listed : listed.slice(0, SHOW_FIRST);
  const hidden = listed.length - visible.length;

  return (
    <div>
      <h1>Players</h1>
      <SeasonSelect seasons={seasons} value={season} onChange={setSeason} />
      <div className="chip-row">
        {BOARDS.map((b) => (
          <button
            key={b.key}
            type="button"
            className={`chip-btn${stat === b.key ? ' active' : ''}`}
            onClick={() => setParams({ stat: b.key })}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="section">
        <BarBoard
          title={board.label}
          rows={rows}
          statKey={stat}
          limit={8}
        />
      </div>

      <div className="section">
        <div className="section-head">
          <h2>The squad</h2>
          <button type="button" className="secondary small" onClick={() => setFull((v) => !v)}>
            {full ? 'Simple view' : 'Full table'}
          </button>
        </div>

        {full ? (
          <div className="sheet">
            <p className="muted">
              Per-game rates count only matches actually played. “Dropouts” is the
              number of times a player was picked but withdrew within 24 hours of
              kick-off. Click any column to sort.
            </p>
            <SortableTable
              filterable
              rows={rows}
              rowKey={(r) => r.player.id}
              initialSort={{ key: stat, dir: 'desc' }}
              emptyText="No appearances recorded for this season yet."
              columns={[
                {
                  key: 'name',
                  label: 'Player',
                  sortValue: (r) => r.player.name,
                  filterValue: (r) => r.player.name,
                  render: (r) => <Link to={`/players/${r.player.id}`}>{r.player.name}</Link>,
                },
                { key: 'appearances', label: 'Apps', num: true },
                { key: 'starts', label: 'Starts', num: true },
                { key: 'goals', label: 'Goals', num: true },
                { key: 'assists', label: 'Assists', num: true },
                { key: 'goalInvolvements', label: 'G+A', num: true },
                { key: 'goalsPerGame', label: 'Goals/game', num: true, render: (r) => rate(r.goalsPerGame) },
                { key: 'involvementsPerGame', label: 'G+A/game', num: true, render: (r) => rate(r.involvementsPerGame) },
                { key: 'motm', label: 'MOTM', num: true },
                { key: 'cleanSheets', label: 'Clean sheets', num: true },
                { key: 'yellows', label: 'Yellows', num: true },
                { key: 'reds', label: 'Reds', num: true },
                {
                  key: 'dropouts',
                  label: 'Dropouts (24h)',
                  num: true,
                  render: (r) => (r.dropouts > 0 ? <span className="tag orange">{r.dropouts}</span> : 0),
                },
              ]}
            />
          </div>
        ) : (
          <div className="sheet">
            <div className="controls">
              <input
                type="text"
                placeholder="Search the squad…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search players"
              />
            </div>
            <ul className="player-list">
              {visible.map((r) => (
                <li key={r.player.id}>
                  <Link className="player-row" to={`/players/${r.player.id}`}>
                    <span className="avatar">{initials(r.player.name)}</span>
                    <span className="who">
                      <strong>{r.player.name}</strong>
                      <span className="muted">
                        {r.appearances} apps · {rate(r.goalsPerGame)} goals/game
                      </span>
                    </span>
                    <span className="nums">
                      <span><strong>{r.goals}</strong><em className="label">G</em></span>
                      <span><strong>{r.assists}</strong><em className="label">A</em></span>
                      <span><strong>{r.motm}</strong><em className="label">MOTM</em></span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {listed.length === 0 && <div className="empty">No players match.</div>}
            {hidden > 0 && (
              <p className="show-all">
                <button type="button" className="secondary small" onClick={() => setShowAll(true)}>
                  Show all {listed.length} players →
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
