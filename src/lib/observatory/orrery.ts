import { trailingReturn } from "@/lib/portfolio/trailing-return";

export const ORRERY_FLAT_EPSILON = 0.0005;
export const ORRERY_MIN_RADIUS = 0.9;
export const ORRERY_MAX_RADIUS = 1.95;
export const ORRERY_MIN_ANGULAR_SPEED = 0.012;
export const ORRERY_MAX_ANGULAR_SPEED = 0.055;
export const ORRERY_SUN_CLEARANCE = 3.4;
export const ORRERY_PLANET_CLEARANCE = 0.18;
export const ORRERY_MIN_AXIAL_SPIN = 0.05;
export const ORRERY_MAX_AXIAL_SPIN = 0.55;
export const ORRERY_BELT_HYSTERESIS_BAND = 0.005;
export const ORRERY_PLANET_COUNT = 8;

const MIN_WEIGHT = 0.01;
const MAX_WEIGHT = 0.35;
const MIN_SPEED_RETURN = 0.002;
const MAX_SPEED_RETURN = 0.12;
const MIN_SPIN_RETURN = 0.001;
const MAX_SPIN_RETURN = 0.06;
const SUNSPOT_FULL_INTENSITY_DRAWDOWN = -0.2;

const COMPANY_NAMES: Record<string, string> = {
  ASML: "ASML Holding",
  CBRS: "Cerebras Systems",
  COST: "Costco Wholesale",
  CRM: "Salesforce",
  GOOG: "Alphabet",
  IBM: "IBM",
  INTC: "Intel",
  KYMR: "Kymera Therapeutics",
  MEI: "Methode Electronics",
  MSFT: "Microsoft",
  NBIS: "Nebius Group",
  ORCL: "Oracle",
  SPCX: "SPAC and New Issue ETF",
};

export type OrreryDirection = "clockwise" | "counterclockwise" | "neutral";

export type PublicOrreryHolding = {
  ticker: string;
  companyName: string;
  weight: number;
  contributionPct?: number | null;
  weeklyReturn: number | null;
  portfolioRelativeReturn: number | null;
  volatilityPct: number | null;
  betaVsVoo: number | null;
  dayReturn: number | null;
  nextEarningsDays?: number | null;
  newsCount?: number;
  chart?: readonly { date: string; index: number }[];
};

export type BeltResolution = {
  planetTickers: readonly string[];
  beltTickers: readonly string[];
};

export function companyNameForTicker(ticker: string): string {
  return COMPANY_NAMES[ticker] ?? `${ticker} holding`;
}
export function radiusForWeight(weight: number): number {
  const clamped = Math.min(MAX_WEIGHT, Math.max(MIN_WEIGHT, weight));
  return Math.max(
    ORRERY_MIN_RADIUS,
    Math.sqrt(clamped / MAX_WEIGHT) * ORRERY_MAX_RADIUS,
  );
}

export function directionForWeeklyReturn(
  weeklyReturn: number | null,
): OrreryDirection {
  if (weeklyReturn === null || Math.abs(weeklyReturn) <= ORRERY_FLAT_EPSILON) {
    return "neutral";
  }
  return weeklyReturn > 0 ? "clockwise" : "counterclockwise";
}

export function angularSpeedForWeeklyReturn(weeklyReturn: number | null): number {
  if (directionForWeeklyReturn(weeklyReturn) === "neutral") return 0;
  const magnitude = Math.abs(weeklyReturn ?? 0);
  const clamped = Math.min(MAX_SPEED_RETURN, Math.max(MIN_SPEED_RETURN, magnitude));
  if (clamped === MAX_SPEED_RETURN) return ORRERY_MAX_ANGULAR_SPEED;
  const normalized = (clamped - MIN_SPEED_RETURN) / (MAX_SPEED_RETURN - MIN_SPEED_RETURN);
  return ORRERY_MIN_ANGULAR_SPEED +
    normalized * (ORRERY_MAX_ANGULAR_SPEED - ORRERY_MIN_ANGULAR_SPEED);
}

export function orbitRadiiForPlanetRadii(
  planetRadii: readonly number[],
  firstOrbitRadius = ORRERY_SUN_CLEARANCE,
): number[] {
  if (
    planetRadii.some(
      (radius) => !Number.isFinite(radius) || radius < 0,
    )
  ) {
    throw new RangeError(
      "orbitRadiiForPlanetRadii: every radius must be finite and non-negative",
    );
  }
  const orbitRadii: number[] = [];
  for (const [index, radius] of planetRadii.entries()) {
    if (index === 0) {
      orbitRadii.push(Math.max(ORRERY_SUN_CLEARANCE, firstOrbitRadius));
      continue;
    }
    // The 1.6 multiplier is the complete adjacent-ring clearance contract.
    // Keeping no additive surplus lets the fitted 88% belt spend that space
    // on the planets while their surfaces remain safely separated.
    orbitRadii.push(
      orbitRadii[index - 1] +
        1.6 * (planetRadii[index - 1] + radius),
    );
  }
  return orbitRadii;
}

export function axialSpinForDayReturn(dayReturn: number | null): number {
  if (dayReturn === null) return ORRERY_MIN_AXIAL_SPIN;
  const clamped = Math.min(
    MAX_SPIN_RETURN,
    Math.max(MIN_SPIN_RETURN, Math.abs(dayReturn)),
  );
  const normalized =
    (clamped - MIN_SPIN_RETURN) / (MAX_SPIN_RETURN - MIN_SPIN_RETURN);
  return (
    ORRERY_MIN_AXIAL_SPIN +
    normalized * (ORRERY_MAX_AXIAL_SPIN - ORRERY_MIN_AXIAL_SPIN)
  );
}

export function healthScalarForPortfolio(
  dayReturnPct: number,
  weekReturnPct: number,
  annualizedVolatilityPct: number,
): number {
  const safeVol = Math.max(annualizedVolatilityPct, 0.02);
  const dayZ = dayReturnPct / (safeVol / Math.sqrt(252));
  const weekZ = weekReturnPct / (safeVol / Math.sqrt(52));
  return Math.max(-1, Math.min(1, (0.6 * dayZ + 0.4 * weekZ) / 2));
}

export function sunspotIntensityForDrawdown(
  currentDrawdownFromAthPct: number,
): number {
  const clamped = Math.max(
    SUNSPOT_FULL_INTENSITY_DRAWDOWN,
    Math.min(0, currentDrawdownFromAthPct),
  );
  if (clamped === 0) return 0;
  return clamped / SUNSPOT_FULL_INTENSITY_DRAWDOWN;
}

export function resolveBeltMembership(
  currentWeights: readonly { ticker: string; weight: number }[],
  previousMembership: ReadonlySet<string> | null,
  hysteresisBand = ORRERY_BELT_HYSTERESIS_BAND,
): BeltResolution {
  const sorted = [...currentWeights].sort(
    (a, b) => b.weight - a.weight || a.ticker.localeCompare(b.ticker),
  );
  if (!previousMembership || sorted.length <= ORRERY_PLANET_COUNT) {
    return {
      planetTickers: sorted
        .slice(0, ORRERY_PLANET_COUNT)
        .map(({ ticker }) => ticker),
      beltTickers: sorted
        .slice(ORRERY_PLANET_COUNT)
        .map(({ ticker }) => ticker),
    };
  }

  // A prior planet receives exactly the declared hysteresis-band advantage.
  // Current weight still decides every position outside that boundary band.
  const stickyOrder = [...sorted].sort((a, b) => {
    const aScore = a.weight + (previousMembership.has(a.ticker) ? hysteresisBand : 0);
    const bScore = b.weight + (previousMembership.has(b.ticker) ? hysteresisBand : 0);
    return bScore - aScore || b.weight - a.weight || a.ticker.localeCompare(b.ticker);
  });
  const planetSet = new Set(
    stickyOrder
      .slice(0, ORRERY_PLANET_COUNT)
      .map(({ ticker }) => ticker),
  );
  return {
    planetTickers: sorted
      .filter(({ ticker }) => planetSet.has(ticker))
      .map(({ ticker }) => ticker),
    beltTickers: sorted
      .filter(({ ticker }) => !planetSet.has(ticker))
      .map(({ ticker }) => ticker),
  };
}

export function weeklyReturnForPrices(
  prices: readonly { date: string; price: number }[],
): number | null {
  return trailingReturn(
    prices.map(({ date, price }) => ({ date, index: price })),
    7,
  );
}
