import { hueChroma, isInStolenBand } from "./universe-palette";

/**
 * R7-W2 — one stable colour per holding.
 *
 * Every one of the four old screenshots the owner said displayed information
 * better shared a trait the universe build had dropped: each stock, benchmark
 * and donut slice carried its own hue. This module is that channel, restored
 * as tokens so RETURNS lines, MIX bars, orbit strokes and Chart Room series
 * all name the same colour for the same ticker.
 *
 * ## The reservation this must not break
 *
 * Green 125°–165° and red 345°–20° above chroma 0.30 are reserved for
 * gain and loss. That reservation is the reason a red planet means something.
 * Thirteen identity colours competing for the same hues would destroy it, so
 * identity lives entirely outside those bands — in warm golds and ambers,
 * teals and blues, and violets through magentas.
 *
 * The check is not re-derived here. `hueChroma` and `isInStolenBand` in
 * universe-palette.ts already implement the rule for the firewall test, and
 * a second colour model carrying the same thresholds but different arithmetic
 * would let a colour pass one gate and fail the other. There is one
 * definition of the rule and this module is measured against it.
 *
 * Colours were also checked for contrast against the backdrop (every one
 * clears 4:1) and for pairwise hue separation (closest pair 15.9°), because
 * thirteen series are only distinguishable if no two read as the same colour
 * in a 4px line or a 6px dot.
 */

/**
 * Assigned by descending portfolio weight and deliberately interleaved
 * across the three permitted bands, so the largest holdings — the ones
 * sharing a chart most often — are maximally separated from each other
 * rather than adjacent in hue.
 */
export const IDENTITY: Readonly<Record<string, string>> = Object.freeze({
  ASML: "#F7DD31", // gold
  GOOG: "#48A1F0", // azure
  COST: "#CB61F2", // violet
  MSFT: "#D1E649", // citron
  INTC: "#49D6C3", // aqua
  IBM: "#E667A6", // rose-magenta
  CBRS: "#3C69E6", // blue
  NBIS: "#FCA62D", // amber
  CRM: "#8E5CE6", // indigo
  ORCL: "#2CADC7", // teal
  SPCX: "#D667CB", // orchid
  KYMR: "#9AC26D", // olive, chroma held low so it cannot read as gain-green
  MEI: "#6969FA", // periwinkle
});

/**
 * The arcs a generated colour may occupy — the complement of the reserved
 * bands, with margin. A ticker bought tomorrow gets a colour from here.
 */
const PERMITTED_BANDS: readonly (readonly [number, number])[] = [
  [35, 110], // golds through citron
  [170, 240], // aqua through blue
  [260, 330], // indigo through orchid
];

/** FNV-1a. Stable across runs and processes, unlike a hash of object identity. */
function hashTicker(ticker: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < ticker.length; index += 1) {
    hash ^= ticker.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

/**
 * Below this, two hues stop being reliably tellable apart in a 4px line or a
 * 6px dot — the sizes these colours are actually used at.
 */
export const MIN_USEFUL_SEPARATION = 8;

/**
 * The gaps left between the assigned colours, roomiest first.
 *
 * The permitted arcs total 215°, and thirteen holdings at ~16° apart already
 * occupy most of it — so a generated colour cannot simply be hashed onto the
 * arc, or it would land on top of an existing holding. Instead each free gap
 * contributes its midpoint, which is the position furthest from both
 * neighbours, and a new ticker takes one of those.
 *
 * Derived from IDENTITY rather than hardcoded, so changing an assigned colour
 * re-derives the free space instead of silently invalidating it.
 */
const GENERATED_SLOTS: readonly { hue: number; clearance: number }[] = (() => {
  const assigned = Object.values(IDENTITY)
    .map((hex) => hueChroma(hex).hue)
    .filter((hue): hue is number => hue !== null);
  // Clearance is measured against EVERY assigned hue, not only those inside
  // the band being subdivided. IBM's 330.2° sits a fraction outside its band,
  // and a slot that ignored it would report a clearance it does not have.
  const clearanceOf = (hue: number) =>
    assigned.reduce((closest, other) => {
      const raw = Math.abs(hue - other) % 360;
      return Math.min(closest, Math.min(raw, 360 - raw));
    }, 360);

  const slots: { hue: number; clearance: number }[] = [];
  for (const [low, high] of PERMITTED_BANDS) {
    const boundaries = [
      low,
      ...assigned.filter((hue) => hue >= low && hue <= high).sort((a, b) => a - b),
      high,
    ];
    for (let index = 0; index < boundaries.length - 1; index += 1) {
      const hue = (boundaries[index] + boundaries[index + 1]) / 2;
      const clearance = clearanceOf(hue);
      if (clearance < MIN_USEFUL_SEPARATION) continue;
      slots.push({ hue, clearance });
    }
  }
  return slots.sort((a, b) => b.clearance - a.clearance);
})();

/**
 * How many more holdings can be added before hue alone stops distinguishing
 * them. Exposed so the limit is a number the tests can assert on rather than
 * a claim in a comment.
 */
export const GENERATED_SLOT_COUNT = GENERATED_SLOTS.length;

/**
 * Lightness variants, so two tickers landing in the same hue slot are still
 * separable. Hue space is the scarce resource here; lightness is not.
 */
const VALUE_STEPS = [0.94, 0.78, 0.62];

function hsvToHex(hue: number, saturation: number, value: number): string {
  const chroma = value * saturation;
  const sector = (hue % 360) / 60;
  const second = chroma * (1 - Math.abs((sector % 2) - 1));
  const [red, green, blue] =
    sector < 1
      ? [chroma, second, 0]
      : sector < 2
        ? [second, chroma, 0]
        : sector < 3
          ? [0, chroma, second]
          : sector < 4
            ? [0, second, chroma]
            : sector < 5
              ? [second, 0, chroma]
              : [chroma, 0, second];
  const match = value - chroma;
  const channel = (part: number) =>
    Math.round((part + match) * 255)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  return `#${channel(red)}${channel(green)}${channel(blue)}`;
}

/**
 * The colour for a ticker: the assigned one when it is a current holding,
 * otherwise a deterministic generated colour from the permitted arcs. Never
 * returns a reserved hue, so a ticker bought tomorrow cannot borrow the
 * language of gain or loss.
 */
export function identityColor(ticker: string): string {
  const key = ticker.toUpperCase();
  const assigned = IDENTITY[key];
  if (assigned) return assigned;

  const hash = hashTicker(key);
  const slot = GENERATED_SLOTS[hash % GENERATED_SLOTS.length];
  // A second, independent draw from the hash — using the same bits for both
  // hue and lightness would make them correlate and waste the variation.
  const value = VALUE_STEPS[(hash >>> 8) % VALUE_STEPS.length];
  return hsvToHex(slot.hue, 0.66, value);
}

/**
 * The smallest hue gap in a book — the honest measure of whether colour is
 * still doing its job.
 *
 * Returns null for fewer than two tickers. Below MIN_USEFUL_SEPARATION the
 * palette has not broken, but hue has stopped being sufficient on its own and
 * a second channel (dashed strokes, hollow markers) is needed.
 */
export function minimumHueSeparation(
  tickers: readonly string[],
): number | null {
  const hues = tickers
    .map((ticker) => hueChroma(identityColor(ticker)).hue)
    .filter((hue): hue is number => hue !== null);
  if (hues.length < 2) return null;
  let smallest = 360;
  for (let i = 0; i < hues.length; i += 1) {
    for (let j = i + 1; j < hues.length; j += 1) {
      const raw = Math.abs(hues[i] - hues[j]) % 360;
      smallest = Math.min(smallest, Math.min(raw, 360 - raw));
    }
  }
  return smallest;
}

/** Orbit strokes and other structural lines: present, but never louder than the planet. */
const DIM_ALPHA = 0.55;

/**
 * The same identity colour at stroke weight, as `rgb(... / 55%)`. Orbit rings
 * carry identity without competing with the planet sitting on them.
 */
export function dimmed(ticker: string, alpha: number = DIM_ALPHA): string {
  const hex = identityColor(ticker).slice(1);
  const [red, green, blue] = [0, 2, 4].map((index) =>
    parseInt(hex.slice(index, index + 2), 16),
  );
  return `rgb(${red} ${green} ${blue} / ${Math.round(alpha * 100)}%)`;
}

/**
 * Every colour this module can hand out for the current book — what the
 * reservation test iterates. A test that only checked IDENTITY would miss
 * the generated path, which is the one most likely to drift into a reserved
 * hue unnoticed.
 */
export function identityColorsForAudit(
  extraTickers: readonly string[] = [],
): { ticker: string; hex: string; generated: boolean }[] {
  return [
    ...Object.entries(IDENTITY).map(([ticker, hex]) => ({
      ticker,
      hex,
      generated: false,
    })),
    ...extraTickers.map((ticker) => ({
      ticker,
      hex: identityColor(ticker),
      generated: true,
    })),
  ];
}

/** Reservation breaches among the supplied colours. Empty is the only passing result. */
export function reservationBreaches(
  entries: readonly { ticker: string; hex: string }[],
): { ticker: string; hex: string }[] {
  return entries.filter(({ hex }) => {
    const { hue, chroma } = hueChroma(hex);
    return hue !== null && chroma > 0.3 && isInStolenBand(hue);
  });
}
