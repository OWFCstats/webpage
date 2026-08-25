// The invariants, as one function that runs inside the page.
//
// Playwright serialises this into the browser, so it can't import anything and
// has to be self-contained. Everything it returns is a finding — deciding
// which findings are already owned by a phase is the runner's job.
//
// The wording of each invariant matters more than the code. Three earlier
// rounds of measurement passed while two tables hid a third of themselves,
// because they asserted "no table scrolls *outside* a .table-wrap" — a claim a
// wrapped table satisfies by definition, since the wrap's whole job is to
// scroll. See DESIGN.md → Mobile.
//
// Six invariants, and they are meant not to overlap: one bug should produce
// one finding. A table inside a scrolling wrap is a hidden column, not also
// forty overflowing cells, so anything inside a clipping ancestor is left to
// the ancestor's own finding.

export async function collector() {
  // Subpixel layout rounds to integers, so a 1px difference is arithmetic
  // rather than a hidden column.
  const SLACK = 1;

  /** A short, stable-ish path: enough to name the element in a report. */
  function signature(el) {
    const parts = [];
    for (let node = el; node && node !== document.body; node = node.parentElement) {
      const attr = node.getAttribute ? node.getAttribute('class') : null;
      const classes = attr && attr.trim() ? `.${attr.trim().split(/\s+/).join('.')}` : '';
      parts.unshift(`${node.tagName.toLowerCase()}${classes}`);
      if (parts.length === 4) break;
    }
    return parts.join(' > ');
  }

  function label(el) {
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
    return text.length > 48 ? `${text.slice(0, 45)}…` : text;
  }

  const findings = [];
  const add = (invariant, el, detail) => {
    findings.push({ invariant, signature: signature(el), label: label(el), detail });
  };

  const viewport = window.innerWidth;
  const styles = new Map();
  const styleOf = (el) => {
    if (!styles.has(el)) styles.set(el, getComputedStyle(el));
    return styles.get(el);
  };

  const visible = [...document.body.querySelectorAll('*')].filter((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;
    const style = styleOf(el);
    return style.visibility !== 'hidden' && style.display !== 'none';
  });

  const clips = (el) => styleOf(el).overflowX !== 'visible';
  /** The nearest ancestor that clips or scrolls, or null. */
  function clippingAncestor(el) {
    for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
      if (clips(node)) return node;
    }
    return null;
  }

  // ---- 1. The page itself doesn't scroll sideways. -------------------------
  // The symptom the squad actually feels, and worth its own line even though
  // one of the findings below is always the cause.
  const docWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  if (docWidth > viewport + SLACK) {
    add('page-overflows', document.body, `document is ${docWidth}px in a ${viewport}px viewport`);
  }

  // ---- 2. No element exceeds the viewport. --------------------------------
  // Only the outermost offender, and only where nothing above it clips: an
  // element inside a scrolling wrap is that wrap's finding (invariant 3), and
  // one inside a clipped box is invariant 4's.
  const reported = new Set();
  for (const el of visible) {
    if (styleOf(el).position === 'fixed') continue; // positioned against the viewport
    if (clippingAncestor(el)) continue;
    if (reported.has(el.parentElement)) { reported.add(el); continue; }
    const over = Math.round(el.getBoundingClientRect().right - viewport);
    if (over > SLACK) {
      reported.add(el);
      const needs = el.tagName === 'TABLE' ? `, table needs ${el.scrollWidth}px` : '';
      add('element-overflows', el, `extends ${over}px past the right edge${needs}`);
    }
  }

  // ---- 3. No table hides a column inside a scrolling wrap. ----------------
  // Stated as "a scroller holding a table", not as ".table-wrap", so a wrapper
  // introduced later under a different name is covered by the rule rather than
  // by somebody remembering to add it. The chip rows (.chip-row, the segmented
  // control under a section head) are deliberate horizontal scrollers and hold
  // no table, so they fall outside this by construction — a control is not a
  // hidden column. Matchday's own stepper and season chips used to be the
  // example here; Phase 25 replaced both with the ladder, which scrolls
  // nowhere.
  //
  // `.wide-reference-table` is the one deliberate exception that does hold a
  // table: the data centre's own fbref-style sheet, built for a reader who
  // wants every stat and a scrollbar rather than five separate ones. See
  // docs/DESIGN.md → Mobile. Nothing else carries this class — a second
  // caller would need its own argument for why it also gets to opt out, not a
  // widened selector here.
  for (const el of visible) {
    if (!clips(el) || styleOf(el).overflowX === 'hidden' || styleOf(el).overflowX === 'clip') continue;
    if (el.classList.contains('wide-reference-table')) continue;
    const holdsTable = el.querySelector('table') !== null;
    if (!holdsTable && !el.classList.contains('table-wrap')) continue;
    const hidden = el.scrollWidth - el.clientWidth;
    if (hidden > SLACK) {
      add('table-wrap-scrolls', el, `hides ${hidden}px of ${el.scrollWidth}px`);
    }
  }

  // ---- 4. No leaf clips its own text. -------------------------------------
  // The clipped-name bug: "Old Cheltonians" needing 82px in 74px. Only
  // elements that actually clip count — overflow visible can spill past its
  // box, which invariant 2 catches at the viewport edge, but it never cuts a
  // word in half.
  for (const el of visible) {
    if (el.children.length > 0) continue;
    const text = (el.textContent || '').trim();
    if (!text) continue;
    if (styleOf(el).overflowX === 'visible') continue;
    const hidden = el.scrollWidth - el.clientWidth;
    if (hidden > SLACK) {
      add('text-clipped', el, `"${text.slice(0, 30)}" needs ${el.scrollWidth}px in ${el.clientWidth}px`);
    }
  }

  // ---- 5. Every icon clears 3:1 across the majority of its own ink. -------
  // Composited rather than read off an attribute. The old rule took `fill`
  // from the root <svg>, which is one colour for the five nav icons it was
  // written against and meaningless for a badge drawing that carries its
  // colour on up to thirty-six child paths — on those it read the initial
  // value, black, and would have passed a gold cup on green while failing the
  // same cup on paper. So every icon is drawn at 64px with its computed paint
  // baked in, composited over the ground it sits on, and scored as the share
  // of its own ink clearing 3:1. That is what this script reports, icon by
  // icon, and Phase 15's badges are held to it.
  //
  // Two things are still reported as unmeasurable rather than guessed at: a
  // bitmap, whose ink this can't read, and a gradient ground, whose luminance
  // varies across the icon.
  const channel = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const luminance = ([r, g, b]) =>
    0.2126 * channel(r / 255) + 0.7152 * channel(g / 255) + 0.0722 * channel(b / 255);
  const parse = (value) => {
    const nums = (value || '').match(/[\d.]+/g);
    if (!nums || nums.length < 3) return null;
    return { rgb: nums.slice(0, 3).map(Number), alpha: nums.length > 3 ? Number(nums[3]) : 1 };
  };
  function ground(el) {
    for (let node = el.parentElement; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.backgroundImage && style.backgroundImage !== 'none') return { gradient: true };
      const colour = parse(style.backgroundColor);
      if (colour && colour.alpha > 0.95) return { rgb: colour.rgb };
    }
    const body = parse(getComputedStyle(document.body).backgroundColor);
    return body ? { rgb: body.rgb } : null;
  }
  const ratio = (a, b) => {
    const [hi, lo] = [luminance(a) + 0.05, luminance(b) + 0.05].sort((x, y) => y - x);
    return hi / lo;
  };

  // Paint lives in CSS for the nav icons and on the paths for the badges, and
  // a serialised copy of the node carries neither. Baking the computed value
  // onto every element is what makes one measurement cover both.
  const PAINT = [
    'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
    'fill-opacity', 'stroke-opacity', 'opacity', 'stop-color', 'stop-opacity',
  ];
  function baked(el) {
    const clone = el.cloneNode(true);
    const from = [el, ...el.querySelectorAll('*')];
    const to = [clone, ...clone.querySelectorAll('*')];
    from.forEach((node, i) => {
      const style = getComputedStyle(node);
      for (const prop of PAINT) {
        const value = style.getPropertyValue(prop);
        if (value) to[i].setAttribute(prop, value);
      }
    });
    return new XMLSerializer().serializeToString(clone);
  }

  const SIZE = 64;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const scored = new Map();

  /** The share of an icon's own ink that clears 3:1 on `bg`, or null when the
   *  drawing renders nothing at all. */
  async function inkAbove3(markup, bg) {
    const key = `${markup}|${bg.join(',')}`;
    if (scored.has(key)) return scored.get(key);
    const img = new Image(SIZE, SIZE);
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
    await img.decode();
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.drawImage(img, 0, 0, SIZE, SIZE);
    const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
    let ink = 0;
    let clears = 0;
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3] / 255;
      // Half-covered pixels are the antialiased edge, not the drawing.
      if (alpha < 0.5) continue;
      ink += 1;
      const over = [0, 1, 2].map((c) => data[i + c] * alpha + bg[c] * (1 - alpha));
      if (ratio(over, bg) >= 3) clears += 1;
    }
    const share = ink === 0 ? null : clears / ink;
    scored.set(key, share);
    return share;
  }

  let iconsMeasured = 0;
  const icons = visible.filter(
    (el) =>
      el.tagName === 'svg'
      || el.tagName === 'IMG'
      || /(^|[\s-])icon([\s-]|$)/.test(el.getAttribute('class') || ''),
  );
  for (const el of icons) {
    // A wrapper around a drawing is not itself an icon — the svg inside it is,
    // and one bug should produce one finding.
    if (el.tagName !== 'svg' && el.querySelector('svg')) continue;
    // A chart is not an icon. Recharts draws a whole plot into one <svg>, most
    // of whose ink is gridlines and axis rules that are deliberately faint;
    // scoring that as one drawing's footprint measures nothing. The series
    // colours have their own rule — 4.5:1, so a line can label itself — in
    // DESIGN.md → Chart series. The hand-rolled sparklines are ours and stay
    // measured: they are one shape in one colour, which is what this reads.
    if (el.closest('.recharts-wrapper')) continue;
    const bg = ground(el);
    if (!bg) continue;
    if (el.tagName === 'IMG') {
      add('icon-unmeasurable', el, 'bitmap icon — contrast has to be measured against the artwork');
      continue;
    }
    if (bg.gradient) {
      add('icon-unmeasurable', el, 'sits on a gradient — ground luminance varies across the icon');
      continue;
    }
    if (el.tagName !== 'svg') {
      // Something wearing an icon class that isn't a drawing: its ink is its
      // own text colour, which is one value and needs no compositing.
      const ink = parse(getComputedStyle(el).color);
      if (!ink) continue;
      iconsMeasured += 1;
      const contrast = ratio(ink.rgb, bg.rgb);
      if (contrast < 3) {
        add('icon-contrast', el, `${contrast.toFixed(2)}:1 against its ground, needs 3:1`);
      }
      continue;
    }
    let share = null;
    try {
      share = await inkAbove3(baked(el), bg.rgb);
    } catch (err) {
      add('icon-unmeasurable', el, `could not be rendered for measurement: ${err.message}`);
      continue;
    }
    if (share === null) continue; // draws nothing — there is no ink to score
    iconsMeasured += 1;
    if (share < 0.5) {
      add(
        'icon-contrast',
        el,
        `${Math.round(share * 100)}% of its ink clears 3:1 against its ground, needs a majority`,
      );
    }
  }

  // ---- 6. No badge renders below its floor. -------------------------------
  // A trophy is a plinth plus an object and merges into a blob under 20px; the
  // rest hold at 16 (DESIGN.md → The icons). The component clamps to the floor,
  // so what this catches is the other way in: a flex or grid context squeezing
  // a drawing after the fact. The floor rides on the element rather than being
  // restated here — the badge's own class is what sets it.
  for (const el of visible) {
    if (!el.classList.contains('badge-icon')) continue;
    const floor = Number(el.dataset.floor);
    const svg = el.querySelector('svg');
    if (!floor || !svg) continue;
    const box = svg.getBoundingClientRect();
    const drawn = Math.min(box.width, box.height);
    if (drawn < floor - SLACK) {
      add('icon-below-floor', el, `${el.dataset.badge} draws at ${Math.round(drawn)}px, floor is ${floor}px`);
    }
  }

  return {
    findings,
    height: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
    iconsMeasured,
  };
}
