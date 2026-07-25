import { describe, expect, it } from "vitest";
import {
  ORRERY_FLAT_EPSILON,
  ORRERY_MAX_ANGULAR_SPEED,
  ORRERY_MAX_RADIUS,
  ORRERY_MIN_ANGULAR_SPEED,
  ORRERY_MIN_RADIUS,
  angularSpeedForWeeklyReturn,
  directionForWeeklyReturn,
  radiusForWeight,
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
});
