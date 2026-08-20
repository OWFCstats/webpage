/** Where they play, when we know it. Renders nothing rather than a heading
 *  over four dashes. */
export default function PitchDetails({ team }) {
  const known = team.pitch_name || team.pitch_address || team.postcode || team.map_url;
  if (!known) return null;
  return (
    <div className="sheet section">
      <h2>Pitch</h2>
      <dl className="compare">
        {team.pitch_name && (
          <div><dt>Pitch</dt><dd>{team.pitch_name}</dd></div>
        )}
        {team.pitch_address && (
          <div><dt>Address</dt><dd>{team.pitch_address}</dd></div>
        )}
        {team.postcode && (
          <div><dt>Postcode</dt><dd>{team.postcode}</dd></div>
        )}
        {team.map_url && (
          <div>
            <dt>Map</dt>
            <dd><a href={team.map_url} target="_blank" rel="noreferrer">Open in maps →</a></dd>
          </div>
        )}
      </dl>
    </div>
  );
}
