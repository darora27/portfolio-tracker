import { describe, expect, it } from "vitest";
import { dailyChangeAmount, dailyChangePercent, netFlowsForDate } from "./daily-change";

describe("daily change (net of cash flows)", () => {
  // Real 2026-07-22 data: a $2,775.00 COST purchase that day was previously
  // counted as gain by the raw V_now - V_prev formula.
  it("nets out a same-day deposit — exact dollar fixture", () => {
    const vNow = 25341.75;
    const vPrev = 22834.1;
    const netFlowsToday = 2775.0;
    expect(dailyChangeAmount(vNow, vPrev, netFlowsToday)).toBeCloseTo(-267.35, 2);
    expect(dailyChangePercent(vNow, vPrev, netFlowsToday)).toBeCloseTo(-0.01171, 4);
  });

  it("no-flow day regression — matches a plain daily return", () => {
    const vNow = 22834.1;
    const vPrev = 22164.66;
    const netFlowsToday = 0;
    expect(dailyChangeAmount(vNow, vPrev, netFlowsToday)).toBeCloseTo(669.44, 2);
    expect(dailyChangePercent(vNow, vPrev, netFlowsToday)).toBeCloseTo(0.0302, 4);
  });

  it("returns 0% when there is no prior value to compare against", () => {
    expect(dailyChangePercent(100, 0, 0)).toBe(0);
  });
});

describe("netFlowsForDate", () => {
  it("nets buys positive and sells negative for the given date only", () => {
    const trades = [
      { date: "2026-07-22", action: "buy" as const, total: 2775.0 },
      { date: "2026-07-21", action: "buy" as const, total: 500 },
      { date: "2026-07-22", action: "sell" as const, total: 100 },
    ];
    expect(netFlowsForDate(trades, "2026-07-22")).toBeCloseTo(2675.0, 2);
  });

  it("returns 0 when there are no trades on that date", () => {
    expect(netFlowsForDate([{ date: "2026-07-21", action: "buy", total: 500 }], "2026-07-22")).toBe(0);
  });
});
