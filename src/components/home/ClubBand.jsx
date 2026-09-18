/**
 * The dark band directly under the masthead: paper plates on a green ground,
 * a gold hairline on each. It reuses the masthead's own `--board` tokens
 * rather than the `.board` surface class — this is chrome, the same register
 * as the header and the tab bar, not one of the site's occasions, so nesting
 * a paper plate inside it isn't the box-in-a-box `.board` rules out.
 *
 * Full-bleed (Phase 67, `DESIGN.md` → *Draft D is the specification*): the
 * outer `<section>` carries no padding of its own so its ground spans the
 * viewport, and `.club-band-inner` centres the plates in the site's own
 * 1400px column with its own gutters — the same trick `main.page` no longer
 * needs to do for Home.
 *
 * `form` is Phase 58's card; Home always supplies one now, but the prop stays
 * optional so a caller with nothing to put there gets the fixture plate at
 * full width rather than an empty slot beside it.
 */
export default function ClubBand({ form, fixture }) {
  return (
    <section className="club-band">
      <div className={`club-band-inner${form ? '' : ' club-band-solo'}`}>
        {form}
        {fixture}
      </div>
    </section>
  );
}
