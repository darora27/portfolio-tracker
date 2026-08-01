const LUT_SIZE = 64;
const MIN_RETURN_MAGNITUDE = 0.002;
const MAX_RETURN_MAGNITUDE = 0.12;

type Hex = `#${string}`;
type AmbientToken = {
  color: Hex;
  alpha: number;
  alphaCap: number;
  hueExempt: true;
};

export const UNIVERSE_PALETTE = {
  signal: {
    /* R7 Jul 31: "both red and green need to be brighter. the red needs to
     * look more red too." Chroma 0.55 -> 0.83 and 0.63 -> 0.88; both stay
     * inside their reserved bands (147.5 and 3.8 degrees) and both still
     * clear 5:1 against the backdrop. Measured, not eyeballed. */
    gain: "#2BFF8C",
    loss: "#FF2D1F",
    flat: "#e3b65c",
    comet: "#f4f0df",
    sunUp: "#f5c45d",
    sunDown: "#d65a24",
    whiteHot: "#fff7e6",
  },
  cabinet: {
    cream: "#fff0cf",
    teletype: "#f6d493",
    amberChrome: "#ffd68c",
    burntOrange: "#d96f23",
    umber: "#21120d",
    bayGlass: "#010806",
    void: "#020706",
    ringSlate: "#66756f",
    question: "#c9b48e",
    windowWord: "#d5ba8c",
    chartBaseline: "#f4dba8",
    caseShell: "#2b2723",
    dishGlass: "#0a0c10",
  },
  glass: {
    cyan: "#4fd6e8",
    blue: "#5f8dff",
    violet: "#8f6bff",
    magenta: "#d95ce0",
    pink: "#ff70c8",
    gold: "#efbb62",
    scopeHero: "#e6a14d",
    benchmarkVoo: "#5fa8c9",
    benchmarkVti: "#46799c",
    benchmarkXlk: "#7b6bc9",
    wispFirstLight: "#b3479e",
    wispClearNight: "#3d5aa8",
  },
  matter: {
    asml: "#5c80ad",
    goog: "#bcc7ba",
    msft: "#5f7271",
    ibm: "#16295d",
    cost: "#645d53",
    intc: "#42474f",
    nbis: "#763a74",
    cbrs: "#655331",
    ibmRelight: "#8fa3d6",
    intcRelight: "#5a6270",
    costRelight: "#8a8274",
    nbisRelight: "#a05a9e",
    cbrsRelight: "#9c7d3f",
  },
  paper: {
    sheet: "#f0e2c4",
    ink: "#2b1a10",
  },
  ambient: {
    nebulaNegative: {
      color: "#5a3f38",
      alpha: 0.15,
      alphaCap: 0.18,
      hueExempt: true,
    },
    nebulaPositive: {
      color: "#d4a846",
      alpha: 0.15,
      alphaCap: 0.18,
      hueExempt: true,
    },
    aurora: {
      color: "#a23d9c",
      alpha: 0.4,
      alphaCap: 0.4,
      hueExempt: true,
    },
    wispPositive: {
      color: "#b3479e",
      alpha: 0.1,
      alphaCap: 0.18,
      hueExempt: true,
    },
    wispNegative: {
      color: "#3d5aa8",
      alpha: 0.1,
      alphaCap: 0.18,
      hueExempt: true,
    },
  } satisfies Record<string, AmbientToken>,
} as const;

type Rgb = readonly [number, number, number];

function hexToRgb(hex: string): Rgb {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function rgbToHex([red, green, blue]: Rgb): Hex {
  return `#${[red, green, blue]
    .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
    .join("")}` as Hex;
}

function interpolate(left: Rgb, right: Rgb, amount: number): Rgb {
  return [
    left[0] + (right[0] - left[0]) * amount,
    left[1] + (right[1] - left[1]) * amount,
    left[2] + (right[2] - left[2]) * amount,
  ];
}

function makeLut(stops: readonly Hex[]): readonly Hex[] {
  const colors = stops.map(hexToRgb);
  return Array.from({ length: LUT_SIZE }, (_, index) => {
    const position = index / (LUT_SIZE - 1);
    const scaled = position * (colors.length - 1);
    const segment = Math.min(colors.length - 2, Math.floor(scaled));
    return rgbToHex(
      interpolate(colors[segment], colors[segment + 1], scaled - segment),
    );
  });
}

function sampler(
  stops: readonly Hex[],
  exactMidpoint?: Hex,
): { lut: readonly Hex[]; sample: (amount: number) => Hex } {
  const lut = makeLut(stops);
  return {
    lut,
    sample(amount) {
      const clamped = Math.min(1, Math.max(0, amount));
      if (exactMidpoint && clamped === 0.5) return exactMidpoint;
      return lut[Math.round(clamped * (LUT_SIZE - 1))];
    },
  };
}

const aurora = sampler([
  "#131c3f",
  "#33307e",
  "#63359c",
  "#a23d9c",
  "#e0559c",
  "#f7a0c0",
  "#ffe4d6",
]);
const ember = sampler([
  "#1c0f06",
  "#5e2d0e",
  "#9c4f16",
  "#d97a2b",
  "#ffb347",
  "#ffe4ad",
]);
const ice = sampler(["#061018", "#123a54", "#1e6b8f", "#3fa8c4", "#a8e4ef"]);
const gain = sampler(
  ["#1f7a46", UNIVERSE_PALETTE.signal.gain, "#a9ffcf"],
  UNIVERSE_PALETTE.signal.gain,
);
const loss = sampler(
  ["#ff9d97", UNIVERSE_PALETTE.signal.loss, "#b3241d"],
  UNIVERSE_PALETTE.signal.loss,
);

export const UNIVERSE_RAMP_LUTS = {
  aurora: aurora.lut,
  ember: ember.lut,
  ice: ice.lut,
  gain: gain.lut,
  loss: loss.lut,
} as const;

export const rampAurora = aurora.sample;
export const rampEmber = ember.sample;
export const rampIce = ice.sample;
export const rampGain = gain.sample;
export const rampLoss = loss.sample;

export function normalizedReturnMagnitude(returnValue: number): number {
  const magnitude = Math.min(
    MAX_RETURN_MAGNITUDE,
    Math.max(MIN_RETURN_MAGNITUDE, Math.abs(returnValue)),
  );
  return (
    (magnitude - MIN_RETURN_MAGNITUDE) /
    (MAX_RETURN_MAGNITUDE - MIN_RETURN_MAGNITUDE)
  );
}

export function rampForReturn(returnValue: number | null): Hex {
  if (
    returnValue === null ||
    Math.abs(returnValue) <= MIN_RETURN_MAGNITUDE
  ) {
    return UNIVERSE_PALETTE.signal.flat;
  }
  const amount = normalizedReturnMagnitude(returnValue);
  return returnValue > 0 ? rampGain(amount) : rampLoss(amount);
}

function linearChannel(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045
    ? value / 12.92
    : ((value + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const [red, green, blue] = hexToRgb(hex);
  return (
    0.2126 * linearChannel(red) +
    0.7152 * linearChannel(green) +
    0.0722 * linearChannel(blue)
  );
}

export function contrastRatio(left: string, right: string): number {
  const [lighter, darker] = [
    relativeLuminance(left),
    relativeLuminance(right),
  ].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

export const UNIVERSE_CONTRASTS = [
  {
    id: "cream-on-void",
    foreground: UNIVERSE_PALETTE.cabinet.cream,
    background: UNIVERSE_PALETTE.cabinet.void,
    minimum: 4.5,
  },
  {
    id: "teletype-on-umber",
    foreground: UNIVERSE_PALETTE.cabinet.teletype,
    background: UNIVERSE_PALETTE.cabinet.umber,
    minimum: 4.5,
  },
  {
    id: "paper-ink",
    foreground: UNIVERSE_PALETTE.paper.ink,
    background: UNIVERSE_PALETTE.paper.sheet,
    minimum: 4.5,
  },
  {
    id: "question-on-bay-glass",
    foreground: UNIVERSE_PALETTE.cabinet.question,
    background: UNIVERSE_PALETTE.cabinet.bayGlass,
    minimum: 4.5,
  },
  {
    id: "chakra-nameplate-on-bay-glass",
    foreground: UNIVERSE_PALETTE.cabinet.cream,
    background: UNIVERSE_PALETTE.cabinet.bayGlass,
    minimum: 4.5,
  },
  {
    id: "large-readout-on-umber",
    foreground: UNIVERSE_PALETTE.cabinet.amberChrome,
    background: UNIVERSE_PALETTE.cabinet.umber,
    minimum: 3,
  },
  {
    id: "window-word-on-glass",
    foreground: UNIVERSE_PALETTE.cabinet.windowWord,
    background: UNIVERSE_PALETTE.cabinet.bayGlass,
    minimum: 10,
  },
  {
    id: "chart-baseline-on-glass",
    foreground: UNIVERSE_PALETTE.cabinet.chartBaseline,
    background: UNIVERSE_PALETTE.cabinet.bayGlass,
    minimum: 3,
  },
  {
    id: "body-cream-on-glass",
    foreground: UNIVERSE_PALETTE.cabinet.cream,
    background: UNIVERSE_PALETTE.cabinet.bayGlass,
    minimum: 4.5,
  },
  {
    id: "stencil-on-case-shell",
    foreground: UNIVERSE_PALETTE.paper.sheet,
    background: UNIVERSE_PALETTE.cabinet.caseShell,
    minimum: 4.5,
  },
  {
    id: "amber-on-dish-glass",
    foreground: UNIVERSE_PALETTE.glass.scopeHero,
    background: UNIVERSE_PALETTE.cabinet.dishGlass,
    minimum: 4.5,
  },
] as const;

export function hueChroma(hex: string): { hue: number | null; chroma: number } {
  const [red, green, blue] = hexToRgb(hex).map((channel) => channel / 255);
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const chroma = maximum - minimum;
  if (chroma === 0) return { hue: null, chroma: 0 };
  let sector: number;
  if (maximum === red) sector = ((green - blue) / chroma) % 6;
  else if (maximum === green) sector = (blue - red) / chroma + 2;
  else sector = (red - green) / chroma + 4;
  return {
    hue: ((sector * 60 + 360) % 360),
    chroma,
  };
}

export function isInStolenBand(hue: number): boolean {
  return (hue >= 125 && hue <= 165) || hue >= 345 || hue <= 20;
}

export function circularHueDistance(left: number, right: number): number {
  const difference = Math.abs(left - right) % 360;
  return Math.min(difference, 360 - difference);
}

export type FirewallToken = {
  tier: string;
  name: string;
  hex: string;
};

export function firewallViolations(
  tokens: readonly FirewallToken[],
): FirewallToken[] {
  return tokens.filter(({ hex }) => {
    const { hue, chroma } = hueChroma(hex);
    return hue !== null && chroma > 0.3 && isInStolenBand(hue);
  });
}

function kebab(value: string): string {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

const cssTokenGroups = {
  signal: UNIVERSE_PALETTE.signal,
  cabinet: UNIVERSE_PALETTE.cabinet,
  glass: UNIVERSE_PALETTE.glass,
  matter: UNIVERSE_PALETTE.matter,
  paper: UNIVERSE_PALETTE.paper,
} as const;

export const UNIVERSE_CSS_VARIABLES = Object.fromEntries(
  Object.entries(cssTokenGroups).flatMap(([tier, tokens]) =>
    Object.entries(tokens).map(([name]) => [
      `${tier}.${name}`,
      `--universe-${tier}-${kebab(name)}`,
    ]),
  ),
) as Record<string, `--universe-${string}`>;

export const UNIVERSE_CSS_PROPERTIES = Object.fromEntries(
  Object.entries(cssTokenGroups).flatMap(([tier, tokens]) =>
    Object.entries(tokens).map(([name, value]) => [
      UNIVERSE_CSS_VARIABLES[`${tier}.${name}`],
      value,
    ]),
  ),
) as Record<`--universe-${string}`, string>;

export const UNIVERSE_CSS_BLOCK = `:root{${Object.entries(
  UNIVERSE_CSS_PROPERTIES,
)
  .map(([name, value]) => `${name}:${value}`)
  .join(";")}}`;
