/**
 * The dark band directly under the masthead: paper plates on a green ground,
 * a gold hairline on each. It reuses the masthead's own `--board` tokens
 * rather than the `.board` surface class — this is chrome, the same register
 * as the header and the tab bar, not one of the site's occasions, so nesting
 * a paper plate inside it isn't the box-in-a-box `.board` rules out.
 *
 * `form` is Phase 58's card and is undefined until it lands — until then the
 * band holds the fixture plate alone, at full width, rather than an empty
 * slot next to it.
 */
export default function ClubBand({ form, fixture }) {
  return (
    <section className={`club-band${form ? '' : ' club-band-solo'}`}>
      {form}
      {fixture}
    </section>
  );
}
