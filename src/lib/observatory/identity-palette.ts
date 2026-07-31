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

const PERMITTED_WIDTH = PERMITTED_BANDS.reduce(
  (total, [low, high]) => total + (high - low),
  0,
);

/** FNV-1a. Stable across runs and processes, unlike a hash of object identity. */
function hashTicker(ticker: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < ticker.length; index += 1) {
    hash ^= ticker.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

/** Maps a hash onto the permitted arcs, skipping the reserved bands entirely. */
function hueForTicker(ticker: string): number {
  let offset = hashTicker(ticker) % PERMITTED_WIDTH;
  for (const [low, high] of PERMITTED_BANDS) {
    const width = high - low;
    if (offset < width) return low + offset;
    offset -= width;
  }
  return PERMITTED_BANDS[0][0];
}

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
  return IDENTITY[key] ?? hsvToHex(hueForTicker(key), 0.62, 0.88);
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
