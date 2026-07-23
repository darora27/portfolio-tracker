import { describe, expect, it } from "vitest";
import { buildHoldingsPerformance } from "./holdings-performance";

describe("buildHoldingsPerformance", () => {
  it("normalizes each ticker to % return since its own first data point", () => {
    const positions = [
      { ticker: "AAA", weight: 0.6 },
      { ticker: "BBB", weight: 0.4 },
    ];
    const prices = new Map([
      [
        "AAA",
        [
          { date: "2026-07-01", price: 100 },
          { date: "2026-07-02", price: 110 },
        ],
      ],
      [
        "BBB",
        [
          { date: "2026-07-02", price: 50 },
          { date: "2026-07-03", price: 45 },
        ],
      ],
    ]);

    const result = buildHoldingsPerformance(positions, prices, 8);

    expect(result.hasOther).toBe(false);
    expect(result.tickers).toEqual(["AAA", "BBB"]);
    expect(result.points).toHaveLength(3);
    expect(result.points[0]).toEqual({ date: "2026-07-01", AAA: 0 });
    expect(result.points[1].date).toBe("2026-07-02");
    expect(result.points[1].AAA).toBeCloseTo(10, 10);
    expect(result.points[1].BBB).toBeCloseTo(0, 10);
    expect(result.points[2].date).toBe("2026-07-03");
    expect(result.points[2].BBB).toBeCloseTo(-10, 10);
    expect(result.points[2].AAA).toBeUndefined();
  });

  it("folds holdings beyond maxSeries into a weight-weighted Other line", () => {
    const positions = [
      { ticker: "BIG", weight: 0.7 },
      { ticker: "SMALL1", weight: 0.2 },
      { ticker: "SMALL2", weight: 0.1 },
    ];
    const prices = new Map([
      ["BIG", [{ date: "2026-07-01", price: 100 }]],
      [
        "SMALL1",
        [
          { date: "2026-07-01", price: 10 },
          { date: "2026-07-02", price: 12 }, // +20%
        ],
      ],
      [
        "SMALL2",
        [
          { date: "2026-07-01", price: 20 },
          { date: "2026-07-02", price: 22 }, // +10%
        ],
      ],
    ]);

    const result = buildHoldingsPerformance(positions, prices, 1);

    expect(result.hasOther).toBe(true);
    expect(result.tickers).toEqual(["BIG"]);
    // Other on 07-02 = (0.2*20 + 0.1*10) / (0.2+0.1) = (4+1)/0.3 = 16.666...
    const day2 = result.points.find((p) => p.date === "2026-07-02")!;
    expect(day2.Other).toBeCloseTo(16.6667, 3);
  });

  it("renormalizes Other's weights among only the folded tickers that have data on a given date", () => {
    const positions = [
      { ticker: "BIG", weight: 0.5 },
      { ticker: "EARLY", weight: 0.3 },
      { ticker: "LATE", weight: 0.2 },
    ];
    const prices = new Map([
      ["BIG", [{ date: "2026-07-01", price: 100 }]],
      [
        "EARLY",
        [
          { date: "2026-07-01", price: 10 },
          { date: "2026-07-02", price: 15 }, // +50%
        ],
      ],
      ["LATE", [{ date: "2026-07-02", price: 5 }]], // starts a day later, so 0% on its own first day
    ]);

    const result = buildHoldingsPerformance(positions, prices, 1);
    const day2 = result.points.find((p) => p.date === "2026-07-02")!;
    // Only EARLY (+50) and LATE (0) have data on 07-02; renormalized weights 0.3/(0.3+0.2)=0.6, 0.2/0.5=0.4
    expect(day2.Other).toBeCloseTo(0.6 * 50 + 0.4 * 0, 5);
  });

  it("has no Other line when holdings fit within maxSeries", () => {
    const positions = [{ ticker: "ONLY", weight: 1 }];
    const prices = new Map([["ONLY", [{ date: "2026-07-01", price: 10 }]]]);
    const result = buildHoldingsPerformance(positions, prices, 8);
    expect(result.hasOther).toBe(false);
    expect(result.points[0].Other).toBeUndefined();
  });

  it("handles a ticker with no price history gracefully (no NaN, no crash)", () => {
    const positions = [{ ticker: "NOPRICE", weight: 1 }];
    const result = buildHoldingsPerformance(positions, new Map(), 8);
    expect(result.points).toEqual([]);
  });
});
