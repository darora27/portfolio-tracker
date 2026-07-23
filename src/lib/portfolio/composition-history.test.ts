import { describe, expect, it } from "vitest";
import { buildCompositionHistory } from "./composition-history";

describe("buildCompositionHistory", () => {
  it("computes weight % per ticker per date", () => {
    const valueByDateByTicker = new Map([
      ["2026-07-01", new Map([["AAA", 60], ["BBB", 40]])],
      ["2026-07-02", new Map([["AAA", 70], ["BBB", 30]])],
    ]);
    const totalValueByDate = new Map([
      ["2026-07-01", 100],
      ["2026-07-02", 100],
    ]);

    const result = buildCompositionHistory(["AAA", "BBB"], valueByDateByTicker, totalValueByDate, 8);

    expect(result.hasOther).toBe(false);
    expect(result.points).toEqual([
      { date: "2026-07-01", AAA: 60, BBB: 40 },
      { date: "2026-07-02", AAA: 70, BBB: 30 },
    ]);
  });

  it("defaults a ticker not yet purchased (or already sold) to 0%, not a gap", () => {
    const valueByDateByTicker = new Map([
      ["2026-07-01", new Map([["AAA", 100]])], // BBB not bought yet
      ["2026-07-02", new Map([["AAA", 50], ["BBB", 50]])],
    ]);
    const totalValueByDate = new Map([
      ["2026-07-01", 100],
      ["2026-07-02", 100],
    ]);

    const result = buildCompositionHistory(["AAA", "BBB"], valueByDateByTicker, totalValueByDate, 8);
    expect(result.points[0]).toEqual({ date: "2026-07-01", AAA: 100, BBB: 0 });
  });

  it("folds tickers beyond maxSeries into an Other band that sums correctly", () => {
    const valueByDateByTicker = new Map([["2026-07-01", new Map([["BIG", 70], ["S1", 20], ["S2", 10]])]]);
    const totalValueByDate = new Map([["2026-07-01", 100]]);

    const result = buildCompositionHistory(["BIG", "S1", "S2"], valueByDateByTicker, totalValueByDate, 1);
    expect(result.hasOther).toBe(true);
    expect(result.tickers).toEqual(["BIG"]);
    expect(result.points[0]).toEqual({ date: "2026-07-01", BIG: 70, Other: 30 });
  });

  it("handles a zero total value day without dividing by zero", () => {
    const valueByDateByTicker = new Map([["2026-07-01", new Map()]]);
    const totalValueByDate = new Map([["2026-07-01", 0]]);
    const result = buildCompositionHistory(["AAA"], valueByDateByTicker, totalValueByDate, 8);
    expect(result.points[0]).toEqual({ date: "2026-07-01", AAA: 0 });
  });
});
