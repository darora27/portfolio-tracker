import {
  ORRERY_MAX_ANGULAR_SPEED,
  ORRERY_PLANET_CLEARANCE,
  ORRERY_SUN_CLEARANCE,
  angularSpeedForReturn,
  directionForReturn,
  orbitRadiiForPlanetRadii,
  radiusForWeight,
  type OrreryDirection,
  type PublicOrreryHolding,
} from "./orrery";
import { planetIdentityForTicker } from "./planet-identity";
import {
  UNIVERSE_PALETTE,
  UNIVERSE_RAMP_LUTS,
  rampAurora,
  rampForReturn,
} from "./universe-palette";

export const OVERVIEW_RING_ALPHA = { peak: 0.85, floor: 0.7 } as const;
export const OVERVIEW_RING_OPACITY = 1;
export const ACTIVE_RING_OPACITY =
  0.7 / OVERVIEW_RING_ALPHA.peak;
// FB-01 (§13): owner-fixed pull-back number, one more small step, 0.80 -> 0.75.
export const OVERVIEW_BELT_SPAN_PCT = 0.75;
export const TRAIL_SAMPLE_FRACTION = 0.62;
// FB-26 verification methodology (owner ruling, 2026-07-30, §13): a single
// fixed sample fraction assumes one position along every trail is clear of
// its own planet disc and sits on the ribbon's solid core -- true for most
// holdings but not all (a tight-orbit/large-disc holding can overlap its own
// disc at 0.62; a holding whose ribbon narrows or antialiases near 0.62 can
// land on an edge). The sampler now WALKS this ordered list of fractions
// per holding until it finds one that clears the existing gates -- it moves
// where the sample is taken, never what pixel value the gates require.
export const TRAIL_SAMPLE_SEARCH_STEP = 0.08;
export const TRAIL_SAMPLE_SEARCH_MIN = 0.2;
export const TRAIL_SAMPLE_SEARCH_MAX = 0.92;

export function buildTrailSampleSearchFractions(
  base: number = TRAIL_SAMPLE_FRACTION,
  step: number = TRAIL_SAMPLE_SEARCH_STEP,
  min: number = TRAIL_SAMPLE_SEARCH_MIN,
  max: number = TRAIL_SAMPLE_SEARCH_MAX,
): number[] {
  const seen = new Set<number>();
  const order: number[] = [];
  const add = (candidate: number) => {
    const clamped = Math.min(max, Math.max(min, candidate));
    const rounded = Math.round(clamped * 1000) / 1000;
    if (seen.has(rounded)) return;
    seen.add(rounded);
    order.push(rounded);
  };
  add(base);
  for (let ring = 1; ring <= 6; ring += 1) {
    add(base + step * ring);
    add(base - step * ring);
  }
  return order;
}

export const TRAIL_SAMPLE_SEARCH_FRACTIONS = buildTrailSampleSearchFractions();

const OVERVIEW_FOV_DEGREES = 42;
export const APPROACH_CAMERA_DISTANCE = 6.2;
export const APPROACH_CAMERA_TANGENT_OFFSET = 1.25;
export const APPROACH_CAMERA_HEIGHT = 1.35;
export const APPROACH_LOOK_AT_TANGENT_OFFSET = -1.7;
const OVERVIEW_CAMERA_HEIGHT_RATIO = 0.82;
const OVERVIEW_CAMERA_DEPTH_RATIO = 1.62;
const OVERVIEW_CAMERA_NEAR = 0.1;
const OVERVIEW_LABEL_WIDTH_PX = 44;
const OVERVIEW_LABEL_HEIGHT_PX = 44;
const OVERVIEW_LABEL_OFFSET_PX = 4;
const OVERVIEW_VIEWPORT_PADDING_PX = 8;
const ORBIT_PROJECTION_SAMPLES = 180;
/* FB-03, regressed twice: 36–64° read "too long and cheap"; §11's 26–46°
 * was still too long on his screen. Back to the band he called better —
 * the hue-lightness ramp now carries magnitude, so the arc no longer needs
 * the extra length (round 3's own argument, honestly inverted). */
export const MIN_TRAIL_DEGREES = 18;
export const MAX_TRAIL_DEGREES = 30;
const MIN_TRAIL_RETURN = 0.002;
const MAX_TRAIL_RETURN = 0.12;
const TRAIL_TAPER_FLOOR = 0.85;
const SATELLITE_RADIUS = 0.16;
export const MIN_SUN_RADIUS = 2.8;
export const SUN_TO_PLANET_RATIO = 1.6;
const STAR_COUNT = 1_024;
const BRIGHTEST_STAR_COUNT = 12;

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
    nearAlpha: 0.85;
    farAlpha: 0.7;
  }>;
  planets: Array<{
    ticker: string;
    rank: number;
    radius: number;
    orbitRadius: number;
    initialAngle: number;
    direction: OrreryDirection;
    angularSpeed: number;
    spinPeriodSeconds: number;
    spinRadiansPerSecond: number;
    projectedDiameterPx: number;
    screen: { x: number; y: number; depth: number };
    bounds: ScreenBounds;
    brandHex: string;
    renderExposure: number;
    encodedWeight: number;
  }>;
  trails: Array<{
    ticker: string;
    direction: OrreryDirection;
    color: string;
    arcRadians: number;
    magnitude: number | null;
    sweep: { headRadians: 0; tailRadians: number };
    sampleFraction: typeof TRAIL_SAMPLE_FRACTION;
    sampleSearchFractions: readonly number[];
    head: {
      fraction: 0.12;
      color: string;
      widthPx: 4;
      opacity: 1;
    };
    fog: false;
    passes: readonly [
      { id: "glow"; widthPx: 9; opacity: 0.36; additive: true },
      { id: "core"; widthPx: 3; opacity: 1; additive: false },
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
    bodyVisible: boolean;
  }>;
  moons: Array<{
    ticker: string;
    storyCount: number;
    bucket: "small" | "medium" | "large";
    radius: number;
    earningsDays: number | null;
    ringVisible: boolean;
    orbitPeriodSeconds: number;
    axialSpinRadiansPerSecond: 0;
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
    bodies: Array<{
      ticker: string;
      visualRadius: number;
      weight: number;
    }>;
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
  starPopulation: {
    count: 1024;
    buckets: {
      faint: number;
      medium: number;
      bright: number;
      diffraction: 12;
    };
    clusterSeeds: readonly [
      { x: number; y: number; z: number },
      { x: number; y: number; z: number },
      { x: number; y: number; z: number },
    ];
    auroraDensityMultiplier: 1.8;
  };
  aurora: {
    percentMagnitudes: number[];
    colorSamples: readonly string[];
    opacity: number;
    chord: {
      screenClearanceSunRadii: number;
      widthInOuterRadii: number;
      heightInOuterRadii: number;
      yInOuterRadii: number;
      zInOuterRadii: number;
    };
  };
  weatherWisps: {
    color: string;
    alpha: number;
    sign: "positive" | "negative";
  };
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
  if (direction === "clockwise") return UNIVERSE_PALETTE.signal.gain;
  if (direction === "counterclockwise") return UNIVERSE_PALETTE.signal.loss;
  return UNIVERSE_PALETTE.signal.flat;
}

export function trailArcLengthForReturn(
  returnValue: number | null,
): number {
  if (returnValue === null) return (MIN_TRAIL_DEGREES * Math.PI) / 180;
  const magnitude = Math.min(
    MAX_TRAIL_RETURN,
    Math.max(MIN_TRAIL_RETURN, Math.abs(returnValue)),
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

export function trailSweepAngles(
  direction: OrreryDirection,
  arcRadians: number,
): { headRadians: 0; tailRadians: number } {
  const sign = direction === "counterclockwise" ? 1 : -1;
  return {
    headRadians: 0,
    tailRadians: sign * Math.abs(arcRadians),
  };
}

export function trailRibbonHalfWidths(
  fraction: number,
  maximumWidth: number,
  minimumWidth = 0,
): { inner: number; outer: number } {
  const clampedFraction = Math.min(1, Math.max(0, fraction));
  // Keep enough of the opaque core at the tail for the outermost orbit to
  // cover whole pixels at the retained OVERVIEW sample point. The remaining
  // 15% taper still carries direction without collapsing NBIS into glow-only
  // partial coverage.
  const taper =
    TRAIL_TAPER_FLOOR +
    (1 - TRAIL_TAPER_FLOOR) * (1 - clampedFraction);
  return {
    inner: Math.max(0, minimumWidth) * taper,
    outer: Math.max(0, maximumWidth) * taper,
  };
}

function tickerHash(ticker: string): number {
  return [...ticker.toUpperCase()].reduce(
    (hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0,
    7,
  );
}

export function decorativeSpinPeriodSeconds(ticker: string): number {
  return 80 + (tickerHash(ticker) % 6_001) / 100;
}

export function decorativeSpinRadiansPerSecond(ticker: string): number {
  return (Math.PI * 2) / decorativeSpinPeriodSeconds(ticker);
}

export function moonOrbitPeriodSeconds(ticker: string): number {
  return 38 + (tickerHash(`MOON-${ticker}`) % 401) / 100;
}

export function sunRadiusForPlanetRadii(
  planetRadii: readonly number[],
): number {
  const largest = Math.max(0, ...planetRadii);
  return Math.max(MIN_SUN_RADIUS, SUN_TO_PLANET_RATIO * largest);
}

export function ringVertexAlpha(angleFromPlanetRadians: number): number {
  const normalized = (1 + Math.cos(angleFromPlanetRadians)) / 2;
  return Number((
    OVERVIEW_RING_ALPHA.floor +
    normalized * (OVERVIEW_RING_ALPHA.peak - OVERVIEW_RING_ALPHA.floor)
  ).toFixed(6));
}

export function starMagnitudeBucket(
  index: number,
  count = STAR_COUNT,
): "faint" | "medium" | "bright" | "diffraction" {
  const safeCount = Math.max(1, Math.floor(count));
  const safeIndex = Math.min(safeCount - 1, Math.max(0, Math.floor(index)));
  const diffraction = Math.min(BRIGHTEST_STAR_COUNT, safeCount);
  const bright = Math.round(safeCount * 0.04);
  const medium = Math.round(safeCount * 0.25);
  if (safeIndex < diffraction) return "diffraction";
  if (safeIndex < diffraction + bright) return "bright";
  if (safeIndex < diffraction + bright + medium) return "medium";
  return "faint";
}

export function starPopulationDescriptor(count = STAR_COUNT) {
  const safeCount = Math.max(1, Math.floor(count));
  const buckets = {
    faint: 0,
    medium: 0,
    bright: 0,
    diffraction: 0,
  };
  for (let index = 0; index < safeCount; index += 1) {
    buckets[starMagnitudeBucket(index, safeCount)] += 1;
  }
  return {
    count: safeCount,
    buckets,
    clusterSeeds: [
      { x: -0.48, y: 0.34, z: -0.12 },
      { x: 0.36, y: 0.48, z: -0.32 },
      { x: 0.12, y: -0.28, z: 0.24 },
    ] as const,
    auroraDensityMultiplier: 1.8 as const,
  };
}

export function weeklyReturnsFromIndexSeries(
  values: readonly number[],
  sessions = 5,
): number[] {
  const period = Math.max(1, Math.floor(sessions));
  return values.flatMap((value, index) => {
    const previous = values[index - period];
    if (
      index < period ||
      !Number.isFinite(value) ||
      !Number.isFinite(previous) ||
      previous === 0
    ) {
      return [];
    }
    return [value / previous - 1];
  });
}

export function auroraDescriptor(
  weeklyReturns: readonly number[],
): SceneModel["aurora"] {
  const percentMagnitudes = weeklyReturns
    .filter(Number.isFinite)
    .map((value) => Math.abs(value));
  const wildness = Math.min(
    1,
    Math.max(0, ...percentMagnitudes) / MAX_TRAIL_RETURN,
  );
  return {
    percentMagnitudes,
    colorSamples: UNIVERSE_RAMP_LUTS.aurora.map((_, index) => {
      if (percentMagnitudes.length === 0) return rampAurora(0);
      const sourceIndex = Math.min(
        percentMagnitudes.length - 1,
        Math.floor((index / (UNIVERSE_RAMP_LUTS.aurora.length - 1)) * percentMagnitudes.length),
      );
      return rampAurora(
        Math.min(1, percentMagnitudes[sourceIndex] / MAX_TRAIL_RETURN),
      );
    }),
    // FB-02 (§13), move 2: floor raised 0.02+wildness*0.38 -> 0.14+wildness*0.26
    // so the aurora can never silently vanish again; cap unchanged at 0.40.
    opacity: Number((0.14 + wildness * 0.26).toFixed(4)),
    // FB-22 (§13): root-caused to this mesh -- at the overview camera's
    // elevated, forward-offset angle, the prior yInOuterRadii/zInOuterRadii
    // placed it close enough behind the sun to read as an unexplained
    // yellow/gold semi-circle haze bulging above the sun's own silhouette
    // (confirmed by a live capture and pixel sample directly above the sun
    // center, see docs/phase10-baseline/section-13/sun-region-1440x900.png).
    // Pushed further up and back so it clears the sun's rendered disc in the
    // overview frame instead of visually merging with it.
    chord: {
      screenClearanceSunRadii: 1.2,
      widthInOuterRadii: 2.6,
      heightInOuterRadii: 0.52,
      yInOuterRadii: 1.65,
      zInOuterRadii: -1.35,
    },
  };
}

export function weatherWispsForHealth(
  healthScalar: number,
): SceneModel["weatherWisps"] {
  return healthScalar >= 0
    ? {
        color: UNIVERSE_PALETTE.ambient.wispPositive.color,
        alpha: UNIVERSE_PALETTE.ambient.wispPositive.alpha,
        sign: "positive",
      }
    : {
        color: UNIVERSE_PALETTE.ambient.wispNegative.color,
        alpha: UNIVERSE_PALETTE.ambient.wispNegative.alpha,
        sign: "negative",
      };
}

export function brandEntryPhase(ticker: string): number {
  return (tickerHash(`CAPITAL-${ticker}`) % 3) * (Math.PI * 2 / 3);
}

/**
 * Overview exposures compensate for tiny, dark worlds. At approach scale that
 * same linear gain clips the authored terrain and erases the carved mark.
 * Square-root compression keeps each world's relative correction while
 * restoring headroom for the selected, close-up sphere.
 */
export function approachExposure(renderExposure: number): number {
  return Math.sqrt(Math.max(0, renderExposure));
}

export function radarRingColor(returnValue: number | null): string {
  return rampForReturn(returnValue);
}

export function radarBlipDiameterPx(weight: number): number {
  return Math.max(12, 10 + Math.sqrt(Math.max(0, weight)) * 20);
}

export function beltBodyRadiusForWeight(weight: number): number {
  const clamped = Math.min(0.35, Math.max(0.005, weight));
  return Number((0.18 + Math.sqrt(clamped / 0.35) * 0.16).toFixed(4));
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
  sunRadius = MIN_SUN_RADIUS,
): number {
  const inner = sunRadius + SATELLITE_RADIUS + ORRERY_PLANET_CLEARANCE;
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
    color:
      clamped < 0
        ? UNIVERSE_PALETTE.ambient.nebulaNegative.color
        : UNIVERSE_PALETTE.ambient.nebulaPositive.color,
    alpha: Number((0.08 + Math.abs(clamped) * 0.07).toFixed(3)),
    healthScalar: clamped,
    driftRadiansPerSecond: 0.003,
  };
}

export function cometColor(
  action: "buy" | "sell",
  realizedSign: -1 | 0 | 1,
): string {
  if (action === "buy") return UNIVERSE_PALETTE.signal.comet;
  if (realizedSign > 0) return UNIVERSE_PALETTE.signal.gain;
  if (realizedSign < 0) return UNIVERSE_PALETTE.signal.loss;
  return UNIVERSE_PALETTE.signal.comet;
}

export function resolveOrreryPointerTarget(
  directHit: string | undefined,
  magneticTarget: string | undefined,
): string | undefined {
  if (
    directHit === "portfolio" ||
    directHit === "belt" ||
    directHit?.startsWith("belt:") ||
    directHit?.startsWith("moon:") ||
    directHit?.startsWith("satellite:")
  ) {
    return directHit;
  }
  return magneticTarget ?? directHit;
}

export function resolveOrreryRaycastTarget(
  directHits: readonly string[],
  magneticTarget: string | undefined,
): string | undefined {
  const directHit =
    directHits.find((target) => target !== "portfolio-glow") ??
    (directHits.includes("portfolio-glow") ? "portfolio" : undefined);
  return resolveOrreryPointerTarget(directHit, magneticTarget);
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
    bodyVisible: boolean;
  },
>(
  labels: readonly T[],
  viewport: { width: number; height: number },
): Array<T & { bounds: ScreenBounds; clamped: boolean }> {
  return resolveLabelCollisions(labels).map((label) => {
    // FB-20: a label whose own body has failed the depth test or fallen
    // fully outside the viewport must not be dragged back on-screen by the
    // edge clamp below -- that clamp is only valid for a body that is
    // genuinely visible but whose *offset* label position drifts past the
    // padding. The caller is expected to leave the label hidden when
    // bodyVisible is false; screen/bounds are still computed here (cheap,
    // and needed for type consistency) but must not be trusted for display.
    if (!label.bodyVisible) {
      const bounds = labelBounds(label.screen);
      return {
        ...label,
        bounds,
        clamped: false,
      };
    }
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
    const portfolioObstacle = {
      left: viewport.width / 2 - 84,
      right: viewport.width / 2 + 84,
      top: viewport.height / 2 - 42,
      bottom: viewport.height / 2 + 42,
    };
    let bounds = labelBounds(screen);
    let yieldedToPortfolio = false;
    if (
      bounds.right >= portfolioObstacle.left &&
      bounds.left <= portfolioObstacle.right &&
      bounds.bottom >= portfolioObstacle.top &&
      bounds.top <= portfolioObstacle.bottom
    ) {
      screen.y = Math.min(
        maximumY,
        portfolioObstacle.bottom + OVERVIEW_LABEL_HEIGHT_PX / 2 + 10,
      );
      bounds = labelBounds(screen);
      yieldedToPortfolio = true;
    }
    return {
      ...label,
      screen,
      bounds,
      yielded: label.yielded || yieldedToPortfolio,
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
  radius = MIN_SUN_RADIUS,
) {
  const health = Math.min(1, Math.max(-1, healthScalar));
  const health01 = (health + 1) / 2;
  return {
    healthScalar: health,
    color:
      health < 0
        ? UNIVERSE_PALETTE.signal.sunDown
        : UNIVERSE_PALETTE.signal.sunUp,
    coronaWidth: Number((1.28 + health01 * 0.38).toFixed(4)),
    coronaOpacity: Number((0.018 + health01 * 0.055).toFixed(4)),
    sunspotIntensity: Math.min(1, Math.max(0, sunspotIntensity)),
    pulseDepth: Number((0.002 + health01 * 0.012).toFixed(4)),
    pulseRate: Number((0.42 + health01 * 0.95).toFixed(4)),
    radius,
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
  auroraWeeklySeries = [],
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
  auroraWeeklySeries?: readonly number[];
}): SceneModel {
  const planetDescriptorsWithoutOrbits = holdings.map((holding, index) => {
    const radius = radiusForWeight(holding.weight);
    const spinPeriodSeconds = decorativeSpinPeriodSeconds(holding.ticker);
    return {
      ticker: holding.ticker,
      rank: index + 1,
      radius,
      initialAngle: index * 2.399963,
      direction: directionForReturn(holding.dayReturn),
      angularSpeed: angularSpeedForReturn(holding.dayReturn),
      spinPeriodSeconds,
      spinRadiansPerSecond: decorativeSpinRadiansPerSecond(holding.ticker),
      brandHex: planetIdentityForTicker(holding.ticker).brandHex,
      renderExposure: planetIdentityForTicker(holding.ticker).renderExposure,
      encodedWeight: holding.weight,
    };
  });
  const planetRadii = planetDescriptorsWithoutOrbits.map(({ radius }) => radius);
  const sunRadius = sunRadiusForPlanetRadii(planetRadii);
  const firstPlanetRadius = planetRadii[0] ?? 0;
  const firstPlanetOrbitRadius =
    sunRadius +
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
        // This static overview projection is fit so every planet is on
        // screen by construction (see cameraForOverview/OVERVIEW_BELT_SPAN_PCT)
        // -- it never runs the live approach-camera transitions FB-20's
        // culling fix targets, so every body here is genuinely visible.
        bodyVisible: true,
      };
    }),
    viewport,
  );
  const satelliteOrbit = satelliteRingRadius(
    orbitRadii[0] ?? ORRERY_SUN_CLEARANCE,
    firstPlanetRadius,
    sunRadius,
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
      return {
        ticker: holding.ticker,
        radius: planets[index].orbitRadius,
        widthPx: 4,
        opacity:
          hoveredTicker === holding.ticker
            ? ACTIVE_RING_OPACITY
            : OVERVIEW_RING_OPACITY,
        idleOpacity: OVERVIEW_RING_OPACITY,
        activeOpacity: ACTIVE_RING_OPACITY,
        color:
          UNIVERSE_PALETTE.cabinet.ringSlate,
        fog: false,
        nearAlpha: OVERVIEW_RING_ALPHA.peak,
        farAlpha: OVERVIEW_RING_ALPHA.floor,
      };
    }),
    planets,
    trails: holdings.map((holding) => {
      const direction = directionForReturn(holding.dayReturn);
      const arcRadians = trailArcLengthForReturn(holding.dayReturn);
      return {
        ticker: holding.ticker,
        direction,
        color: rampForReturn(holding.dayReturn),
        arcRadians,
        magnitude:
          holding.dayReturn === null ? null : Math.abs(holding.dayReturn),
        sweep: trailSweepAngles(direction, arcRadians),
        sampleFraction: TRAIL_SAMPLE_FRACTION,
        sampleSearchFractions: TRAIL_SAMPLE_SEARCH_FRACTIONS,
        head: {
          fraction: 0.12,
          color: UNIVERSE_PALETTE.signal.whiteHot,
          widthPx: 4,
          opacity: 1,
        },
        fog: false,
        passes: [
          { id: "glow", widthPx: 9, opacity: 0.36, additive: true },
          { id: "core", widthPx: 3, opacity: 1, additive: false },
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
          orbitPeriodSeconds: moonOrbitPeriodSeconds(holding.ticker),
          axialSpinRadiansPerSecond: 0,
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
      bodies: beltHoldings.map(({ ticker, weight }) => ({
        ticker,
        visualRadius: beltBodyRadiusForWeight(weight),
        weight,
      })),
    },
    nebula: nebulaForHealth(healthScalar),
    starfields: [
      { id: "near", depth: -4, parallax: 0.012 },
      { id: "far", depth: -11, parallax: 0.004 },
    ],
    starPopulation: starPopulationDescriptor() as SceneModel["starPopulation"],
    aurora: auroraDescriptor(auroraWeeklySeries),
    weatherWisps: weatherWispsForHealth(healthScalar),
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
    sun: sunVisualParameters(healthScalar, sunspotIntensity, sunRadius),
  };
}

export function normalizedTrailMagnitude(
  returnValue: number | null,
): number {
  if (returnValue === null) return 0;
  return Math.min(
    1,
    angularSpeedForReturn(returnValue) / ORRERY_MAX_ANGULAR_SPEED,
  );
}
