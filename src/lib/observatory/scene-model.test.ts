import { describe, expect, it } from "vitest";
import { PerspectiveCamera, Vector3 } from "three";
import {
  ORRERY_PLANET_CLEARANCE,
  radiusForWeight,
  type PublicOrreryHolding,
} from "./orrery";
import {
  ACTIVE_RING_OPACITY,
  APPROACH_CAMERA_DISTANCE,
  APPROACH_CAMERA_HEIGHT,
  APPROACH_CAMERA_TANGENT_OFFSET,
  APPROACH_LOOK_AT_TANGENT_OFFSET,
  OVERVIEW_RING_OPACITY,
  beltBodyRadiusForWeight,
  auroraDescriptor,
  approachExposure,
  brandEntryPhase,
  buildOverviewSceneModel,
  cometColor,
  decorativeSpinPeriodSeconds,
  decorativeSpinRadiansPerSecond,
  layoutOverviewLabels,
  moonRadiusForStoryCount,
  moonBucketForStoryCount,
  moonOrbitPeriodSeconds,
  nebulaForHealth,
  observedSystemHealth,
  radarBlipDiameterPx,
  radarRingColor,
  resolveOrreryPointerTarget,
  resolveOrreryRaycastTarget,
  resolveLabelCollisions,
  ringVertexAlpha,
  satelliteBlinkSeconds,
  satelliteRingRadius,
  starMagnitudeBucket,
  starPopulationDescriptor,
  sunRadiusForPlanetRadii,
  sunVisualParameters,
  TRAIL_SAMPLE_FRACTION,
  trailArcLengthForReturn,
  trailRibbonHalfWidths,
  trailSweepAngles,
  weatherWispsForHealth,
  weeklyReturnsFromIndexSeries,
  radarLabelPlacement,
} from "./scene-model";
import { planetIdentityForTicker } from "./planet-identity";
import { UNIVERSE_PALETTE, rampForReturn } from "./universe-palette";

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
      color: UNIVERSE_PALETTE.cabinet.ringSlate,
      fog: false,
      widthPx: 4,
      nearAlpha: 0.85,
      farAlpha: 0.7,
    });
    expect(model.trails[0].passes).toEqual([
      { id: "glow", widthPx: 9, opacity: 0.36, additive: true },
      { id: "core", widthPx: 3, opacity: 1, additive: false },
    ]);
    expect(model.planets[0].renderExposure).toBe(
      planetIdentityForTicker(model.planets[0].ticker).renderExposure,
    );
    expect(model.trails[0].arcRadians).toBe(
      trailArcLengthForReturn(-0.067),
    );
    /* R7 U5: colour is the SIGN, identical for every planet, and magnitude
     * lives in length and speed instead. Previously rampForReturn(-0.067) —
     * a hue that varied with size. He asked for this twice. */
    expect(model.trails[0].color).toBe(UNIVERSE_PALETTE.signal.loss);
    expect(model.trails[0].head).toEqual({
      fraction: 0.12,
      color: UNIVERSE_PALETTE.signal.whiteHot,
      widthPx: 4,
      opacity: 1,
    });
    expect(model.trails[0].sampleFraction).toBe(TRAIL_SAMPLE_FRACTION);
    expect(
      Math.abs(
        model.trails[0].sweep.tailRadians *
          model.trails[0].sampleFraction,
      ),
    ).toBeGreaterThan(model.trails[0].arcRadians * 0.5);
    expect(model.labels.every(({ fontSizePx }) => fontSizePx === 12)).toBe(true);
    expect(model.labels[0].dayChip).toBe("▼ 6.7");
    expect(model.nebula).toEqual(nebulaForHealth(-0.42));
    expect(model.nebula.alpha).toBeLessThanOrEqual(0.15);
    expect(model.starfields).toHaveLength(2);
    expect(model.sun).toEqual(
      sunVisualParameters(-0.42, 0.7, model.sun.radius),
    );
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
    /* Recalibrated twice, and the second time has a cost worth naming.
     *
     * FB-01 (§13) narrowed these once. R7 Jul 31 moved ORRERY_SUN_CLEARANCE
     * 3.4 -> 9.0 so ASML would stop crowding the sun, on his third report of
     * it. But the camera fits the OUTER orbit, and every orbit is computed
     * cumulatively from the sun clearance — so widening the innermost gap
     * inflates the whole system, pulls the camera back, and shrinks every
     * planet on screen by about 10%.
     *
     * These floors follow the geometry rather than the geometry being bent to
     * keep the floors. The trade-off is real and is the owner's to accept:
     * ASML has its room, and every planet is a tenth smaller. */
    expect(model.planets[0].projectedDiameterPx).toBeGreaterThanOrEqual(34);
    expect(model.planets[0].projectedDiameterPx).toBeLessThanOrEqual(40);
    expect(
      Math.min(...model.planets.map(({ projectedDiameterPx }) => projectedDiameterPx)),
    ).toBeGreaterThanOrEqual(13);
    expect(model.belt.viewportSpanPct).toBeGreaterThanOrEqual(0.74);
    expect(model.belt.viewportSpanPct).toBeLessThanOrEqual(0.76);
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

      // FB-01 (§13): OVERVIEW_BELT_SPAN_PCT 0.80 -> 0.75.
      expect(model.belt.viewportSpanPct).toBeGreaterThanOrEqual(0.74);
      expect(model.belt.viewportSpanPct).toBeLessThanOrEqual(0.76);
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
        // FB-01 (§12a): recalibrated floor for the pull-back's smaller radii.
        expect(
          planet.projectedDiameterPx,
          `${planet.ticker} projected diameter floor`,
          // 16 -> 13: same cause as above, the sun-clearance widening.
        ).toBeGreaterThanOrEqual(13);
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

    // FB-01 (§13): recalibrated for one more small step (gap 1.75->1.82,
    // belt span 0.80->0.75), which shrinks every projected diameter and
    // widens spacing a little further. The gap formula's additive +0.55
    // term also means the gap/(r_i+r_i+1) ratio is no longer a single
    // constant across every adjacent pair -- it is always strictly greater
    // than the 1.82 multiplier alone, by 0.55/(r_i+r_i+1).
    // 37 -> 31: same cause as the floors above. ORRERY_SUN_CLEARANCE 3.4 ->
    // 9.0 inflates the system, the camera fits the outer orbit and pulls
    // back, and every projected diameter shrinks by roughly a tenth.
    expect(heaviestDiameterMin).toBeGreaterThanOrEqual(31);
    expect(heaviestDiameterMax).toBeLessThanOrEqual(45);
    // 15 -> 13. The FOURTH floor in this family to move, all from the one
    // change: ORRERY_SUN_CLEARANCE 3.4 -> 9.0. The first three were fixed one
    // failing assertion at a time, which is why this took four rounds — a
    // failing expect() hides every assertion after it in the same test, so
    // "fix the failure" finds them serially. The right move after the first
    // one was to grep every projected-diameter bound in the file at once.
    expect(smallestDiameter).toBeGreaterThanOrEqual(13);
    expect(minimumSpacingRatio).toBeGreaterThan(1.82);
    expect(minimumSpacingRatio).toBeLessThan(2.5);
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

  it("keeps adjacent rings apart per the FB-01 (§13) gap formula", () => {
    const model = buildOverviewSceneModel({
      holdings,
      healthScalar: 0,
      sunspotIntensity: 0,
    });
    for (let index = 0; index < model.planets.length - 1; index += 1) {
      const current = model.planets[index];
      const next = model.planets[index + 1];
      const spacing = next.orbitRadius - current.orbitRadius;
      // FB-01 (§13): 1.75x(ri+ri+1)+0.55 -> 1.82x(ri+ri+1)+0.55.
      expect(spacing).toBeCloseTo(
        1.82 * (current.radius + next.radius) + 0.55,
        12,
      );
      expect(spacing + Number.EPSILON * 4).toBeGreaterThanOrEqual(
        1.82 * (current.radius + next.radius) + 0.55,
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
        orbitPeriodSeconds: moonOrbitPeriodSeconds("ASML"),
        axialSpinRadiansPerSecond: 0,
      },
      {
        ticker: "GOOG",
        storyCount: 4,
        bucket: "medium",
        radius: moonRadiusForStoryCount(4),
        earningsDays: null,
        ringVisible: false,
        orbitPeriodSeconds: moonOrbitPeriodSeconds("GOOG"),
        axialSpinRadiansPerSecond: 0,
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

  it("R7-W8(b): index craft fly outside every planet, portfolio craft inside", () => {
    /* Two rings, two meanings. Portfolio craft encode the book's own state
     * and sit between the sun and the first holding; index craft encode the
     * market and sit outside everything owned. If those rings ever crossed,
     * "the market" and "something I own" would occupy the same space and the
     * separation the design rests on would be gone. */
    const model = buildOverviewSceneModel({
      holdings,
      healthScalar: 0,
      sunspotIntensity: 0,
      indexBenchmarks: [
        { label: "S&P 500", returnPct: 0.021 },
        { label: "TOTAL MARKET", returnPct: 0.018 },
        { label: "TECH", returnPct: null },
      ],
    });
    const index = model.satellites.filter((s) => s.ring === "index");
    const portfolio = model.satellites.filter((s) => s.ring === "portfolio");
    const orbits = model.planets.map((p) => p.orbitRadius);

    expect(portfolio).toHaveLength(3);
    expect(index.map((s) => s.label)).toEqual(["S&P 500", "TOTAL MARKET", "TECH"]);
    expect(index[0].orbitRadius).toBeGreaterThan(Math.max(...orbits));
    expect(index[0].orbitRadius).toBeGreaterThan(model.belt.radius);
    expect(portfolio[0].orbitRadius).toBeLessThan(Math.min(...orbits));

    // An unavailable benchmark still gets a craft carrying null, so the ring
    // does not silently change size when a feed is down.
    expect(index[2].encodedValue).toBeNull();
  });

  it("R7-W8(b): no benchmarks means no index craft, not empty ones", () => {
    const model = buildOverviewSceneModel({ holdings, healthScalar: 0, sunspotIntensity: 0 });
    expect(model.satellites.filter((s) => s.ring === "index")).toHaveLength(0);
    expect(model.satellites).toHaveLength(3);
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
      /* R7-W8(b) added index craft to this array. This fixture passes no
         benchmarks so [0] is still a portfolio craft and the test passed by
         luck — selecting by ring removes a trap that would have bitten the
         first fixture to include benchmarks, and would have looked like a
         geometry regression rather than an indexing one. */
      const satelliteRadius = model.satellites.find(
        (satellite) => satellite.ring === "portfolio",
      )!.orbitRadius;
      expect(satelliteRadius).toBe(
        satelliteRingRadius(
          model.planets[0].orbitRadius,
          radiusForWeight(reordered[0].weight),
          model.sun.radius,
        ),
      );
      expect(
        satelliteRadius + 0.16 + ORRERY_PLANET_CLEARANCE,
      ).toBeCloseTo(
        Math.min(
          satelliteRadius + 0.16 + ORRERY_PLANET_CLEARANCE,
          model.planets[0].orbitRadius - radiusForWeight(reordered[0].weight),
        ),
        12,
      );
    }
  });

  it("clamps every new scalar encoding and handles unavailable values", () => {
    expect(trailArcLengthForReturn(0.00001)).toBe(
      trailArcLengthForReturn(0.002),
    );
    expect(trailArcLengthForReturn(1)).toBe(
      trailArcLengthForReturn(0.12),
    );
    expect(trailArcLengthForReturn(null)).toBe(
      trailArcLengthForReturn(0.002),
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

  it("FB-20: culls a label whose body is not itself visible instead of clamping it into frame", () => {
    const viewport = { width: 1440, height: 900 };
    const [visible, offFrame, behindCamera] = layoutOverviewLabels(
      [
        {
          ticker: "VISIBLE",
          screen: { x: 700, y: 450, depth: 0.1 },
          opacity: 1,
          yielded: false,
          bodyVisible: true,
        },
        {
          // A body whose OWN projection has drifted fully off the canvas --
          // the pre-fix edge clamp would have dragged this back into frame.
          ticker: "OFFFRAME",
          screen: { x: 4000, y: 450, depth: 0.1 },
          opacity: 1,
          yielded: false,
          bodyVisible: false,
        },
        {
          // A body behind the camera / past the far clip -- the raw
          // projected.z > 1 test alone caught this case already, and must
          // keep catching it.
          ticker: "BEHINDCAMERA",
          screen: { x: 700, y: 450, depth: 1.4 },
          opacity: 1,
          yielded: false,
          bodyVisible: false,
        },
      ],
      viewport,
    );
    expect(visible.bodyVisible).toBe(true);
    expect(visible.screen.x).toBeGreaterThan(0);
    expect(visible.screen.x).toBeLessThan(viewport.width);
    expect(offFrame.bodyVisible).toBe(false);
    expect(behindCamera.bodyVisible).toBe(false);
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
    expect(cometColor("sell", 1)).toBe("#2BFF8C");
    expect(cometColor("sell", -1)).toBe("#FF2D1F");
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
      color: "#FF2D1F",
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
    expect(resolveOrreryPointerTarget("belt:CBRS", "NBIS")).toBe("belt:CBRS");
    expect(resolveOrreryPointerTarget("ASML", "GOOG")).toBe("GOOG");
    expect(
      resolveOrreryRaycastTarget(
        ["portfolio-glow", "portfolio-glow", "satellite:HAZARD"],
        undefined,
      ),
    ).toBe("satellite:HAZARD");
    expect(
      resolveOrreryRaycastTarget(["portfolio-glow", "portfolio-glow"], undefined),
    ).toBe("portfolio");
    expect(
      resolveOrreryRaycastTarget(["portfolio", "planet:behind-sun"], undefined),
    ).toBe("portfolio");
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

  it("derives the dominant sun and first orbit from the largest planet", () => {
    expect(sunRadiusForPlanetRadii([])).toBe(2.8);
    expect(sunRadiusForPlanetRadii([1, 1.95, 0.9])).toBeCloseTo(3.12, 12);
    const model = buildOverviewSceneModel({
      holdings: productionOverviewHoldings,
      healthScalar: 0,
      sunspotIntensity: 0,
    });
    expect(model.sun.radius).toBeCloseTo(
      Math.max(2.8, 1.6 * Math.max(...model.planets.map(({ radius }) => radius))),
      12,
    );
    expect(model.sun.radius).toBeGreaterThan(
      Math.max(...model.planets.map(({ radius }) => radius)),
    );
    expect(model.planets[0].orbitRadius - model.planets[0].radius).toBeGreaterThan(
      model.sun.radius,
    );
  });

  it("puts both orbital directions behind the planet and keeps a near-flat trail", () => {
    const clockwise = trailSweepAngles("clockwise", Math.PI / 3);
    const counterclockwise = trailSweepAngles(
      "counterclockwise",
      Math.PI / 3,
    );
    expect(clockwise).toEqual({
      headRadians: 0,
      tailRadians: -Math.PI / 3,
    });
    expect(counterclockwise).toEqual({
      headRadians: 0,
      tailRadians: Math.PI / 3,
    });
    /* FB-03 set 18-30 degrees and he confirmed it on July 29 — while HUE was
     * still carrying magnitude. On July 31 he moved magnitude onto length and
     * speed and made colour mean sign only, which leaves length doing work it
     * was never sized for: 1.7x spread is not a readable signal. 12-72 is 6x.
     * The band changed because the job changed, on his instruction. */
    expect(trailArcLengthForReturn(0.002) * 180 / Math.PI).toBeCloseTo(
      12,
      10,
    );
    expect(trailArcLengthForReturn(0.12) * 180 / Math.PI).toBeCloseTo(
      72,
      10,
    );
    const model = buildOverviewSceneModel({
      holdings: [{ ...holdings[2], dayReturn: 0.001 }],
      healthScalar: 0,
      sunspotIntensity: 0,
    });
    /* R7 U5 changed what colour means, so this assertion had to change with
     * it. Under the old ramp a +0.1% day drew a near-flat AMBER, because hue
     * varied with magnitude and 0.1% is barely any magnitude. Colour is now
     * the SIGN alone: +0.1% is a gain, so it draws full green, and the fact
     * that it is a small gain is carried by the arc being at its 12 degree
     * floor. That is the whole point of the change he asked for — one
     * channel per variable. */
    expect(model.trails[0]).toMatchObject({
      color: UNIVERSE_PALETTE.signal.gain,
      arcRadians: trailArcLengthForReturn(0.002),
    });

    /* FLAT still exists, and is now the only thing that draws amber: a move
     * inside ORRERY_FLAT_EPSILON has no sign worth reporting. Added because
     * the case above stopped covering it once colour became sign-only. */
    const flat = buildOverviewSceneModel({
      holdings: [{ ...holdings[2], dayReturn: 0.0001 }],
      healthScalar: 0,
      sunspotIntensity: 0,
    });
    expect(flat.trails[0]).toMatchObject({
      color: UNIVERSE_PALETTE.signal.flat,
      direction: "neutral",
    });

    /* R7 Jul 31, found by him on screen: trail length must encode the STOCK,
     * not the orbit. The renderer draws orbitRadius x arcRadians, so an
     * angular band gave an outer planet a physically longer ribbon for the
     * same move — COST's smaller day outdrew ASML's bigger one purely because
     * COST orbits further out. The arc is now derived from a target length in
     * world units, so the drawn length is identical at every radius. */
    for (const ret of [0.002, 0.01, 0.03, 0.12]) {
      const lengths = [9, 20, 34].map(
        (radius) => radius * trailArcLengthForReturn(ret, radius),
      );
      for (const length of lengths) {
        expect(length).toBeCloseTo(lengths[0], 6);
      }
    }
    // The reported case, asserted directly: a big move on an inner orbit must
    // outdraw a small move on an outer one.
    expect(9 * trailArcLengthForReturn(0.03, 9)).toBeGreaterThan(
      20 * trailArcLengthForReturn(0.005, 20),
    );

    /* And a loss draws the same red every loss draws, regardless of size —
     * the other half of "the color red or green be the same for all planets". */
    const down = buildOverviewSceneModel({
      holdings: [{ ...holdings[2], dayReturn: -0.004 }],
      healthScalar: 0,
      sunspotIntensity: 0,
    });
    const deepDown = buildOverviewSceneModel({
      holdings: [{ ...holdings[2], dayReturn: -0.09 }],
      healthScalar: 0,
      sunspotIntensity: 0,
    });
    expect(down.trails[0].color).toBe(UNIVERSE_PALETTE.signal.loss);
    expect(deepDown.trails[0].color).toBe(down.trails[0].color);
    // Same colour, different length — magnitude lives in the arc now.
    expect(deepDown.trails[0].arcRadians).toBeGreaterThan(
      down.trails[0].arcRadians,
    );
  });

  it("keeps the sampled trail core measurable without glow overlap", () => {
    expect(trailRibbonHalfWidths(-1, 0.15)).toEqual({
      inner: 0,
      outer: 0.15,
    });
    expect(trailRibbonHalfWidths(2, 0.15)).toEqual({
      inner: 0,
      outer: 0.1275,
    });
    const core = trailRibbonHalfWidths(
      TRAIL_SAMPLE_FRACTION,
      0.15,
    );
    const glow = trailRibbonHalfWidths(
      TRAIL_SAMPLE_FRACTION,
      0.25,
      0.15,
    );
    expect(core.outer).toBeGreaterThan(0.135);
    expect(glow.inner).toBeCloseTo(core.outer, 12);
    expect(glow.outer).toBeGreaterThan(glow.inner);
  });

  it("banks day return and uses only seeded decorative spin and slow moon motion", () => {
    const changedDayReturn = [
      { ...holdings[0], dayReturn: -0.8, newsCount: 2 },
      { ...holdings[1], dayReturn: 0.8 },
    ];
    const baseline = buildOverviewSceneModel({
      holdings: [
        { ...holdings[0], dayReturn: null, newsCount: 2 },
        { ...holdings[1], dayReturn: null },
      ],
      healthScalar: 0,
      sunspotIntensity: 0,
    });
    const changed = buildOverviewSceneModel({
      holdings: changedDayReturn,
      healthScalar: 0,
      sunspotIntensity: 0,
    });
    expect(changed.planets.map(({ spinPeriodSeconds }) => spinPeriodSeconds)).toEqual(
      baseline.planets.map(({ spinPeriodSeconds }) => spinPeriodSeconds),
    );
    for (const planet of changed.planets) {
      expect(planet.spinPeriodSeconds).toBeGreaterThanOrEqual(80);
      expect(planet.spinPeriodSeconds).toBeLessThanOrEqual(140);
      expect(planet.spinRadiansPerSecond).toBe(
        decorativeSpinRadiansPerSecond(planet.ticker),
      );
      expect(planet.spinPeriodSeconds).toBe(
        decorativeSpinPeriodSeconds(planet.ticker),
      );
    }
    expect(changed.moons[0].orbitPeriodSeconds).toBeGreaterThanOrEqual(38);
    expect(changed.moons[0].orbitPeriodSeconds).toBeLessThanOrEqual(42);
    expect(changed.moons[0].axialSpinRadiansPerSecond).toBe(0);
  });

  it("describes the star population and ring falloff deterministically", () => {
    const population = starPopulationDescriptor();
    expect(population).toEqual(starPopulationDescriptor());
    expect(population.count).toBe(1024);
    expect(population.buckets.diffraction).toBe(12);
    expect(population.buckets.faint / population.count).toBeCloseTo(0.7, 1);
    expect(population.buckets.medium / population.count).toBeCloseTo(0.25, 1);
    expect(population.buckets.bright / population.count).toBeCloseTo(0.04, 1);
    expect(population.auroraDensityMultiplier).toBe(1.8);
    expect(starMagnitudeBucket(0)).toBe("diffraction");
    expect(starMagnitudeBucket(12)).toBe("bright");
    expect(ringVertexAlpha(0)).toBe(0.85);
    expect(ringVertexAlpha(Math.PI)).toBe(0.7);
  });

  it("prebakes only public percent magnitudes into an upper-sky aurora", () => {
    const weekly = weeklyReturnsFromIndexSeries(
      [100, 101, 99, 102, 104, 106, 103, 108, 109, 111],
    );
    expect(weekly).toHaveLength(5);
    const descriptor = auroraDescriptor(weekly);
    expect(descriptor.percentMagnitudes).toEqual(
      weekly.map((value) => Math.abs(value)),
    );
    expect(descriptor.colorSamples).toHaveLength(64);
    // FB-02 (§13): floor raised 0.02 -> 0.14, cap unchanged at 0.40.
    expect(descriptor.opacity).toBeGreaterThanOrEqual(0.14);
    expect(descriptor.opacity).toBeLessThanOrEqual(0.4);
    expect(descriptor.chord.screenClearanceSunRadii).toBeGreaterThanOrEqual(
      1.2,
    );
  });

  it("maps radar ring colour and blip diameter from their one inputs", () => {
    expect(radarRingColor(null)).toBe(UNIVERSE_PALETTE.signal.flat);
    expect(radarRingColor(0.061)).toBe(rampForReturn(0.061));
    expect(radarBlipDiameterPx(-1)).toBe(12);
    expect(radarBlipDiameterPx(0.04)).toBe(14);
    expect(radarBlipDiameterPx(0.16)).toBe(18);
  });

  it("keeps polar weather sign and brand-first phase deterministic", () => {
    expect(weatherWispsForHealth(0.4)).toEqual({
      color: UNIVERSE_PALETTE.ambient.wispPositive.color,
      alpha: 0.1,
      sign: "positive",
    });
    expect(weatherWispsForHealth(-0.4)).toEqual({
      color: UNIVERSE_PALETTE.ambient.wispNegative.color,
      alpha: 0.1,
      sign: "negative",
    });
    const phase = brandEntryPhase("ASML");
    expect(phase).toBe(brandEntryPhase("ASML"));
    expect(phase / (Math.PI * 2 / 3)).toBeCloseTo(
      Math.round(phase / (Math.PI * 2 / 3)),
      12,
    );
  });

  it("anchors every approach camera at the left third and compresses close-up exposure", () => {
    for (const angle of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
      const world = new Vector3(Math.cos(angle) * 10, 0, Math.sin(angle) * 10);
      const outward = world.clone().setY(0).normalize();
      const tangent = new Vector3(-outward.z, 0, outward.x);
      const camera = new PerspectiveCamera(42, 1440 / 900, 0.1, 100);
      camera.position
        .copy(world)
        .addScaledVector(outward, APPROACH_CAMERA_DISTANCE)
        .addScaledVector(tangent, APPROACH_CAMERA_TANGENT_OFFSET);
      camera.position.y += APPROACH_CAMERA_HEIGHT;
      camera.lookAt(
        world
          .clone()
          .addScaledVector(tangent, APPROACH_LOOK_AT_TANGENT_OFFSET),
      );
      camera.updateMatrixWorld(true);
      const screenX = world.clone().project(camera).x * 0.5 + 0.5;
      expect(screenX).toBeCloseTo(0.3, 2);
    }

    expect(approachExposure(1)).toBe(1);
    expect(approachExposure(2.8)).toBeCloseTo(Math.sqrt(2.8), 12);
    expect(approachExposure(12)).toBeCloseTo(Math.sqrt(12), 12);
  });

  it("keeps empty holdings, an empty belt, and absent moons/comets valid", () => {
    const empty = buildOverviewSceneModel({
      holdings: [],
      beltHoldings: [],
      healthScalar: 0,
      sunspotIntensity: 0,
    });
    expect(empty.planets).toEqual([]);
    expect(empty.trails).toEqual([]);
    expect(empty.moons).toEqual([]);
    expect(empty.belt.bodies).toEqual([]);
    expect(empty.comet).toBeNull();
  });

  it("scales every belt body from real weight into a visible geometry range", () => {
    expect(beltBodyRadiusForWeight(0)).toBeGreaterThanOrEqual(0.18);
    expect(beltBodyRadiusForWeight(0.35)).toBeLessThanOrEqual(0.34);
    const model = buildOverviewSceneModel({
      holdings,
      beltHoldings: [{ ...holdings[2], ticker: "BELT", weight: 0.02 }],
      healthScalar: 0,
      sunspotIntensity: 0,
    });
    expect(model.belt.bodies[0]).toEqual({
      ticker: "BELT",
      weight: 0.02,
      visualRadius: beltBodyRadiusForWeight(0.02),
    });
  });
});

describe("R7-W4(c) — radar label placement", () => {
  it("pushes a label clear of the hub only when its ring is too small", () => {
    // The reported defect: "ASML is covered up". Every label sat on the same
    // centre line at its ring's right edge, so the innermost one landed on
    // the hub. Outer labels were always fine, which is why it read as one
    // broken label rather than a broken layout.
    const inner = radarLabelPlacement(0, 10);
    expect(inner.dx).toBeGreaterThan(0);
    expect(inner.leader).toBe(true);

    const outer = radarLabelPlacement(7, 200);
    expect(outer.dx).toBe(0);
    expect(outer.leader).toBe(false);
  });

  it("never gives two neighbouring rings the same baseline", () => {
    // The property that matters as the book grows and rings crowd; the
    // absolute row assignment does not matter.
    for (let index = 0; index < 20; index += 1) {
      expect(radarLabelPlacement(index, 200).dy).not.toBe(
        radarLabelPlacement(index + 1, 200).dy,
      );
    }
  });

  it("is pure — same inputs, same placement", () => {
    expect(radarLabelPlacement(3, 42)).toEqual(radarLabelPlacement(3, 42));
  });
});
