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
// Five invariants, and they are meant not to overlap: one bug should produce
// one finding. A table inside a scrolling wrap is a hidden column, not also
// forty overflowing cells, so anything inside a clipping ancestor is left to
// the ancestor's own finding.

export function collector() {
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
  // by somebody remembering to add it. The chip rows (the Matchday stepper,
  // the season chips) are deliberate horizontal scrollers and hold no table,
  // so they fall outside this by construction — a stepper is a control, and
  // scrolling one is not a hidden column.
  for (const el of visible) {
    if (!clips(el) || styleOf(el).overflowX === 'hidden' || styleOf(el).overflowX === 'clip') continue;
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

  // ---- 5. Every icon clears 3:1 against the ground it sits on. ------------
  // Contrast is computed from the ink the icon is drawn with and the first
  // opaque background above it. Two things are reported as unmeasurable rather
  // than guessed at: a bitmap, whose ink this can't read, and a gradient
  // ground, whose luminance varies across the icon. Both matter for Phase 15 —
  // none of the badge artwork is in this repository yet, so what gets measured
  // today is the nav and the sparklines (ROADMAP → The artwork).
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

  let iconsMeasured = 0;
  const icons = visible.filter(
    (el) =>
      el.tagName === 'svg'
      || el.tagName === 'IMG'
      || /(^|[\s-])icon([\s-]|$)/.test(el.getAttribute('class') || ''),
  );
  for (const el of icons) {
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
    const style = styleOf(el);
    const stroke = parse(style.stroke);
    const fill = parse(style.fill);
    const ink = (stroke && stroke.alpha > 0.05 && style.stroke !== 'none' ? stroke : null)
      ?? (fill && fill.alpha > 0.05 && style.fill !== 'none' ? fill : null)
      ?? parse(style.color);
    if (!ink) continue;
    iconsMeasured += 1;
    const contrast = ratio(ink.rgb, bg.rgb);
    if (contrast < 3) {
      add('icon-contrast', el, `${contrast.toFixed(2)}:1 against its ground, needs 3:1`);
    }
  }

  return {
    findings,
    height: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
    iconsMeasured,
  };
}
