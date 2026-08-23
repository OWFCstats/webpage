import ResultList from '../ResultList';

/** Every result in the season, as the shared row — one shape at every width,
 *  rather than a data table on desktop and a list on a phone. */
export default function ResultsTable({ results }) {
  return (
    <div className="sheet section">
      <h2>Results</h2>
      <ResultList matches={results} emptyText="No results in this season yet." showMeta />
    </div>
  );
}
