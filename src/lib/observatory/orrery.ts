import { trailingReturn } from "@/lib/portfolio/trailing-return";

export const ORRERY_FLAT_EPSILON = 0.0005;
// FB-01 (§12a): owner-fixed pull-back numbers, UNIVERSE_AUDIT.md §5.1.
export const ORRERY_MIN_RADIUS = 0.62;
export const ORRERY_MAX_RADIUS = 1.35;

/* Jul 31, second report: "ASML orbit is still way too close to the sun I
 * want it much farther away… You can hardly see it." The innermost orbit
 * starts here, so this number alone decides how much room the first planet
 * gets. 3.4 -> 6.2 nearly doubles the gap between the sun's edge and the
 * first ring; every outer orbit shifts out with it, since they are computed
 * cumulatively from this one. */
export const ORRERY_SUN_CLEARANCE = 6.2;
export const ORRERY_PLANET_CLEARANCE = 0.18;
export const ORRERY_BELT_HYSTERESIS_BAND = 0.005;
export const ORRERY_PLANET_COUNT = 8;

const MIN_WEIGHT = 0.01;
const MAX_WEIGHT = 0.35;
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

export function directionForReturn(
  returnValue: number | null,
): OrreryDirection {
  if (returnValue === null || Math.abs(returnValue) <= ORRERY_FLAT_EPSILON) {
    return "neutral";
  }
  return returnValue > 0 ? "clockwise" : "counterclockwise";
}

/**
 * Orbital drift, in degrees per minute.
 *
 * TWO CORRECTIONS, IN ORDER, BOTH FROM HIM.
 *
 * The original ceiling was 0.055 rad/s — about 189°/min, a full orbit in
 * under two minutes. W4(b) cut that to 0.6–6°/min on Fable's spec, reading
 * his "they can move very very slow" literally.
 *
 * Seeing it, he said: *"Either the planets are moving too slow or they are
 * not moving at all. I want them to have some movement."* Both readings of
 * that sentence point the same way — at 6°/min a planet moves a tenth of a
 * degree per second, which is genuinely indistinguishable from stopped over
 * the seconds someone actually looks at it. "Slow" meant unhurried, not
 * imperceptible.
 *
 * The band is now 6–60°/min. At the top a planet crosses its orbit in six
 * minutes and moves a visible degree per second; at the bottom it still
 * takes an hour. Motion is legible within a few seconds of looking, which is
 * the only test that matters here.
 *
 * A holding moving 1% drifts at 24°/min; the clamps bite below 0.25% and
 * above 2.5%, so a quiet day still moves and a violent one does not spin.
 */
const DEG_PER_MIN_TO_RAD_PER_SEC = Math.PI / 180 / 60;
export const ORRERY_DRIFT_MIN_DEG_PER_MIN = 6;
export const ORRERY_DRIFT_MAX_DEG_PER_MIN = 60;
const DRIFT_DEG_PER_MIN_PER_PERCENT = 24;

export const ORRERY_MIN_ANGULAR_SPEED =
  ORRERY_DRIFT_MIN_DEG_PER_MIN * DEG_PER_MIN_TO_RAD_PER_SEC;
export const ORRERY_MAX_ANGULAR_SPEED =
  ORRERY_DRIFT_MAX_DEG_PER_MIN * DEG_PER_MIN_TO_RAD_PER_SEC;

export function orbitalDriftDegreesPerMinute(returnValue: number | null): number {
  if (directionForReturn(returnValue) === "neutral") return 0;
  const percent = Math.abs(returnValue ?? 0) * 100;
  return Math.min(
    ORRERY_DRIFT_MAX_DEG_PER_MIN,
    Math.max(
      ORRERY_DRIFT_MIN_DEG_PER_MIN,
      DRIFT_DEG_PER_MIN_PER_PERCENT * percent,
    ),
  );
}

export function angularSpeedForReturn(returnValue: number | null): number {
  return orbitalDriftDegreesPerMinute(returnValue) * DEG_PER_MIN_TO_RAD_PER_SEC;
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
    // FB-01 (§13): owner-fixed gap formula, one more small step --
    // 1.75x(ri+ri+1)+0.55 -> 1.82x(ri+ri+1)+0.55. The added flat 0.55 term is
    // what widens the minimum edge-to-edge clearance at closest approach; the
    // multiplier alone (as before) scales with disc size but never
    // guarantees an absolute floor between two small adjacent planets.
    orbitRadii.push(
      orbitRadii[index - 1] +
        1.82 * (planetRadii[index - 1] + radius) +
        0.55,
    );
  }
  return orbitRadii;
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
