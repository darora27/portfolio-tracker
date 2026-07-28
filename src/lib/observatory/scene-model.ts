import {
  ORRERY_MAX_ANGULAR_SPEED,
  ORRERY_PLANET_CLEARANCE,
  ORRERY_SUN_CLEARANCE,
  angularSpeedForWeeklyReturn,
  axialSpinForDayReturn,
  directionForWeeklyReturn,
  orbitRadiusForRank,
  radiusForWeight,
  type OrreryDirection,
  type PublicOrreryHolding,
} from "./orrery";
import { planetIdentityForTicker } from "./planet-identity";

export const OVERVIEW_RING_OPACITY = 0.34;
export const ACTIVE_RING_OPACITY = 0.6;
export const OVERVIEW_BELT_SPAN_PCT = 0.88;
export const OVERVIEW_PLANET_PIXELS_PER_WORLD_UNIT = 37;

const MIN_TRAIL_DEGREES = 18;
const MAX_TRAIL_DEGREES = 30;
const MIN_TRAIL_RETURN = 0.002;
const MAX_TRAIL_RETURN = 0.12;
const SATELLITE_RADIUS = 0.16;
const SUN_BODY_RADIUS = 1.28;

export type SceneHolding = PublicOrreryHolding & {
  newsCount?: number;
  nextEarningsDays?: number | null;
};

export type TradeCometInput = {
  action: "buy" | "sell";
  realizedSign: -1 | 0 | 1;
  ticker: string;
  date: string;
};

export type SceneModel = {
  viewport: { width: number; height: number };
  rings: Array<{
    ticker: string;
    radius: number;
    widthPx: number;
    opacity: number;
    idleOpacity: number;
    activeOpacity: number;
    color: string;
    fog: false;
  }>;
  planets: Array<{
    ticker: string;
    rank: number;
    radius: number;
    orbitRadius: number;
    initialAngle: number;
    direction: OrreryDirection;
    angularSpeed: number;
    axialSpin: number;
    projectedDiameterPx: number;
    brandHex: string;
    encodedWeight: number;
  }>;
  trails: Array<{
    ticker: string;
    direction: OrreryDirection;
    color: string;
    arcRadians: number;
    magnitude: number | null;
    fog: false;
    passes: readonly [
      { id: "glow"; widthPx: 9; opacity: 0.36; additive: true },
      { id: "core"; widthPx: 3; opacity: 0.96; additive: true },
    ];
  }>;
  labels: Array<{
    ticker: string;
    color: string;
    fontSizePx: 12;
    dayChip: string;
    defaultSide: "anti-sun";
    screen: { x: number; y: number; depth: number };
    opacity: number;
    yielded: boolean;
  }>;
  moons: Array<{
    ticker: string;
    storyCount: number;
    bucket: "small" | "medium" | "large";
    radius: number;
    earningsDays: number | null;
    ringVisible: boolean;
  }>;
  satellites: Array<{
    id: "DRIFT" | "HAZARD" | "SUPPLY";
    orbitRadius: number;
    phase: number;
    encodedValue: number | null;
    blinkSeconds: number | null;
  }>;
  belt: {
    radius: number;
    viewportSpanPct: number;
    tickers: string[];
  };
  nebula: {
    color: string;
    alpha: number;
    healthScalar: number;
    driftRadiansPerSecond: number;
  };
  starfields: readonly [
    { id: "near"; depth: number; parallax: number },
    { id: "far"; depth: number; parallax: number },
  ];
  comet: {
    color: string;
    action: "buy" | "sell";
    ticker: string;
    date: string;
  } | null;
  interaction: {
    hoveredTicker: string | null;
    portfolioFocused: boolean;
  };
  sun: ReturnType<typeof sunVisualParameters>;
};

export function trailColorForDirection(direction: OrreryDirection): string {
  if (direction === "clockwise") return "#63ef98";
  if (direction === "counterclockwise") return "#ff665f";
  return "#e3b65c";
}

export function trailArcLengthForWeeklyReturn(
  weeklyReturn: number | null,
): number {
  if (weeklyReturn === null) return (MIN_TRAIL_DEGREES * Math.PI) / 180;
  const magnitude = Math.min(
    MAX_TRAIL_RETURN,
    Math.max(MIN_TRAIL_RETURN, Math.abs(weeklyReturn)),
  );
  const normalized =
    (magnitude - MIN_TRAIL_RETURN) /
    (MAX_TRAIL_RETURN - MIN_TRAIL_RETURN);
  return (
    (MIN_TRAIL_DEGREES +
      normalized * (MAX_TRAIL_DEGREES - MIN_TRAIL_DEGREES)) *
    Math.PI /
    180
  );
}

export function moonRadiusForStoryCount(storyCount: number | null): number {
  const bucket = moonBucketForStoryCount(storyCount);
  if (bucket === null) return 0;
  if (bucket === "small") return 0.11;
  if (bucket === "medium") return 0.15;
  return 0.2;
}

export function moonBucketForStoryCount(
  storyCount: number | null,
): "small" | "medium" | "large" | null {
  if (storyCount === null || storyCount <= 0) return null;
  if (storyCount <= 2) return "small";
  if (storyCount <= 5) return "medium";
  return "large";
}

export function satelliteBlinkSeconds(
  annualizedVolatility: number | null,
): number | null {
  if (annualizedVolatility === null) return null;
  const clamped = Math.min(0.8, Math.max(0.1, annualizedVolatility));
  const normalized = (clamped - 0.1) / 0.7;
  return Number((2.4 - normalized * 1.8).toFixed(3));
}

export function satelliteRingRadius(
  firstPlanetOrbitRadius: number,
  firstPlanetRadius: number,
): number {
  const inner = SUN_BODY_RADIUS + SATELLITE_RADIUS + ORRERY_PLANET_CLEARANCE;
  const outer =
    firstPlanetOrbitRadius -
    firstPlanetRadius -
    SATELLITE_RADIUS -
    ORRERY_PLANET_CLEARANCE;
  if (outer < inner) return inner;
  return (inner + outer) / 2;
}

export function nebulaForHealth(healthScalar: number): {
  color: string;
  alpha: number;
  healthScalar: number;
  driftRadiansPerSecond: number;
} {
  const clamped = Math.min(1, Math.max(-1, healthScalar));
  return {
    color: clamped < 0 ? "#9c3f24" : "#d4a846",
    alpha: Number((0.08 + Math.abs(clamped) * 0.07).toFixed(3)),
    healthScalar: clamped,
    driftRadiansPerSecond: 0.003,
  };
}

export function cometColor(
  action: "buy" | "sell",
  realizedSign: -1 | 0 | 1,
): string {
  if (action === "buy") return "#f4f0df";
  if (realizedSign > 0) return "#63ef98";
  if (realizedSign < 0) return "#ff665f";
  return "#f4f0df";
}

export function resolveOrreryPointerTarget(
  directHit: string | undefined,
  magneticTarget: string | undefined,
): string | undefined {
  if (
    directHit === "portfolio" ||
    directHit === "belt" ||
    directHit?.startsWith("moon:") ||
    directHit?.startsWith("satellite:")
  ) {
    return directHit;
  }
  return magneticTarget ?? directHit;
}

export function formatDayChip(value: number | null): string {
  if (value === null) return "—";
  const glyph = value > 0 ? "▲" : value < 0 ? "▼" : "◆";
  return `${glyph} ${Math.abs(value * 100).toFixed(1)}`;
}

export function resolveLabelCollisions<
  T extends {
    ticker: string;
    screen: { x: number; y: number; depth: number };
    opacity: number;
    yielded: boolean;
  },
>(labels: readonly T[], minDistancePx = 54): T[] {
  const resolved = labels.map((label) => ({
    ...label,
    screen: { ...label.screen },
  }));
  for (let leftIndex = 0; leftIndex < resolved.length; leftIndex += 1) {
    for (
      let rightIndex = leftIndex + 1;
      rightIndex < resolved.length;
      rightIndex += 1
    ) {
      const left = resolved[leftIndex];
      const right = resolved[rightIndex];
      if (
        Math.hypot(
          left.screen.x - right.screen.x,
          left.screen.y - right.screen.y,
        ) >= minDistancePx
      ) {
        continue;
      }
      const yielded =
        left.screen.depth > right.screen.depth ? left : right;
      const magnitude = Math.hypot(yielded.screen.x, yielded.screen.y) || 1;
      yielded.screen.x += (yielded.screen.x / magnitude) * 18;
      yielded.screen.y += (yielded.screen.y / magnitude) * 18;
      yielded.yielded = true;
      if (
        Math.hypot(
          left.screen.x - right.screen.x,
          left.screen.y - right.screen.y,
        ) < minDistancePx
      ) {
        yielded.opacity = 0.5;
      }
    }
  }
  return resolved;
}

export function observedSystemHealth(
  holdings: readonly { weight: number; dayReturn: number | null }[],
): number | null {
  const available = holdings.filter(
    (holding): holding is { weight: number; dayReturn: number } =>
      holding.dayReturn !== null && holding.weight > 0,
  );
  const weight = available.reduce((sum, holding) => sum + holding.weight, 0);
  if (weight === 0) return null;
  return available.reduce(
    (sum, holding) => sum + holding.dayReturn * (holding.weight / weight),
    0,
  );
}

export function sunVisualParameters(
  healthScalar: number,
  sunspotIntensity: number,
) {
  const health = Math.min(1, Math.max(-1, healthScalar));
  const health01 = (health + 1) / 2;
  return {
    healthScalar: health,
    color: health < 0 ? "#d65a24" : "#f5c45d",
    coronaWidth: Number((1.28 + health01 * 0.38).toFixed(4)),
    coronaOpacity: Number((0.018 + health01 * 0.055).toFixed(4)),
    sunspotIntensity: Math.min(1, Math.max(0, sunspotIntensity)),
    pulseDepth: Number((0.002 + health01 * 0.012).toFixed(4)),
    pulseRate: Number((0.42 + health01 * 0.95).toFixed(4)),
  };
}

export function buildOverviewSceneModel({
  holdings,
  beltHoldings = [],
  healthScalar,
  sunspotIntensity,
  hoveredTicker = null,
  portfolioFocused = false,
  viewport = { width: 1440, height: 900 },
  driftExcessReturn = null,
  portfolioVolatility = null,
  nextEarningsDays = null,
  tradeComet = null,
}: {
  holdings: readonly SceneHolding[];
  beltHoldings?: readonly PublicOrreryHolding[];
  healthScalar: number;
  sunspotIntensity: number;
  hoveredTicker?: string | null;
  portfolioFocused?: boolean;
  viewport?: { width: number; height: number };
  driftExcessReturn?: number | null;
  portfolioVolatility?: number | null;
  nextEarningsDays?: number | null;
  tradeComet?: TradeCometInput | null;
}): SceneModel {
  const outerPlanetRadius = orbitRadiusForRank(Math.max(1, holdings.length));
  const beltRadius = outerPlanetRadius + 1.05;
  const labels = holdings.map((holding, index) => {
    const angle = index * 2.399963;
    const orbitRadius = orbitRadiusForRank(index + 1);
    const projectedScale =
      (viewport.width * OVERVIEW_BELT_SPAN_PCT) / (beltRadius * 2);
    return {
      ticker: holding.ticker,
      color: planetIdentityForTicker(holding.ticker).labelHex,
      fontSizePx: 12 as const,
      dayChip: formatDayChip(holding.dayReturn),
      defaultSide: "anti-sun" as const,
      screen: {
        x: Math.cos(angle) * orbitRadius * projectedScale,
        y: Math.sin(angle) * orbitRadius * projectedScale * 0.52 + 28,
        depth: Math.sin(angle),
      },
      opacity: 1,
      yielded: false,
    };
  });
  const firstRadius = radiusForWeight(holdings[0]?.weight ?? 0.01);
  const satelliteOrbit = satelliteRingRadius(
    orbitRadiusForRank(1),
    firstRadius,
  );
  return {
    viewport,
    rings: holdings.map((holding, index) => {
      const direction = directionForWeeklyReturn(holding.weeklyReturn);
      return {
        ticker: holding.ticker,
        radius: orbitRadiusForRank(index + 1),
        widthPx: 1.5,
        opacity:
          hoveredTicker === holding.ticker
            ? ACTIVE_RING_OPACITY
            : OVERVIEW_RING_OPACITY,
        idleOpacity: OVERVIEW_RING_OPACITY,
        activeOpacity: ACTIVE_RING_OPACITY,
        color:
          hoveredTicker === holding.ticker
            ? trailColorForDirection(direction)
            : "#66756f",
        fog: false,
      };
    }),
    planets: holdings.map((holding, index) => {
      const radius = radiusForWeight(holding.weight);
      return {
        ticker: holding.ticker,
        rank: index + 1,
        radius,
        orbitRadius: orbitRadiusForRank(index + 1),
        initialAngle: index * 2.399963,
        direction: directionForWeeklyReturn(holding.weeklyReturn),
        angularSpeed: angularSpeedForWeeklyReturn(holding.weeklyReturn),
        axialSpin: axialSpinForDayReturn(holding.dayReturn),
        projectedDiameterPx:
          radius * 2 * OVERVIEW_PLANET_PIXELS_PER_WORLD_UNIT,
        brandHex: planetIdentityForTicker(holding.ticker).brandHex,
        encodedWeight: holding.weight,
      };
    }),
    trails: holdings.map((holding) => {
      const direction = directionForWeeklyReturn(holding.weeklyReturn);
      return {
        ticker: holding.ticker,
        direction,
        color: trailColorForDirection(direction),
        arcRadians: trailArcLengthForWeeklyReturn(holding.weeklyReturn),
        magnitude:
          holding.weeklyReturn === null ? null : Math.abs(holding.weeklyReturn),
        fog: false,
        passes: [
          { id: "glow", widthPx: 9, opacity: 0.36, additive: true },
          { id: "core", widthPx: 3, opacity: 0.96, additive: true },
        ],
      };
    }),
    labels: resolveLabelCollisions(labels),
    moons: holdings.flatMap((holding) => {
      const storyCount = holding.newsCount ?? 0;
      const radius = moonRadiusForStoryCount(storyCount);
      if (radius === 0) return [];
      const earningsDays = holding.nextEarningsDays ?? null;
      return [
        {
          ticker: holding.ticker,
          storyCount,
          bucket: moonBucketForStoryCount(storyCount)!,
          radius,
          earningsDays,
          ringVisible:
            earningsDays !== null && earningsDays >= 0 && earningsDays <= 7,
        },
      ];
    }),
    satellites: [
      {
        id: "DRIFT",
        orbitRadius: satelliteOrbit,
        phase: 0,
        encodedValue: driftExcessReturn,
        blinkSeconds: null,
      },
      {
        id: "HAZARD",
        orbitRadius: satelliteOrbit,
        phase: (Math.PI * 2) / 3,
        encodedValue: portfolioVolatility,
        blinkSeconds: satelliteBlinkSeconds(portfolioVolatility),
      },
      {
        id: "SUPPLY",
        orbitRadius: satelliteOrbit,
        phase: (Math.PI * 4) / 3,
        encodedValue: nextEarningsDays,
        blinkSeconds: null,
      },
    ],
    belt: {
      radius: beltRadius,
      viewportSpanPct: OVERVIEW_BELT_SPAN_PCT,
      tickers: beltHoldings.map(({ ticker }) => ticker),
    },
    nebula: nebulaForHealth(healthScalar),
    starfields: [
      { id: "near", depth: -4, parallax: 0.012 },
      { id: "far", depth: -11, parallax: 0.004 },
    ],
    comet: tradeComet
      ? {
          color: cometColor(tradeComet.action, tradeComet.realizedSign),
          action: tradeComet.action,
          ticker: tradeComet.ticker,
          date: tradeComet.date,
        }
      : null,
    interaction: {
      hoveredTicker,
      portfolioFocused,
    },
    sun: sunVisualParameters(healthScalar, sunspotIntensity),
  };
}

export function normalizedTrailMagnitude(
  weeklyReturn: number | null,
): number {
  if (weeklyReturn === null) return 0;
  return Math.min(
    1,
    angularSpeedForWeeklyReturn(weeklyReturn) / ORRERY_MAX_ANGULAR_SPEED,
  );
}
