import { describe, expect, it } from "vitest";
import {
  ORRERY_FLAT_EPSILON,
  ORRERY_MAX_ANGULAR_SPEED,
  ORRERY_MAX_AXIAL_SPIN,
  ORRERY_MAX_RADIUS,
  ORRERY_MIN_ANGULAR_SPEED,
  ORRERY_MIN_AXIAL_SPIN,
  ORRERY_MIN_RADIUS,
  ORRERY_PLANET_COUNT,
  ORRERY_RING_SPACING,
  ORRERY_SUN_CLEARANCE,
  angularSpeedForWeeklyReturn,
  axialSpinForDayReturn,
  directionForWeeklyReturn,
  healthScalarForPortfolio,
  orbitRadiusForRank,
  radiusForWeight,
  resolveBeltMembership,
  sunspotIntensityForDrawdown,
  weeklyReturnForPrices,
} from "./orrery";

describe("Portfolio Orrery encodings", () => {
  it("uses a perceptual square-root radius scale with safe clamps", () => {
    expect(radiusForWeight(0)).toBe(ORRERY_MIN_RADIUS);
    expect(radiusForWeight(0.01)).toBe(ORRERY_MIN_RADIUS);
    expect(radiusForWeight(0.35)).toBeCloseTo(ORRERY_MAX_RADIUS, 12);
    expect(radiusForWeight(1)).toBeCloseTo(ORRERY_MAX_RADIUS, 12);
    expect(radiusForWeight(0.18)).toBeCloseTo(0.7501, 4);
  });

  it("maps positive, negative, flat, and unavailable returns to explicit directions", () => {
    expect(directionForWeeklyReturn(0.02)).toBe("clockwise");
    expect(directionForWeeklyReturn(-0.02)).toBe("counterclockwise");
    expect(directionForWeeklyReturn(ORRERY_FLAT_EPSILON)).toBe("neutral");
    expect(directionForWeeklyReturn(-ORRERY_FLAT_EPSILON)).toBe("neutral");
    expect(directionForWeeklyReturn(null)).toBe("neutral");
  });

  it("maps absolute return monotonically to a safely clamped angular speed", () => {
    const magnitudes = [0.002, 0.01, 0.03, 0.06, 0.12];
    const speeds = magnitudes.map(angularSpeedForWeeklyReturn);
    expect(speeds[0]).toBe(ORRERY_MIN_ANGULAR_SPEED);
    expect(speeds.at(-1)).toBe(ORRERY_MAX_ANGULAR_SPEED);
    expect(speeds).toEqual([...speeds].sort((a, b) => a - b));
    expect(angularSpeedForWeeklyReturn(-0.03)).toBe(angularSpeedForWeeklyReturn(0.03));
    expect(angularSpeedForWeeklyReturn(0)).toBe(0);
    expect(angularSpeedForWeeklyReturn(null)).toBe(0);
    expect(angularSpeedForWeeklyReturn(0.5)).toBe(ORRERY_MAX_ANGULAR_SPEED);
  });

  it("computes the trailing seven-calendar-day holding return", () => {
    expect(
      weeklyReturnForPrices([
        { date: "2026-07-10", price: 100 },
        { date: "2026-07-17", price: 110 },
      ]),
    ).toBeCloseTo(0.1, 8);
    expect(weeklyReturnForPrices([{ date: "2026-07-17", price: 110 }])).toBeNull();
  });

  it("assigns one monotonically spaced orbit per positive integer rank", () => {
    expect(orbitRadiusForRank(1)).toBe(ORRERY_SUN_CLEARANCE);
    expect(orbitRadiusForRank(8)).toBe(
      ORRERY_SUN_CLEARANCE + 7 * ORRERY_RING_SPACING,
    );
    expect(
      Array.from({ length: ORRERY_PLANET_COUNT }, (_, index) =>
        orbitRadiusForRank(index + 1),
      ),
    ).toEqual(
      [...Array.from({ length: ORRERY_PLANET_COUNT }, (_, index) =>
        orbitRadiusForRank(index + 1),
      )].sort((a, b) => a - b),
    );
    for (const invalid of [0, -1, 1.5]) {
      expect(() => orbitRadiusForRank(invalid)).toThrow(RangeError);
    }
  });

  it("maps day-return magnitude to safely clamped axial spin", () => {
    expect(axialSpinForDayReturn(null)).toBe(ORRERY_MIN_AXIAL_SPIN);
    expect(axialSpinForDayReturn(0)).toBe(ORRERY_MIN_AXIAL_SPIN);
    expect(axialSpinForDayReturn(-0.06)).toBe(ORRERY_MAX_AXIAL_SPIN);
    expect(axialSpinForDayReturn(0.5)).toBe(ORRERY_MAX_AXIAL_SPIN);
    expect(axialSpinForDayReturn(0.0305)).toBeCloseTo(0.3, 10);
    expect(axialSpinForDayReturn(-0.03)).toBe(
      axialSpinForDayReturn(0.03),
    );
  });

  it("normalizes sun health against volatility and clamps extremes", () => {
    expect(healthScalarForPortfolio(0, 0, 0.37)).toBe(0);
    const highVolWeak = healthScalarForPortfolio(-0.01, 0, 0.37);
    const lowVolWeak = healthScalarForPortfolio(-0.01, 0, 0.11);
    expect(highVolWeak).toBeGreaterThan(-0.5);
    expect(lowVolWeak).toBeLessThan(highVolWeak);
    expect(healthScalarForPortfolio(-0.08, -0.08, 0.37)).toBe(-1);
    expect(healthScalarForPortfolio(0.08, 0.08, 0.37)).toBe(1);
  });

  it("maps distance below the all-time high to sunspot intensity", () => {
    expect(sunspotIntensityForDrawdown(0)).toBe(0);
    expect(sunspotIntensityForDrawdown(0.02)).toBe(0);
    expect(sunspotIntensityForDrawdown(-0.137)).toBeCloseTo(0.685, 12);
    expect(sunspotIntensityForDrawdown(-0.2)).toBe(1);
    expect(sunspotIntensityForDrawdown(-0.5)).toBe(1);
  });

  it("keeps the top-eight boundary sticky until a holding clears the band", () => {
    const base = Array.from({ length: 7 }, (_, index) => ({
      ticker: `P${index + 1}`,
      weight: 0.2 - index * 0.01,
    }));
    const previous = new Set([...base.map(({ ticker }) => ticker), "OLD"]);
    const insideBand = [
      ...base,
      { ticker: "NEW", weight: 0.038 },
      { ticker: "OLD", weight: 0.037 },
    ];
    expect(resolveBeltMembership(insideBand, previous)).toEqual({
      planetTickers: [...base.map(({ ticker }) => ticker), "OLD"],
      beltTickers: ["NEW"],
    });

    const crossed = [
      ...base,
      { ticker: "NEW", weight: 0.044 },
      { ticker: "OLD", weight: 0.037 },
    ];
    expect(resolveBeltMembership(crossed, previous).planetTickers).toContain(
      "NEW",
    );
    expect(resolveBeltMembership(crossed, previous).beltTickers).toContain(
      "OLD",
    );
  });

  it("falls back to strict rank and always returns min(8, N) planets", () => {
    const holdings = Array.from({ length: 10 }, (_, index) => ({
      ticker: `H${index}`,
      weight: 0.1 - index * 0.005,
    }));
    expect(resolveBeltMembership(holdings, null).planetTickers).toEqual(
      holdings.slice(0, 8).map(({ ticker }) => ticker),
    );
    expect(resolveBeltMembership(holdings.slice(0, 4), new Set()).beltTickers)
      .toEqual([]);
    expect(resolveBeltMembership(holdings, new Set(["H8"])).planetTickers)
      .toHaveLength(8);
  });
});
