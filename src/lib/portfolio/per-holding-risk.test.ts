import { describe, expect, it } from "vitest";
import { perHoldingRisk } from "./per-holding-risk";

describe("perHoldingRisk", () => {
  it("computes volatility from a ticker's own returns, no VOO alignment needed", () => {
    const returnsByTicker = { AAA: [{ date: "2026-07-01", r: 0.02 }, { date: "2026-07-02", r: -0.02 }] };
    const result = perHoldingRisk(returnsByTicker, []);
    expect(result[0].volatilityPct).toBeCloseTo(0.02 * Math.sqrt(2) * Math.sqrt(252), 6);
    expect(result[0].betaVsVoo).toBeNull();
  });

  it("is null for volatility with fewer than 2 returns (can't compute a stdev)", () => {
    const result = perHoldingRisk({ AAA: [{ date: "2026-07-01", r: 0.02 }] }, []);
    expect(result[0].volatilityPct).toBeNull();
  });

  it("computes beta only over shared dates with VOO, needing at least 5 overlapping days", () => {
    const dates = ["2026-07-01", "2026-07-02", "2026-07-03", "2026-07-04", "2026-07-05"];
    const tickerReturns = dates.map((date, i) => ({ date, r: 0.01 * (i + 1) }));
    const vooReturns = dates.map((date, i) => ({ date, r: 0.005 * (i + 1) }));
    const result = perHoldingRisk({ AAA: tickerReturns }, vooReturns);
    expect(result[0].betaVsVoo).not.toBeNull();
    // Perfectly proportional (ticker = 2x VOO every day) -> beta of exactly 2.
    expect(result[0].betaVsVoo).toBeCloseTo(2, 8);
  });

  it("is null for beta with fewer than 5 shared dates", () => {
    const dates = ["2026-07-01", "2026-07-02", "2026-07-03"];
    const tickerReturns = dates.map((date) => ({ date, r: 0.01 }));
    const vooReturns = dates.map((date) => ({ date, r: 0.005 }));
    const result = perHoldingRisk({ AAA: tickerReturns }, vooReturns);
    expect(result[0].betaVsVoo).toBeNull();
  });

  it("is null for beta when VOO has zero variance over the overlap", () => {
    const dates = ["2026-07-01", "2026-07-02", "2026-07-03", "2026-07-04", "2026-07-05"];
    const tickerReturns = dates.map((date, i) => ({ date, r: 0.01 * i }));
    const vooReturns = dates.map((date) => ({ date, r: 0.005 })); // constant
    const result = perHoldingRisk({ AAA: tickerReturns }, vooReturns);
    expect(result[0].betaVsVoo).toBeNull();
  });

  it("returns one entry per ticker, preserving ticker names", () => {
    const result = perHoldingRisk(
      { AAA: [{ date: "2026-07-01", r: 0.01 }], BBB: [{ date: "2026-07-01", r: -0.01 }] },
      [],
    );
    expect(result.map((r) => r.ticker).sort()).toEqual(["AAA", "BBB"]);
  });
});
