import { describe, expect, it } from "vitest";
import { bestDay, currentStreak, downsideDeviation, sortino, winRate, worstDay } from "./daily-stats";

describe("downsideDeviation", () => {
  it("exact fixture: [0.02, -0.02] -> 0.02/sqrt(2)", () => {
    expect(downsideDeviation([0.02, -0.02])).toBeCloseTo(0.02 / Math.sqrt(2), 10);
  });

  it("is 0 when there are no losing days", () => {
    expect(downsideDeviation([0.01, 0.02, 0.03])).toBe(0);
  });

  it("is 0 for an empty series", () => {
    expect(downsideDeviation([])).toBe(0);
  });
});

describe("sortino", () => {
  it("composes with the downsideDeviation fixture", () => {
    const dd = 0.02 / Math.sqrt(2);
    const expected = (0 * 252 - 0.04) / (dd * Math.sqrt(252));
    expect(sortino([0.02, -0.02])).toBeCloseTo(expected, 10);
  });

  it("is null when downside deviation is 0 (no losing days)", () => {
    expect(sortino([0.01, 0.02, 0.03])).toBeNull();
  });
});

describe("winRate", () => {
  it("exact fixture: zeros count in n but not as wins", () => {
    expect(winRate([0.01, -0.01, 0.02, 0, 0.03])).toBe(0.6);
  });

  it("is 0 for an empty series", () => {
    expect(winRate([])).toBe(0);
  });
});

describe("bestDay / worstDay", () => {
  const returns = [
    { date: "2026-07-01", r: 0.01 },
    { date: "2026-07-02", r: -0.03 },
    { date: "2026-07-03", r: 0.02 },
  ];

  it("picks the max return with its date", () => {
    expect(bestDay(returns)).toEqual({ date: "2026-07-03", r: 0.02 });
  });

  it("picks the min return with its date", () => {
    expect(worstDay(returns)).toEqual({ date: "2026-07-02", r: -0.03 });
  });

  it("is null for an empty series", () => {
    expect(bestDay([])).toBeNull();
    expect(worstDay([])).toBeNull();
  });
});

describe("currentStreak", () => {
  it("exact fixture: [-0.01, 0.004, 0.002] -> up, 2", () => {
    expect(currentStreak([-0.01, 0.004, 0.002])).toEqual({ dir: "up", n: 2 });
  });

  it("exact fixture: [0.01, 0, -0.02] -> down, 1 (zero breaks the streak)", () => {
    expect(currentStreak([0.01, 0, -0.02])).toEqual({ dir: "down", n: 1 });
  });

  it("is null when the most recent day is exactly 0", () => {
    expect(currentStreak([0.01, -0.02, 0])).toBeNull();
  });

  it("is null for an empty series", () => {
    expect(currentStreak([])).toBeNull();
  });
});
