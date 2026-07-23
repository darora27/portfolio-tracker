import { describe, expect, it } from "vitest";
import { buildHistoryRows } from "./history";

describe("buildHistoryRows", () => {
  it("first row has no day change and 0% cumulative TWR", () => {
    const rows = buildHistoryRows([{ date: "2026-07-01", totalCost: 1000, totalValue: 1000 }]);
    expect(rows).toEqual([
      { date: "2026-07-01", invested: 1000, value: 1000, day: null, dayPct: null, cumulativeTwr: 0 },
    ]);
  });

  // Matches the §1 daily-change fixture exactly, applied via cost-basis
  // delta (closed days) instead of live trades — same formula either way.
  it("2026-07-22 sanity fixture: a same-day deposit doesn't inflate Day $/%", () => {
    const rows = buildHistoryRows([
      { date: "2026-07-21", totalCost: 20000, totalValue: 22834.1 },
      { date: "2026-07-22", totalCost: 22775, totalValue: 25341.75 }, // +2775 cost = the deposit
    ]);
    const today = rows[1];
    expect(today.day).toBeCloseTo(-267.35, 2);
    expect(today.dayPct).toBeCloseTo(-0.01171, 4);
  });

  it("no-flow day regression matches a plain daily return", () => {
    const rows = buildHistoryRows([
      { date: "2026-07-19", totalCost: 20000, totalValue: 22164.66 },
      { date: "2026-07-20", totalCost: 20000, totalValue: 22834.1 },
    ]);
    expect(rows[1].day).toBeCloseTo(669.44, 2);
    expect(rows[1].dayPct).toBeCloseTo(0.0302, 4);
  });

  it("cumulative TWR chains daily returns as a growth index minus 1", () => {
    const rows = buildHistoryRows([
      { date: "2026-01-01", totalCost: 100, totalValue: 100 },
      { date: "2026-01-02", totalCost: 100, totalValue: 110 }, // +10%
      { date: "2026-01-03", totalCost: 100, totalValue: 121 }, // +10% again
    ]);
    expect(rows[0].cumulativeTwr).toBe(0);
    expect(rows[1].cumulativeTwr).toBeCloseTo(0.1, 10);
    expect(rows[2].cumulativeTwr).toBeCloseTo(0.21, 10);
  });
});
