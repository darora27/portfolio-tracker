import { describe, expect, it } from "vitest";
import { computeBenchmarkComparison } from "./benchmark-comparison";

describe("computeBenchmarkComparison", () => {
  const benchmarkDates = ["2026-01-01", "2026-01-02", "2026-01-03"];
  const closeByDate = new Map([
    ["2026-01-01", 100],
    ["2026-01-02", 110],
    ["2026-01-03", 121],
  ]);
  // 10% then 10%: twr = (1.1)(1.1) - 1 = 0.21
  const portfolioReturns = [0.05, 0.15];
  // twr = (1.05)(1.15) - 1 = 0.2075
  const portfolioTwrPct = 0.2075;

  it("computes twr, excess return, and an indexed chart series when every date has a close", () => {
    const result = computeBenchmarkComparison(
      "VOO",
      closeByDate,
      benchmarkDates,
      portfolioReturns,
      portfolioTwrPct,
    );

    expect(result.available).toBe(true);
    expect(result.twrPct).toBeCloseTo(0.21, 10);
    expect(result.excessReturnPct).toBeCloseTo(0.2075 - 0.21, 10);
    expect(result.chartIndex).toHaveLength(3);
    expect(result.chartIndex[0]).toBe(100);
    expect(result.chartIndex[1]).toBeCloseTo(110, 10);
    expect(result.chartIndex[2]).toBeCloseTo(121, 10);
    expect(result.beta).not.toBeNull();
  });

  it("is unavailable (nulls, empty chart series) when the benchmark is missing a date", () => {
    const incomplete = new Map([
      ["2026-01-01", 100],
      ["2026-01-02", 110],
      // missing 2026-01-03
    ]);
    const result = computeBenchmarkComparison(
      "VTI",
      incomplete,
      benchmarkDates,
      portfolioReturns,
      portfolioTwrPct,
    );

    expect(result.available).toBe(false);
    expect(result.beta).toBeNull();
    expect(result.twrPct).toBeNull();
    expect(result.excessReturnPct).toBeNull();
    expect(result.chartIndex).toEqual([]);
  });

  it("is unavailable when there is no funded history at all", () => {
    const result = computeBenchmarkComparison("XLK", closeByDate, [], [], 0);
    expect(result.available).toBe(false);
  });
});
