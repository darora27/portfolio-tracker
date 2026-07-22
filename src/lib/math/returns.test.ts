import { describe, expect, it } from "vitest";
import { dailyReturns } from "./returns";

describe("dailyReturns", () => {
  it("computes r_t = (V_t - F_t) / V_{t-1} - 1 net of cash flows", () => {
    // Day1: $500 deposited (cost 1000 -> 1500), value grows to 1600.
    //   F_1 = 500; r_1 = (1600 - 500) / 1000 - 1 = 0.10
    // Day2: no deposit (cost stays 1500), value grows to 1650.
    //   F_2 = 0; r_2 = (1650 - 0) / 1600 - 1 = 0.03125
    const snapshots = [
      { date: "2026-01-01", totalCost: 1000, totalValue: 1000 },
      { date: "2026-01-02", totalCost: 1500, totalValue: 1600 },
      { date: "2026-01-03", totalCost: 1500, totalValue: 1650 },
    ];

    const returns = dailyReturns(snapshots);

    expect(returns).toHaveLength(2);
    expect(returns[0]).toBeCloseTo(0.1, 10);
    expect(returns[1]).toBeCloseTo(0.03125, 10);
  });

  it("returns an empty array when there is only one snapshot", () => {
    expect(dailyReturns([{ date: "2026-01-01", totalCost: 1000, totalValue: 1000 }])).toEqual([]);
  });

  it("nets out a withdrawal (negative flow) the same way as a deposit", () => {
    // Cost drops by 200 (a sale); value drops from 1000 to 850.
    // F = -200; r = (850 - (-200)) / 1000 - 1 = 1050/1000 - 1 = 0.05
    const snapshots = [
      { date: "2026-01-01", totalCost: 1000, totalValue: 1000 },
      { date: "2026-01-02", totalCost: 800, totalValue: 850 },
    ];

    expect(dailyReturns(snapshots)[0]).toBeCloseTo(0.05, 10);
  });
});
