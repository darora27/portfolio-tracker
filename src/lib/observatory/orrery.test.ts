import { describe, expect, it } from "vitest";
import {
  ORRERY_FLAT_EPSILON,
  ORRERY_MAX_ANGULAR_SPEED,
  ORRERY_MAX_RADIUS,
  ORRERY_MIN_ANGULAR_SPEED,
  ORRERY_MIN_RADIUS,
  ORRERY_PLANET_CLEARANCE,
  ORRERY_PLANET_COUNT,
  ORRERY_SUN_CLEARANCE,
  angularSpeedForReturn,
  directionForReturn,
  orbitalDriftDegreesPerMinute,
  ORRERY_DRIFT_MAX_DEG_PER_MIN,
  ORRERY_DRIFT_MIN_DEG_PER_MIN,
  healthScalarForPortfolio,
  orbitRadiiForPlanetRadii,
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
    expect(radiusForWeight(0.18)).toBeCloseTo(
      Math.sqrt(0.18 / 0.35) * ORRERY_MAX_RADIUS,
      12,
    );
  });

  it("maps positive, negative, flat, and unavailable returns to explicit directions", () => {
    expect(directionForReturn(0.02)).toBe("clockwise");
    expect(directionForReturn(-0.02)).toBe("counterclockwise");
    expect(directionForReturn(ORRERY_FLAT_EPSILON)).toBe("neutral");
    expect(directionForReturn(-ORRERY_FLAT_EPSILON)).toBe("neutral");
    expect(directionForReturn(null)).toBe("neutral");
  });

  it("maps absolute return monotonically to a safely clamped angular speed", () => {
    const magnitudes = [0.002, 0.01, 0.03, 0.06, 0.12];
    const speeds = magnitudes.map(angularSpeedForReturn);
    expect(speeds[0]).toBe(ORRERY_MIN_ANGULAR_SPEED);
    expect(speeds.at(-1)).toBe(ORRERY_MAX_ANGULAR_SPEED);
    expect(speeds).toEqual([...speeds].sort((a, b) => a - b));
    expect(angularSpeedForReturn(-0.03)).toBe(angularSpeedForReturn(0.03));
    expect(angularSpeedForReturn(0)).toBe(0);
    expect(angularSpeedForReturn(null)).toBe(0);
    expect(angularSpeedForReturn(0.5)).toBe(ORRERY_MAX_ANGULAR_SPEED);
  });

  it("R7-W4(b): drifts in degrees per minute, slow enough to read", () => {
    // Devan asked for motion that reads the daily trend and "can move very
    // very slow". The old ceiling was 0.055 rad/s — 189 deg/min, a full orbit
    // in under two minutes, which is animation rather than a reading.
    expect(orbitalDriftDegreesPerMinute(0.01)).toBeCloseTo(24, 10);
    expect(orbitalDriftDegreesPerMinute(0.001)).toBe(ORRERY_DRIFT_MIN_DEG_PER_MIN);
    expect(orbitalDriftDegreesPerMinute(0.05)).toBe(ORRERY_DRIFT_MAX_DEG_PER_MIN);
    expect(orbitalDriftDegreesPerMinute(-0.05)).toBe(ORRERY_DRIFT_MAX_DEG_PER_MIN);
    expect(orbitalDriftDegreesPerMinute(null)).toBe(0);
    // A flat day parks the planet rather than nudging it — which is exactly
    // what "the planets just don't orbit" looked like when W1's defect made
    // every holding flat at once. The behaviour is right; the input was wrong.
    expect(orbitalDriftDegreesPerMinute(0.0001)).toBe(0);
    // Jul 31: "either the planets are moving too slow or they are not moving
    // at all". Motion has to be legible in the seconds someone actually looks,
    // so the ceiling must clear roughly a degree per second.
    expect(ORRERY_DRIFT_MAX_DEG_PER_MIN / 60).toBeGreaterThanOrEqual(0.9);
    // ...and the floor must still move perceptibly over a minute.
    expect(ORRERY_DRIFT_MIN_DEG_PER_MIN).toBeGreaterThanOrEqual(5);
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

  it("assigns monotonically spaced orbits from each adjacent radius pair", () => {
    const planetRadii = [
      ORRERY_MAX_RADIUS,
      1.25,
      1.1,
      ORRERY_MIN_RADIUS,
    ];
    const orbitRadii = orbitRadiiForPlanetRadii(planetRadii);
    expect(orbitRadii[0]).toBe(ORRERY_SUN_CLEARANCE);
    expect(orbitRadii).toEqual([...orbitRadii].sort((a, b) => a - b));
    for (let index = 0; index < orbitRadii.length - 1; index += 1) {
      // FB-01 (§13): gap formula 1.75x(ri+ri+1)+0.55 -> 1.82x(ri+ri+1)+0.55.
      expect(orbitRadii[index + 1] - orbitRadii[index]).toBeCloseTo(
        1.82 * (planetRadii[index] + planetRadii[index + 1]) + 0.55,
        12,
      );
    }
    expect(() => orbitRadiiForPlanetRadii([1, Number.NaN])).toThrow(
      RangeError,
    );
  });

  it("keeps adjacent maximum-size planet surfaces physically separated", () => {
    const planetRadii = Array.from(
      { length: ORRERY_PLANET_COUNT },
      () => ORRERY_MAX_RADIUS,
    );
    const orbitRadii = orbitRadiiForPlanetRadii(planetRadii);
    for (let index = 0; index < orbitRadii.length - 1; index += 1) {
      expect(orbitRadii[index + 1] - orbitRadii[index]).toBeGreaterThanOrEqual(
        planetRadii[index] +
          planetRadii[index + 1] +
          ORRERY_PLANET_CLEARANCE,
      );
    }
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
