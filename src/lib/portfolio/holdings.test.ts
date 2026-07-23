import { describe, expect, it } from "vitest";
import {
  buildXirrCashFlows,
  computeHoldings,
  concentration,
  dayChange,
  latestKnownPrices,
  mergePrices,
  resolvePrevClose,
  topWinnersLosers,
  type Trade,
} from "./holdings";

describe("computeHoldings", () => {
  it("sums buys minus sells per ticker and values at the latest known price", () => {
    const trades: Trade[] = [
      { date: "2026-01-01", ticker: "AAA", action: "buy", shares: 10, price: 100 },
      { date: "2026-01-05", ticker: "AAA", action: "buy", shares: 5, price: 120 },
      { date: "2026-01-10", ticker: "AAA", action: "sell", shares: 3, price: 130 },
    ];
    // shares = 10 + 5 - 3 = 12
    // costBasis = 10*100 + 5*120 - 3*130 = 1000 + 600 - 390 = 1210
    const prices = new Map([["AAA", { price: 150, date: "2026-01-15" }]]);

    const positions = computeHoldings(trades, prices);

    expect(positions).toHaveLength(1);
    expect(positions[0].shares).toBe(12);
    expect(positions[0].costBasis).toBeCloseTo(1210, 10);
    expect(positions[0].value).toBeCloseTo(12 * 150, 10); // 1800
    expect(positions[0].gain).toBeCloseTo(1800 - 1210, 10); // 590
    expect(positions[0].gainPct).toBeCloseTo(590 / 1210, 10);
    expect(positions[0].weight).toBe(1);
  });

  it("excludes tickers that have been fully sold out", () => {
    const trades: Trade[] = [
      { date: "2026-01-01", ticker: "AAA", action: "buy", shares: 10, price: 100 },
      { date: "2026-01-10", ticker: "AAA", action: "sell", shares: 10, price: 110 },
    ];
    expect(computeHoldings(trades, new Map())).toEqual([]);
  });

  it("falls back to cost basis with null price/gain when no price is known", () => {
    const trades: Trade[] = [
      { date: "2026-01-01", ticker: "AAA", action: "buy", shares: 3, price: 925 },
    ];
    const positions = computeHoldings(trades, new Map());

    expect(positions[0].price).toBeNull();
    expect(positions[0].priceAsOf).toBeNull();
    expect(positions[0].gain).toBeNull();
    expect(positions[0].gainPct).toBeNull();
    expect(positions[0].value).toBeCloseTo(3 * 925, 10); // priced at cost, not $0
  });

  it("computes weights proportional to value across multiple positions", () => {
    const trades: Trade[] = [
      { date: "2026-01-01", ticker: "AAA", action: "buy", shares: 1, price: 100 },
      { date: "2026-01-01", ticker: "BBB", action: "buy", shares: 1, price: 300 },
    ];
    const prices = new Map([
      ["AAA", { price: 100, date: "2026-01-02" }],
      ["BBB", { price: 300, date: "2026-01-02" }],
    ]);
    const positions = computeHoldings(trades, prices);
    const aaa = positions.find((p) => p.ticker === "AAA")!;
    const bbb = positions.find((p) => p.ticker === "BBB")!;
    expect(aaa.weight).toBeCloseTo(0.25, 10);
    expect(bbb.weight).toBeCloseTo(0.75, 10);
  });
});

describe("latestKnownPrices", () => {
  it("keeps only the most recent price per ticker", () => {
    const prices = latestKnownPrices([
      { ticker: "AAA", closePrice: 100, date: "2026-01-01" },
      { ticker: "AAA", closePrice: 110, date: "2026-01-05" },
      { ticker: "AAA", closePrice: 105, date: "2026-01-03" },
    ]);
    expect(prices.get("AAA")).toEqual({ price: 110, date: "2026-01-05" });
  });
});

describe("mergePrices", () => {
  it("prefers a live quote over the fallback for the same ticker", () => {
    const live = new Map([["AAA", { price: 150, date: "2026-07-22" }]]);
    const fallback = new Map([["AAA", { price: 140, date: "2026-07-21" }]]);
    expect(mergePrices(live, fallback).get("AAA")).toEqual({ price: 150, date: "2026-07-22" });
  });

  it("falls back to the stale price when a ticker has no live quote", () => {
    const live = new Map<string, { price: number; date: string }>();
    const fallback = new Map([["AAA", { price: 140, date: "2026-07-21" }]]);
    expect(mergePrices(live, fallback).get("AAA")).toEqual({ price: 140, date: "2026-07-21" });
  });

  it("has no price at all for a ticker present in neither map", () => {
    expect(mergePrices(new Map(), new Map()).get("AAA")).toBeUndefined();
  });
});

describe("topWinnersLosers", () => {
  it("ranks by gainPct and excludes positions with an unknown price", () => {
    const positions = [
      { ticker: "UP", gainPct: 0.5 },
      { ticker: "DOWN", gainPct: -0.3 },
      { ticker: "FLAT", gainPct: 0 },
      { ticker: "UNKNOWN", gainPct: null },
    ] as never[];
    const { winners, losers } = topWinnersLosers(positions as never, 2);
    expect(winners.map((p) => p.ticker)).toEqual(["UP", "FLAT"]);
    expect(losers.map((p) => p.ticker)).toEqual(["DOWN", "FLAT"]);
  });
});

describe("concentration", () => {
  it("computes top-2 weight sum and HHI on a 0-10000 scale", () => {
    // Four equal-weight positions of 0.25 each:
    // top2 = 0.5; HHI = 4 * 0.25^2 * 10000 = 2500
    const positions = [{ weight: 0.25 }, { weight: 0.25 }, { weight: 0.25 }, { weight: 0.25 }];
    const result = concentration(positions as never);
    expect(result.top2).toBeCloseTo(0.5, 10);
    expect(result.hhi).toBeCloseTo(2500, 10);
  });

  it("is 10000 (max concentration) for a single position", () => {
    const result = concentration([{ weight: 1 }] as never);
    expect(result.top2).toBe(1);
    expect(result.hhi).toBe(10000);
  });
});

describe("dayChange", () => {
  // Real 2026-07-22 data.
  it("COST: bought today, prevClose is the purchase price", () => {
    const result = dayChange(3, 927.31, 925.0);
    expect(result.day).toBeCloseTo(6.93, 2);
    expect(result.dayPct).toBeCloseTo(0.0025, 4);
  });

  it("INTC: a losing day against yesterday's close", () => {
    const result = dayChange(20, 102.62, 105.45);
    expect(result.day).toBeCloseTo(-56.6, 2);
    expect(result.dayPct).toBeCloseTo(-0.0268, 4);
  });

  it("is null when either price is unavailable", () => {
    expect(dayChange(10, null, 100)).toEqual({ day: null, dayPct: null });
    expect(dayChange(10, 100, null)).toEqual({ day: null, dayPct: null });
  });
});

describe("resolvePrevClose", () => {
  it("uses the purchase price when the first trade is today", () => {
    const result = resolvePrevClose("2026-07-22", 925.0, { price: 900, date: "2026-07-21" }, "2026-07-22");
    expect(result).toEqual({ prevClose: 925.0, boughtToday: true });
  });

  it("uses the prior snapshot close otherwise", () => {
    const result = resolvePrevClose("2026-06-01", 500, { price: 105.45, date: "2026-07-21" }, "2026-07-22");
    expect(result).toEqual({ prevClose: 105.45, boughtToday: false });
  });

  it("has no prevClose when neither a today-trade price nor a prior close exists", () => {
    const result = resolvePrevClose(undefined, undefined, undefined, "2026-07-22");
    expect(result).toEqual({ prevClose: null, boughtToday: false });
  });
});

describe("buildXirrCashFlows", () => {
  it("signs buys negative, sells positive, and appends the final valuation", () => {
    const trades: Trade[] = [
      { date: "2026-01-01", ticker: "AAA", action: "buy", shares: 10, price: 100 },
      { date: "2026-02-01", ticker: "AAA", action: "sell", shares: 4, price: 120 },
    ];
    const flows = buildXirrCashFlows(trades, 900, "2026-03-01");
    expect(flows).toEqual([
      { date: "2026-01-01", amount: -1000 },
      { date: "2026-02-01", amount: 480 },
      { date: "2026-03-01", amount: 900 },
    ]);
  });
});
