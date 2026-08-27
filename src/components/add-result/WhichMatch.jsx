import FixturePicker from './FixturePicker';
import MatchStep from './MatchStep';

/**
 * Step one, whole: which game, then what the game was.
 *
 * The picker comes first because the club enters fixtures in advance, and this
 * flow used to insert a second row for one that already existed. The clash
 * notice is the same guard reached the long way round — typing a date and an
 * opponent that are already in the diary.
 */
export default function WhichMatch({
  fixtures, today, fixtureId, asked, clash, form, setForm,
  recentSeasons, defaultSeason, teams, onChoose, onClear,
}) {
  return (
    <>
      <FixturePicker
        fixtures={fixtures}
        today={today}
        chosenId={fixtureId}
        onChoose={onChoose}
        onClear={onClear}
      />
      {asked && (
        <>
          <MatchStep
            form={form}
            setForm={setForm}
            recentSeasons={recentSeasons}
            defaultSeason={defaultSeason}
            teams={teams}
          />
          {clash && (
            <div className="notice error">
              <strong>{clash.opponent}</strong> on that date is already in the diary as a
              fixture. Saving now would put the same match on the site twice.{' '}
              <button type="button" className="secondary small" onClick={() => onChoose(clash)}>
                Fill that one in instead
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
