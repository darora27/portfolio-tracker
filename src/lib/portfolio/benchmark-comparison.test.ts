import { describe, expect, it } from "vitest";
import { computeBenchmarkComparison } from "./benchmark-comparison";

describe("computeBenchmarkComparison", () => {
  const benchmarkDates = ["2026-01-01", "2026-01-02", "2026-01-03"];
  // 10% then 20% (NOT a constant 10%/10% — that degenerate case has zero
  // benchmark variance over 2 returns, which correctly makes beta null;
  // it's covered separately below) so beta has a real, hand-computable
  // answer here: twr = 132/100 - 1 = 0.32.
  const closeByDate = new Map([
    ["2026-01-01", 100],
    ["2026-01-02", 110],
    ["2026-01-03", 132],
  ]);
  const portfolioReturns = [0.05, 0.15];
  // twr = (1.05)(1.15) - 1 = 0.2075
  const portfolioTwrPct = 0.2075;

  it("computes twr, excess return, beta, and an indexed chart series when every date has a close", () => {
    const result = computeBenchmarkComparison(
      "VOO",
      closeByDate,
      benchmarkDates,
      portfolioReturns,
      portfolioTwrPct,
    );

    expect(result.available).toBe(true);
    expect(result.twrPct).toBeCloseTo(0.32, 10);
    expect(result.excessReturnPct).toBeCloseTo(0.2075 - 0.32, 10);
    expect(result.chartIndex).toHaveLength(3);
    expect(result.chartIndex[0]).toBe(100);
    expect(result.chartIndex[1]).toBeCloseTo(110, 10);
    expect(result.chartIndex[2]).toBeCloseTo(132, 10);
    // benchmarkReturns = [0.10, 0.20], mean 0.15, deviations ±0.05;
    // portfolioReturns = [0.05, 0.15], mean 0.10, deviations ±0.05 in the
    // same direction each day -> cov = benchmark variance -> beta = 1.
    expect(result.beta).toBeCloseTo(1, 10);
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

  it("beta is null (not NaN) for a brand-new portfolio with exactly one funded day of returns", () => {
    // Two funded days -> exactly one daily return for both the portfolio
    // and the benchmark -> sample variance has no degrees of freedom left.
    // Regression test for the real dashboard bug this represents: a
    // 2-day-old portfolio previously rendered a literal "NaN" Sharpe/beta.
    const twoDayDates = ["2026-01-01", "2026-01-02"];
    const twoDayCloses = new Map([
      ["2026-01-01", 100],
      ["2026-01-02", 110],
    ]);
    const result = computeBenchmarkComparison("VOO", twoDayCloses, twoDayDates, [0.05], 0.05);
    expect(result.available).toBe(true);
    expect(result.beta).toBeNull();
  });
});
