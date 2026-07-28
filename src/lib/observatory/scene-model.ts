import {
  ORRERY_MAX_ANGULAR_SPEED,
  ORRERY_PLANET_CLEARANCE,
  ORRERY_SUN_CLEARANCE,
  angularSpeedForWeeklyReturn,
  axialSpinForDayReturn,
  directionForWeeklyReturn,
  orbitRadiiForPlanetRadii,
  radiusForWeight,
  type OrreryDirection,
  type PublicOrreryHolding,
} from "./orrery";
import { planetIdentityForTicker } from "./planet-identity";

export const OVERVIEW_RING_OPACITY = 0.34;
export const ACTIVE_RING_OPACITY = 0.6;
export const OVERVIEW_BELT_SPAN_PCT = 0.88;

const OVERVIEW_FOV_DEGREES = 42;
const OVERVIEW_CAMERA_HEIGHT_RATIO = 0.82;
const OVERVIEW_CAMERA_DEPTH_RATIO = 1.62;
const OVERVIEW_CAMERA_NEAR = 0.1;
const OVERVIEW_LABEL_WIDTH_PX = 44;
const OVERVIEW_LABEL_HEIGHT_PX = 44;
const OVERVIEW_LABEL_OFFSET_PX = 4;
const OVERVIEW_VIEWPORT_PADDING_PX = 8;
const ORBIT_PROJECTION_SAMPLES = 180;
const MIN_TRAIL_DEGREES = 18;
const MAX_TRAIL_DEGREES = 30;
const MIN_TRAIL_RETURN = 0.002;
const MAX_TRAIL_RETURN = 0.12;
const SATELLITE_RADIUS = 0.16;
const SUN_BODY_RADIUS = 1.28;

type Point3 = { x: number; y: number; z: number };

export type ScreenBounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export type OverviewCameraDescriptor = {
  fovDegrees: number;
  near: number;
  far: number;
  position: Point3;
  target: Point3;
};

type ProjectionContext = {
  camera: OverviewCameraDescriptor;
  focalLengthPx: number;
  forward: Point3;
  right: Point3;
  up: Point3;
};

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
    screen: { x: number; y: number; depth: number };
    bounds: ScreenBounds;
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
    bounds: ScreenBounds;
    opacity: number;
    yielded: boolean;
    clamped: boolean;
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
    bounds: ScreenBounds;
    tickers: string[];
  };
  overviewCamera: OverviewCameraDescriptor;
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

function vectorLength(vector: Point3): number {
  return Math.hypot(vector.x, vector.y, vector.z);
}

function normalizeVector(vector: Point3): Point3 {
  const length = vectorLength(vector) || 1;
  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length,
  };
}

function crossProduct(left: Point3, right: Point3): Point3 {
  return {
    x: left.y * right.z - left.z * right.y,
    y: left.z * right.x - left.x * right.z,
    z: left.x * right.y - left.y * right.x,
  };
}

function dotProduct(left: Point3, right: Point3): number {
  return left.x * right.x + left.y * right.y + left.z * right.z;
}

function projectionContext(
  camera: OverviewCameraDescriptor,
  viewport: { width: number; height: number },
): ProjectionContext {
  const forward = normalizeVector({
    x: camera.target.x - camera.position.x,
    y: camera.target.y - camera.position.y,
    z: camera.target.z - camera.position.z,
  });
  const right = normalizeVector(crossProduct(forward, { x: 0, y: 1, z: 0 }));
  return {
    camera,
    forward,
    right,
    up: normalizeVector(crossProduct(right, forward)),
    focalLengthPx:
      viewport.height /
      (2 * Math.tan((camera.fovDegrees * Math.PI) / 360)),
  };
}

function projectOverviewPoint(
  point: Point3,
  context: ProjectionContext,
  viewport: { width: number; height: number },
): { x: number; y: number; depth: number } {
  const relative = {
    x: point.x - context.camera.position.x,
    y: point.y - context.camera.position.y,
    z: point.z - context.camera.position.z,
  };
  const depth = Math.max(0.001, dotProduct(relative, context.forward));
  return {
    x:
      viewport.width / 2 +
      (dotProduct(relative, context.right) / depth) * context.focalLengthPx,
    y:
      viewport.height / 2 -
      (dotProduct(relative, context.up) / depth) * context.focalLengthPx,
    depth,
  };
}

function boundsFromEdges(
  left: number,
  top: number,
  right: number,
  bottom: number,
): ScreenBounds {
  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}

function mergeBounds(bounds: readonly ScreenBounds[]): ScreenBounds {
  return boundsFromEdges(
    Math.min(...bounds.map(({ left }) => left)),
    Math.min(...bounds.map(({ top }) => top)),
    Math.max(...bounds.map(({ right }) => right)),
    Math.max(...bounds.map(({ bottom }) => bottom)),
  );
}

function projectedOrbitBounds(
  radius: number,
  camera: OverviewCameraDescriptor,
  viewport: { width: number; height: number },
): ScreenBounds {
  const context = projectionContext(camera, viewport);
  const points = Array.from({ length: ORBIT_PROJECTION_SAMPLES }, (_, index) => {
    const angle = (index / ORBIT_PROJECTION_SAMPLES) * Math.PI * 2;
    return projectOverviewPoint(
      {
        x: Math.cos(angle) * radius,
        y: 0,
        z: -Math.sin(angle) * radius,
      },
      context,
      viewport,
    );
  });
  return boundsFromEdges(
    Math.min(...points.map(({ x }) => x)),
    Math.min(...points.map(({ y }) => y)),
    Math.max(...points.map(({ x }) => x)),
    Math.max(...points.map(({ y }) => y)),
  );
}

function projectedAxisSlopes(
  offset: number,
  depth: number,
  radius: number,
): { minimum: number; maximum: number } {
  const denominator = Math.max(0.001, depth * depth - radius * radius);
  const tangent = radius * Math.sqrt(
    Math.max(0, offset * offset + depth * depth - radius * radius),
  );
  return {
    minimum: (offset * depth - tangent) / denominator,
    maximum: (offset * depth + tangent) / denominator,
  };
}

function projectedPlanetBoundsWithContext(
  world: Point3,
  radius: number,
  camera: OverviewCameraDescriptor,
  viewport: { width: number; height: number },
  context = projectionContext(camera, viewport),
): { screen: { x: number; y: number; depth: number }; bounds: ScreenBounds } {
  const screen = projectOverviewPoint(world, context, viewport);
  const relative = {
    x: world.x - camera.position.x,
    y: world.y - camera.position.y,
    z: world.z - camera.position.z,
  };
  const horizontal = projectedAxisSlopes(
    dotProduct(relative, context.right),
    screen.depth,
    radius,
  );
  const vertical = projectedAxisSlopes(
    dotProduct(relative, context.up),
    screen.depth,
    radius,
  );
  return {
    screen,
    bounds: boundsFromEdges(
      viewport.width / 2 + horizontal.minimum * context.focalLengthPx,
      viewport.height / 2 - vertical.maximum * context.focalLengthPx,
      viewport.width / 2 + horizontal.maximum * context.focalLengthPx,
      viewport.height / 2 - vertical.minimum * context.focalLengthPx,
    ),
  };
}

export function projectSphereScreenBounds(
  world: Point3,
  radius: number,
  camera: OverviewCameraDescriptor,
  viewport: { width: number; height: number },
): { screen: { x: number; y: number; depth: number }; bounds: ScreenBounds } {
  return projectedPlanetBoundsWithContext(
    world,
    radius,
    camera,
    viewport,
  );
}

function labelBounds(screen: { x: number; y: number }): ScreenBounds {
  return boundsFromEdges(
    screen.x - OVERVIEW_LABEL_WIDTH_PX / 2,
    screen.y + OVERVIEW_LABEL_OFFSET_PX,
    screen.x + OVERVIEW_LABEL_WIDTH_PX / 2,
    screen.y + OVERVIEW_LABEL_OFFSET_PX + OVERVIEW_LABEL_HEIGHT_PX,
  );
}

function cameraForOverview(
  outerPlanetRadius: number,
  beltRadius: number,
  maxPlanetRadius: number,
  viewport: { width: number; height: number },
): OverviewCameraDescriptor {
  const cameraAt = (
    distanceScale: number,
    targetY: number,
  ): OverviewCameraDescriptor => ({
    fovDegrees: OVERVIEW_FOV_DEGREES,
    near: OVERVIEW_CAMERA_NEAR,
    far: Math.max(70, outerPlanetRadius * distanceScale * 4),
    position: {
      x: 0,
      y: outerPlanetRadius * OVERVIEW_CAMERA_HEIGHT_RATIO * distanceScale,
      z: outerPlanetRadius * OVERVIEW_CAMERA_DEPTH_RATIO * distanceScale,
    },
    target: { x: 0, y: targetY, z: 0 },
  });

  let distanceScale = 1;
  let targetY = 0;
  for (let iteration = 0; iteration < 2; iteration += 1) {
    let nearScale = 0.5;
    let farScale = 4;
    for (let step = 0; step < 20; step += 1) {
      const candidateScale = (nearScale + farScale) / 2;
      const bounds = projectedOrbitBounds(
        beltRadius,
        cameraAt(candidateScale, targetY),
        viewport,
      );
      if (bounds.width / viewport.width > OVERVIEW_BELT_SPAN_PCT) {
        nearScale = candidateScale;
      } else {
        farScale = candidateScale;
      }
    }
    distanceScale = (nearScale + farScale) / 2;

    let lowTarget = -outerPlanetRadius;
    let highTarget = outerPlanetRadius;
    for (let step = 0; step < 20; step += 1) {
      const candidateTarget = (lowTarget + highTarget) / 2;
      const camera = cameraAt(distanceScale, candidateTarget);
      const context = projectionContext(camera, viewport);
      const planetBounds: ScreenBounds[] = [];
      const tagBounds: ScreenBounds[] = [];
      for (let sample = 0; sample < ORBIT_PROJECTION_SAMPLES; sample += 1) {
        const angle = (sample / ORBIT_PROJECTION_SAMPLES) * Math.PI * 2;
        const world = {
          x: Math.cos(angle) * outerPlanetRadius,
          y: 0,
          z: -Math.sin(angle) * outerPlanetRadius,
        };
        planetBounds.push(
          projectedPlanetBoundsWithContext(
            world,
            maxPlanetRadius,
            camera,
            viewport,
            context,
          ).bounds,
        );
        tagBounds.push(
          labelBounds(
            projectOverviewPoint(
              { ...world, y: -maxPlanetRadius * 1.45 },
              context,
              viewport,
            ),
          ),
        );
      }
      const content = mergeBounds([...planetBounds, ...tagBounds]);
      if ((content.top + content.bottom) / 2 < viewport.height / 2) {
        lowTarget = candidateTarget;
      } else {
        highTarget = candidateTarget;
      }
    }
    targetY = (lowTarget + highTarget) / 2;
  }

  return cameraAt(distanceScale, targetY);
}

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

export function layoutOverviewLabels<
  T extends {
    ticker: string;
    screen: { x: number; y: number; depth: number };
    opacity: number;
    yielded: boolean;
  },
>(
  labels: readonly T[],
  viewport: { width: number; height: number },
): Array<T & { bounds: ScreenBounds; clamped: boolean }> {
  return resolveLabelCollisions(labels).map((label) => {
    const minimumX =
      OVERVIEW_VIEWPORT_PADDING_PX + OVERVIEW_LABEL_WIDTH_PX / 2;
    const maximumX =
      viewport.width -
      OVERVIEW_VIEWPORT_PADDING_PX -
      OVERVIEW_LABEL_WIDTH_PX / 2;
    const minimumY =
      OVERVIEW_VIEWPORT_PADDING_PX - OVERVIEW_LABEL_OFFSET_PX;
    const maximumY =
      viewport.height -
      OVERVIEW_VIEWPORT_PADDING_PX -
      OVERVIEW_LABEL_OFFSET_PX -
      OVERVIEW_LABEL_HEIGHT_PX;
    const screen = {
      ...label.screen,
      x: Math.min(maximumX, Math.max(minimumX, label.screen.x)),
      y: Math.min(maximumY, Math.max(minimumY, label.screen.y)),
    };
    return {
      ...label,
      screen,
      bounds: labelBounds(screen),
      clamped: screen.x !== label.screen.x || screen.y !== label.screen.y,
    };
  });
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
  orbitalPhaseRadians = 0,
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
  orbitalPhaseRadians?: number;
}): SceneModel {
  const planetDescriptorsWithoutOrbits = holdings.map((holding, index) => {
    const radius = radiusForWeight(holding.weight);
    return {
      ticker: holding.ticker,
      rank: index + 1,
      radius,
      initialAngle: index * 2.399963,
      direction: directionForWeeklyReturn(holding.weeklyReturn),
      angularSpeed: angularSpeedForWeeklyReturn(holding.weeklyReturn),
      axialSpin: axialSpinForDayReturn(holding.dayReturn),
      brandHex: planetIdentityForTicker(holding.ticker).brandHex,
      encodedWeight: holding.weight,
    };
  });
  const planetRadii = planetDescriptorsWithoutOrbits.map(({ radius }) => radius);
  const firstPlanetRadius = planetRadii[0] ?? 0;
  const firstPlanetOrbitRadius =
    SUN_BODY_RADIUS +
    SATELLITE_RADIUS * 2 +
    ORRERY_PLANET_CLEARANCE * 2 +
    firstPlanetRadius;
  const orbitRadii = orbitRadiiForPlanetRadii(
    planetRadii,
    firstPlanetOrbitRadius,
  );
  const planetDescriptors = planetDescriptorsWithoutOrbits.map(
    (planet, index) => ({
      ...planet,
      orbitRadius: orbitRadii[index],
    }),
  );
  const outerPlanetRadius = orbitRadii.at(-1) ?? ORRERY_SUN_CLEARANCE;
  const beltRadius = outerPlanetRadius + 1.05;
  const overviewCamera = cameraForOverview(
    outerPlanetRadius,
    beltRadius,
    Math.max(...planetDescriptors.map(({ radius }) => radius), 0),
    viewport,
  );
  const overviewProjection = projectionContext(overviewCamera, viewport);
  const planets = planetDescriptors.map((planet) => {
    const angle = planet.initialAngle + orbitalPhaseRadians;
    const projected = projectedPlanetBoundsWithContext(
      {
        x: Math.cos(angle) * planet.orbitRadius,
        y: 0,
        z: -Math.sin(angle) * planet.orbitRadius,
      },
      planet.radius,
      overviewCamera,
      viewport,
      overviewProjection,
    );
    return {
      ...planet,
      ...projected,
      projectedDiameterPx: projected.bounds.width,
    };
  });
  const labels = layoutOverviewLabels(
    holdings.map((holding, index) => {
      const angle = planets[index].initialAngle + orbitalPhaseRadians;
      const orbitRadius = planets[index].orbitRadius;
      const screen = projectOverviewPoint(
        {
          x: Math.cos(angle) * orbitRadius,
          y: -planets[index].radius * 1.45,
          z: -Math.sin(angle) * orbitRadius,
        },
        overviewProjection,
        viewport,
      );
      return {
        ticker: holding.ticker,
        color: planetIdentityForTicker(holding.ticker).labelHex,
        fontSizePx: 12 as const,
        dayChip: formatDayChip(holding.dayReturn),
        defaultSide: "anti-sun" as const,
        screen,
        opacity: 1,
        yielded: false,
      };
    }),
    viewport,
  );
  const satelliteOrbit = satelliteRingRadius(
    orbitRadii[0] ?? ORRERY_SUN_CLEARANCE,
    firstPlanetRadius,
  );
  const beltBounds = projectedOrbitBounds(
    beltRadius,
    overviewCamera,
    viewport,
  );
  return {
    viewport,
    overviewCamera,
    rings: holdings.map((holding, index) => {
      const direction = directionForWeeklyReturn(holding.weeklyReturn);
      return {
        ticker: holding.ticker,
        radius: planets[index].orbitRadius,
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
    planets,
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
    labels,
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
      viewportSpanPct: beltBounds.width / viewport.width,
      bounds: beltBounds,
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
