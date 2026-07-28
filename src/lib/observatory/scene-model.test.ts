import { describe, expect, it } from "vitest";
import { PerspectiveCamera, Vector3 } from "three";
import {
  ORRERY_PLANET_CLEARANCE,
  radiusForWeight,
  type PublicOrreryHolding,
} from "./orrery";
import {
  ACTIVE_RING_OPACITY,
  OVERVIEW_RING_OPACITY,
  buildOverviewSceneModel,
  cometColor,
  moonRadiusForStoryCount,
  moonBucketForStoryCount,
  nebulaForHealth,
  observedSystemHealth,
  resolveOrreryPointerTarget,
  resolveLabelCollisions,
  satelliteBlinkSeconds,
  satelliteRingRadius,
  sunVisualParameters,
  trailArcLengthForWeeklyReturn,
} from "./scene-model";

const holdings: PublicOrreryHolding[] = [
  {
    ticker: "ASML",
    companyName: "ASML Holding",
    weight: 0.35,
    weeklyReturn: -0.06,
    portfolioRelativeReturn: -0.04,
    volatilityPct: 0.42,
    betaVsVoo: 1.7,
    dayReturn: -0.067,
  },
  {
    ticker: "GOOG",
    companyName: "Alphabet",
    weight: 0.19,
    weeklyReturn: 0.025,
    portfolioRelativeReturn: 0.01,
    volatilityPct: 0.26,
    betaVsVoo: 1.1,
    dayReturn: 0.012,
  },
  {
    ticker: "CBRS",
    companyName: "Cerebras Systems",
    weight: 0.01,
    weeklyReturn: null,
    portfolioRelativeReturn: null,
    volatilityPct: null,
    betaVsVoo: null,
    dayReturn: null,
  },
];

const productionOverviewHoldings: PublicOrreryHolding[] = [
  { ...holdings[0], ticker: "ASML", weight: 0.265 },
  { ...holdings[1], ticker: "GOOG", weight: 0.208 },
  {
    ...holdings[1],
    ticker: "COST",
    companyName: "Costco Wholesale",
    weight: 0.125,
  },
  {
    ...holdings[1],
    ticker: "MSFT",
    companyName: "Microsoft",
    weight: 0.083,
  },
  { ...holdings[1], ticker: "IBM", companyName: "IBM", weight: 0.073 },
  { ...holdings[0], ticker: "INTC", companyName: "Intel", weight: 0.072 },
  { ...holdings[2], ticker: "CBRS", weight: 0.038 },
  {
    ...holdings[2],
    ticker: "NBIS",
    companyName: "Nebius Group",
    weight: 0.035,
  },
];

describe("pure overview scene descriptor", () => {
  it("encodes rings, trails, labels, planets, nebula, and sun without a renderer", () => {
    const model = buildOverviewSceneModel({
      holdings,
      healthScalar: -0.42,
      sunspotIntensity: 0.7,
      hoveredTicker: "GOOG",
      driftExcessReturn: -0.072,
      portfolioVolatility: 0.37,
      nextEarningsDays: 2,
    });
    expect(model.rings[0]).toMatchObject({
      opacity: OVERVIEW_RING_OPACITY,
      fog: false,
    });
    expect(model.rings[1]).toMatchObject({
      opacity: ACTIVE_RING_OPACITY,
      color: "#63ef98",
      fog: false,
    });
    expect(model.trails[0].passes).toEqual([
      { id: "glow", widthPx: 9, opacity: 0.36, additive: true },
      { id: "core", widthPx: 3, opacity: 0.96, additive: true },
    ]);
    expect(model.trails[0].arcRadians).toBe(
      trailArcLengthForWeeklyReturn(-0.06),
    );
    expect(model.labels.every(({ fontSizePx }) => fontSizePx === 12)).toBe(true);
    expect(model.labels[0].dayChip).toBe("▼ 6.7");
    expect(model.nebula).toEqual(nebulaForHealth(-0.42));
    expect(model.nebula.alpha).toBeLessThanOrEqual(0.15);
    expect(model.starfields).toHaveLength(2);
    expect(model.sun).toEqual(sunVisualParameters(-0.42, 0.7));
  });

  it("derives projected diameter from the fitted camera instead of a fixed scale", () => {
    const model = buildOverviewSceneModel({
      holdings: productionOverviewHoldings,
      healthScalar: 0,
      sunspotIntensity: 0,
    });
    expect(model.planets[0].projectedDiameterPx).toBe(
      model.planets[0].bounds.width,
    );
    expect(model.planets[0].projectedDiameterPx).toBeGreaterThanOrEqual(64);
    expect(model.planets[0].projectedDiameterPx).toBeLessThanOrEqual(72);
    expect(
      Math.min(...model.planets.map(({ projectedDiameterPx }) => projectedDiameterPx)),
    ).toBeGreaterThanOrEqual(22);
    expect(model.belt.viewportSpanPct).toBeGreaterThanOrEqual(0.85);
    expect(model.belt.viewportSpanPct).toBeLessThanOrEqual(0.92);
  });

  it("keeps the production-weight composition in spec across a full 1440x900 orbital phase sweep", () => {
    const viewport = { width: 1440, height: 900 };
    const seenPlanets = new Set<string>();
    const seenLabels = new Set<string>();
    let heaviestDiameterMin = Number.POSITIVE_INFINITY;
    let heaviestDiameterMax = Number.NEGATIVE_INFINITY;
    let smallestDiameter = Number.POSITIVE_INFINITY;
    let minimumSpacingRatio = Number.POSITIVE_INFINITY;

    for (let phaseIndex = 0; phaseIndex < 360; phaseIndex += 1) {
      const model = buildOverviewSceneModel({
        holdings: productionOverviewHoldings,
        healthScalar: 0,
        sunspotIntensity: 0,
        viewport,
        orbitalPhaseRadians: (phaseIndex / 360) * Math.PI * 2,
      });

      expect(model.belt.viewportSpanPct).toBeGreaterThanOrEqual(0.85);
      expect(model.belt.viewportSpanPct).toBeLessThanOrEqual(0.92);
      expect(model.belt.viewportSpanPct).toBeCloseTo(
        model.belt.bounds.width / viewport.width,
        12,
      );
      heaviestDiameterMin = Math.min(
        heaviestDiameterMin,
        model.planets[0].projectedDiameterPx,
      );
      heaviestDiameterMax = Math.max(
        heaviestDiameterMax,
        model.planets[0].projectedDiameterPx,
      );
      for (let index = 0; index < model.planets.length - 1; index += 1) {
        const current = model.planets[index];
        const next = model.planets[index + 1];
        minimumSpacingRatio = Math.min(
          minimumSpacingRatio,
          (next.orbitRadius - current.orbitRadius) /
            (current.radius + next.radius),
        );
      }

      for (const planet of model.planets) {
        seenPlanets.add(planet.ticker);
        smallestDiameter = Math.min(
          smallestDiameter,
          planet.projectedDiameterPx,
        );
        expect(
          planet.projectedDiameterPx,
          `${planet.ticker} projected diameter`,
        ).toBe(planet.bounds.width);
        expect(
          planet.projectedDiameterPx,
          `${planet.ticker} projected diameter floor`,
        ).toBeGreaterThanOrEqual(22);
        expect(planet.bounds.left, `${planet.ticker} planet left`).toBeGreaterThanOrEqual(0);
        expect(planet.bounds.top, `${planet.ticker} planet top`).toBeGreaterThanOrEqual(0);
        expect(planet.bounds.right, `${planet.ticker} planet right`).toBeLessThanOrEqual(
          viewport.width,
        );
        expect(planet.bounds.bottom, `${planet.ticker} planet bottom`).toBeLessThanOrEqual(
          viewport.height,
        );
      }

      for (const label of model.labels) {
        seenLabels.add(label.ticker);
        expect(label.bounds.left, `${label.ticker} label left`).toBeGreaterThanOrEqual(0);
        expect(label.bounds.top, `${label.ticker} label top`).toBeGreaterThanOrEqual(0);
        expect(label.bounds.right, `${label.ticker} label right`).toBeLessThanOrEqual(
          viewport.width,
        );
        expect(label.bounds.bottom, `${label.ticker} label bottom`).toBeLessThanOrEqual(
          viewport.height,
        );
      }
    }

    expect(heaviestDiameterMin).toBeGreaterThanOrEqual(64);
    expect(heaviestDiameterMax).toBeLessThanOrEqual(72);
    expect(smallestDiameter).toBeGreaterThanOrEqual(22);
    expect(minimumSpacingRatio).toBeCloseTo(1.6, 12);
    expect([...seenPlanets]).toEqual(
      productionOverviewHoldings.map(({ ticker }) => ticker),
    );
    expect([...seenLabels]).toEqual(
      productionOverviewHoldings.map(({ ticker }) => ticker),
    );
  });

  it("matches the renderer camera projection used by the live scene", () => {
    const viewport = { width: 1440, height: 900 };
    const model = buildOverviewSceneModel({
      holdings: productionOverviewHoldings,
      healthScalar: 0,
      sunspotIntensity: 0,
      viewport,
    });
    const descriptor = model.overviewCamera;
    const camera = new PerspectiveCamera(
      descriptor.fovDegrees,
      viewport.width / viewport.height,
      descriptor.near,
      descriptor.far,
    );
    camera.position.set(
      descriptor.position.x,
      descriptor.position.y,
      descriptor.position.z,
    );
    camera.lookAt(
      descriptor.target.x,
      descriptor.target.y,
      descriptor.target.z,
    );
    camera.updateMatrixWorld(true);

    for (const planet of model.planets) {
      const projected = new Vector3(
        Math.cos(planet.initialAngle) * planet.orbitRadius,
        0,
        -Math.sin(planet.initialAngle) * planet.orbitRadius,
      ).project(camera);
      expect(planet.screen.x).toBeCloseTo(
        (projected.x * 0.5 + 0.5) * viewport.width,
        8,
      );
      expect(planet.screen.y).toBeCloseTo(
        (-projected.y * 0.5 + 0.5) * viewport.height,
        8,
      );
    }
  });

  it("keeps adjacent rings at least 1.6 times the sum of planet radii apart", () => {
    const model = buildOverviewSceneModel({
      holdings,
      healthScalar: 0,
      sunspotIntensity: 0,
    });
    for (let index = 0; index < model.planets.length - 1; index += 1) {
      const current = model.planets[index];
      const next = model.planets[index + 1];
      const spacing = next.orbitRadius - current.orbitRadius;
      expect(spacing).toBeCloseTo(
        1.6 * (current.radius + next.radius),
        12,
      );
      expect(spacing).toBeGreaterThanOrEqual(
        1.6 * (current.radius + next.radius),
      );
    }
  });

  it("adds one moon by story-volume bucket and preserves the earnings ring", () => {
    const model = buildOverviewSceneModel({
      holdings: [
        { ...holdings[0], newsCount: 1, nextEarningsDays: 2 },
        { ...holdings[1], newsCount: 4, nextEarningsDays: null },
        { ...holdings[2], newsCount: 0 },
      ],
      healthScalar: 0,
      sunspotIntensity: 0,
    });
    expect(model.moons).toEqual([
      {
        ticker: "ASML",
        storyCount: 1,
        bucket: "small",
        radius: moonRadiusForStoryCount(1),
        earningsDays: 2,
        ringVisible: true,
      },
      {
        ticker: "GOOG",
        storyCount: 4,
        bucket: "medium",
        radius: moonRadiusForStoryCount(4),
        earningsDays: null,
        ringVisible: false,
      },
    ]);
    expect(moonRadiusForStoryCount(8)).toBeGreaterThan(
      moonRadiusForStoryCount(4),
    );
    expect(moonRadiusForStoryCount(null)).toBe(0);
    expect(moonBucketForStoryCount(0)).toBeNull();
    expect(moonBucketForStoryCount(2)).toBe("small");
    expect(moonBucketForStoryCount(3)).toBe("medium");
    expect(moonBucketForStoryCount(6)).toBe("large");
  });

  it("computes the satellite orbit from geometry across a rebalance", () => {
    const arrangements = [
      [0.35, 0.19, 0.01],
      [0.08, 0.34, 0.2],
    ];
    for (const weights of arrangements) {
      const reordered = holdings.map((holding, index) => ({
        ...holding,
        weight: weights[index],
      }));
      const model = buildOverviewSceneModel({
        holdings: reordered,
        healthScalar: 0,
        sunspotIntensity: 0,
      });
      const satelliteRadius = model.satellites[0].orbitRadius;
      expect(satelliteRadius).toBe(
        satelliteRingRadius(
          model.planets[0].orbitRadius,
          radiusForWeight(reordered[0].weight),
        ),
      );
      expect(
        satelliteRadius + 0.16 + ORRERY_PLANET_CLEARANCE,
      ).toBeLessThanOrEqual(
        model.planets[0].orbitRadius - radiusForWeight(reordered[0].weight),
      );
    }
  });

  it("clamps every new scalar encoding and handles unavailable values", () => {
    expect(trailArcLengthForWeeklyReturn(0.00001)).toBe(
      trailArcLengthForWeeklyReturn(0.002),
    );
    expect(trailArcLengthForWeeklyReturn(1)).toBe(
      trailArcLengthForWeeklyReturn(0.12),
    );
    expect(trailArcLengthForWeeklyReturn(null)).toBe(
      trailArcLengthForWeeklyReturn(0.002),
    );
    expect(satelliteBlinkSeconds(0.01)).toBe(2.4);
    expect(satelliteBlinkSeconds(2)).toBe(0.6);
    expect(satelliteBlinkSeconds(null)).toBeNull();
    expect(nebulaForHealth(-2).healthScalar).toBe(-1);
    expect(nebulaForHealth(2).healthScalar).toBe(1);
    expect(nebulaForHealth(null as never).alpha).toBeLessThanOrEqual(0.15);
  });

  it("moves the farther colliding label outward and yields opacity if needed", () => {
    const [near, far] = resolveLabelCollisions(
      [
        {
          ticker: "NEAR",
          screen: { x: 20, y: 20, depth: -0.4 },
          opacity: 1,
          yielded: false,
        },
        {
          ticker: "FAR",
          screen: { x: 22, y: 22, depth: 0.8 },
          opacity: 1,
          yielded: false,
        },
      ],
      54,
    );
    expect(near).toMatchObject({ yielded: false, opacity: 1 });
    expect(far.yielded).toBe(true);
    expect(far.opacity).toBe(0.5);
    expect(far.screen).not.toEqual({ x: 22, y: 22, depth: 0.8 });
  });

  it("derives observed system health without inventing TWR", () => {
    expect(
      observedSystemHealth([
        { weight: 0.75, dayReturn: 0.02 },
        { weight: 0.25, dayReturn: -0.02 },
      ]),
    ).toBeCloseTo(0.01, 12);
    expect(
      observedSystemHealth([{ weight: 1, dayReturn: null }]),
    ).toBeNull();
  });

  it("maps the public trade event to one honest comet colour", () => {
    expect(cometColor("buy", 0)).toBe("#f4f0df");
    expect(cometColor("sell", 1)).toBe("#63ef98");
    expect(cometColor("sell", -1)).toBe("#ff665f");
    expect(
      buildOverviewSceneModel({
        holdings,
        healthScalar: 0,
        sunspotIntensity: 0,
        tradeComet: {
          action: "sell",
          realizedSign: -1,
          ticker: "ASML",
          date: "2026-07-28",
        },
      }).comet,
    ).toEqual({
      action: "sell",
      color: "#ff665f",
      ticker: "ASML",
      date: "2026-07-28",
    });
  });

  it("keeps directly hit instruments activatable inside a planet magnetic field", () => {
    expect(resolveOrreryPointerTarget("moon:ASML", "ASML")).toBe("moon:ASML");
    expect(resolveOrreryPointerTarget("satellite:HAZARD", "ASML")).toBe(
      "satellite:HAZARD",
    );
    expect(resolveOrreryPointerTarget("belt", "NBIS")).toBe("belt");
    expect(resolveOrreryPointerTarget("ASML", "GOOG")).toBe("GOOG");
  });

  it("keeps sun physiology identical across interaction states", () => {
    const idle = buildOverviewSceneModel({
      holdings,
      healthScalar: -0.5,
      sunspotIntensity: 0.7,
    });
    const planetHovered = buildOverviewSceneModel({
      holdings,
      healthScalar: -0.5,
      sunspotIntensity: 0.7,
      hoveredTicker: "ASML",
    });
    const sunFocused = buildOverviewSceneModel({
      holdings,
      healthScalar: -0.5,
      sunspotIntensity: 0.7,
      portfolioFocused: true,
    });

    expect(planetHovered.interaction.hoveredTicker).toBe("ASML");
    expect(sunFocused.interaction.portfolioFocused).toBe(true);
    expect(planetHovered.sun).toEqual(idle.sun);
    expect(sunFocused.sun).toEqual(idle.sun);
  });
});
