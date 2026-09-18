// Colour maths, for the one question a palette can't be answered by eye:
// whether five categorical colours stay five colours for everyone looking at
// them. `tests/palette.test.js` is what runs it; nothing the site ships
// imports it.
//
// Two measurements, because they are not the same check and the palette used
// to pass one while failing the other (docs/DESIGN.md → *Chart series*):
//
//   * contrast, WCAG 2.1, against the paper a chart is drawn on — whether a
//     line can be seen, and whether its own end label is readable;
//   * separation, CIEDE2000, between every pair — whether two lines can be
//     told apart. Measured under normal vision and under all three dichromacies,
//     since a pair that separates for most readers and collapses for one is a
//     pair the palette does not have.
//
// The dichromat simulation is Viénot, Brettel & Mollon (1999): linear RGB into
// LMS, the missing cone's response replaced by what the other two predict, and
// back. It is the model every browser devtool and accessibility checker uses,
// and it is a model — a dichromat's actual experience is not an RGB triple.
// What it is good for is exactly this: ranking pairs, so the worst one is
// found rather than guessed at.

/** '#8c6716' → [0.549, 0.404, 0.086], gamma-encoded, 0–1. */
export function srgb(hex) {
  const h = hex.trim().replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
}

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);
const clamp01 = (c) => Math.min(1, Math.max(0, c));

const hex2 = (c) => Math.round(clamp01(c) * 255).toString(16).padStart(2, '0');
const toHex = ([r, g, b]) => `#${hex2(r)}${hex2(g)}${hex2(b)}`;

export const linearRgb = (hex) => srgb(hex).map(toLinear);

/** WCAG relative luminance. */
export function luminance(hex) {
  const [r, g, b] = linearRgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two colours, 1–21. Order doesn't matter. */
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// sRGB → XYZ under D65, the matrix that pairs with the sRGB primaries above.
function xyz(hex) {
  const [r, g, b] = linearRgb(hex);
  return [
    0.4124564 * r + 0.3575761 * g + 0.1804375 * b,
    0.2126729 * r + 0.7151522 * g + 0.0721750 * b,
    0.0193339 * r + 0.1191920 * g + 0.9503041 * b,
  ];
}

const D65 = [0.9504559, 1, 1.0890578];

/** CIE L*a*b* under D65. */
export function lab(hex) {
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : (841 / 108) * t + 4 / 29);
  const [fx, fy, fz] = xyz(hex).map((v, i) => f(v / D65[i]));
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

/** C* — how far off the grey axis a colour sits. Below about 15 it stops
 *  reading as a hue and starts reading as a grey of some lightness. */
export function chroma(hex) {
  const { a, b } = lab(hex);
  return Math.hypot(a, b);
}

/**
 * CIEDE2000 over two L*a*b* triples. Split out from `deltaE` below so the
 * published reference pairs — which are given as Lab, not as sRGB — can be run
 * against it directly (`tests/palette.test.js`). The formula has two places a
 * naive version goes wrong, and both are in this palette's neighbourhood: the
 * mean hue across the 0°/360° wrap, and the rotation term in the blues.
 */
export function deltaELab({ L: L1, a: a1, b: b1 }, { L: L2, a: a2, b: b2 }) {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cbar = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cbar ** 7 / (Cbar ** 7 + 25 ** 7)));
  const ap1 = (1 + G) * a1;
  const ap2 = (1 + G) * a2;
  const Cp1 = Math.hypot(ap1, b1);
  const Cp2 = Math.hypot(ap2, b2);
  const hp = (b, ap) => {
    if (b === 0 && ap === 0) return 0;
    const h = Math.atan2(b, ap) * deg;
    return h < 0 ? h + 360 : h;
  };
  const hp1 = hp(b1, ap1);
  const hp2 = hp(b2, ap2);

  const dL = L2 - L1;
  const dC = Cp2 - Cp1;
  let dh = 0;
  if (Cp1 * Cp2 !== 0) {
    dh = hp2 - hp1;
    if (dh > 180) dh -= 360;
    else if (dh < -180) dh += 360;
  }
  const dH = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin((dh / 2) * rad);

  const Lbar = (L1 + L2) / 2;
  const Cpbar = (Cp1 + Cp2) / 2;
  let hbar = hp1 + hp2;
  if (Cp1 * Cp2 !== 0) {
    if (Math.abs(hp1 - hp2) > 180) hbar += hp1 + hp2 < 360 ? 360 : -360;
    hbar /= 2;
  } else {
    hbar = hp1 + hp2;
  }

  const T = 1
    - 0.17 * Math.cos((hbar - 30) * rad)
    + 0.24 * Math.cos(2 * hbar * rad)
    + 0.32 * Math.cos((3 * hbar + 6) * rad)
    - 0.20 * Math.cos((4 * hbar - 63) * rad);
  const dTheta = 30 * Math.exp(-(((hbar - 275) / 25) ** 2));
  const Rc = 2 * Math.sqrt(Cpbar ** 7 / (Cpbar ** 7 + 25 ** 7));
  const Sl = 1 + (0.015 * (Lbar - 50) ** 2) / Math.sqrt(20 + (Lbar - 50) ** 2);
  const Sc = 1 + 0.045 * Cpbar;
  const Sh = 1 + 0.015 * Cpbar * T;
  const Rt = -Math.sin(2 * dTheta * rad) * Rc;

  return Math.sqrt(
    (dL / Sl) ** 2 + (dC / Sc) ** 2 + (dH / Sh) ** 2 + Rt * (dC / Sc) * (dH / Sh),
  );
}

/**
 * The perceptual distance between two colours — the one difference formula
 * that behaves in the blues and the near-neutrals, which is where a palette of
 * aged pigments actually lives.
 */
export function deltaE(hexA, hexB) {
  return deltaELab(lab(hexA), lab(hexB));
}

// Viénot, Brettel & Mollon (1999). Linear RGB → LMS, and back.
const RGB_TO_LMS = [
  [17.8824, 43.5161, 4.11935],
  [3.45565, 27.1554, 3.86714],
  [0.0299566, 0.184309, 1.46709],
];
const LMS_TO_RGB = [
  [0.080944, -0.130504, 0.116721],
  [-0.010248, 0.054019, -0.113615],
  [-0.000365, -0.004122, 0.693513],
];

// One dichromacy per row: the cone that is missing, reconstructed from the two
// that remain. Tritanopia's is Brettel's, the other two Viénot's.
const CONFUSION = {
  protanopia: [
    [0, 2.02344, -2.52581],
    [0, 1, 0],
    [0, 0, 1],
  ],
  deuteranopia: [
    [1, 0, 0],
    [0.494207, 0, 1.24827],
    [0, 0, 1],
  ],
  tritanopia: [
    [1, 0, 0],
    [0, 1, 0],
    [-0.395913, 0.801109, 0],
  ],
};

const apply = (m, v) => m.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);

/** The forms of vision a categorical palette is measured under. */
export const VISIONS = ['normal', 'protanopia', 'deuteranopia', 'tritanopia'];

/** `hex` as a dichromat sees it, as an sRGB hex. `normal` returns it unchanged. */
export function simulate(hex, vision) {
  if (vision === 'normal') return hex.trim().toLowerCase();
  const matrix = CONFUSION[vision];
  if (!matrix) throw new Error(`unknown vision: ${vision}`);
  const lms = apply(RGB_TO_LMS, linearRgb(hex));
  return toHex(apply(LMS_TO_RGB, apply(matrix, lms)).map((c) => toGamma(clamp01(c))));
}

/**
 * The worst case for a pair: the smallest CIEDE2000 distance between them
 * across every vision in `VISIONS`. A palette is only as separated as this.
 */
export function separation(a, b) {
  let worst = { vision: 'normal', deltaE: Infinity };
  for (const vision of VISIONS) {
    const d = deltaE(simulate(a, vision), simulate(b, vision));
    if (d < worst.deltaE) worst = { vision, deltaE: d };
  }
  return worst;
}

/** Every pair of `colours`, worst separation first. */
export function pairs(colours) {
  const out = [];
  const names = Object.keys(colours);
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      out.push({ a: names[i], b: names[j], ...separation(colours[names[i]], colours[names[j]]) });
    }
  }
  return out.sort((x, y) => x.deltaE - y.deltaE);
}

/** The custom properties declared on :root in a tokens.css source, as a map. */
export function readTokens(css) {
  const out = {};
  for (const [, name, value] of css.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    out[name] = value.trim();
  }
  return out;
}
