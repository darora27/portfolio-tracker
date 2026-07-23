import { describe, expect, it } from "vitest";
import { dailyReturns } from "./returns";
import { twr } from "./twr";
import {
  steadyMarket,
  techTilt,
  aiConcentrate,
  simulateRebalanced,
  firstTradingDayOfEachMonth,
  type CloseMap,
} from "./sim-portfolio";

function toCloseMap(byTicker: Record<string, Record<string, number>>): CloseMap {
  const map: CloseMap = new Map();
  for (const [ticker, closes] of Object.entries(byTicker)) {
    map.set(ticker, new Map(Object.entries(closes)));
  }
  return map;
}

describe("firstTradingDayOfEachMonth", () => {
  it("keeps only the first date seen per calendar month", () => {
    const dates = ["2026-06-24", "2026-06-25", "2026-06-30", "2026-07-01", "2026-07-15"];
    expect(firstTradingDayOfEachMonth(dates)).toEqual(new Set(["2026-06-24", "2026-07-01"]));
  });
});

describe("Identity fixture: Steady Market == the dashboard's own same-period VOO return", () => {
  it("matches to within 1e-9", () => {
    const dates = ["2026-06-24", "2026-06-26", "2026-06-30", "2026-07-08", "2026-07-22"];
    const vooCloses = new Map([
      ["2026-06-24", 550.12],
      ["2026-06-26", 555.4],
      ["2026-06-30", 548.9],
      ["2026-07-08", 561.2],
      ["2026-07-22", 570.75],
    ]);

    const sim = steadyMarket(dates, vooCloses);

    // Same technique computeBenchmarkComparison uses for "the benchmark's
    // own same-period TWR": a synthetic no-flow snapshot series over the
    // raw closes, dailyReturns + twr.
    const dashboardVooReturns = dailyReturns(
      dates.map((date) => ({ date, totalCost: 0, totalValue: vooCloses.get(date)! })),
    );
    const dashboardVooTwr = twr(dashboardVooReturns);

    expect(Math.abs(sim.twrPct - dashboardVooTwr)).toBeLessThan(1e-9);
  });
});

describe("Tech Tilt synthetic fixture", () => {
  it("50/50 VOO/XLK, one buy, closes A:[100,110] B:[100,90] -> 0.00% exactly", () => {
    const dates = ["2026-06-24", "2026-06-25"]; // same month -> only the inception buy, no second rebalance
    const closes = toCloseMap({
      VOO: { "2026-06-24": 100, "2026-06-25": 110 },
      XLK: { "2026-06-24": 100, "2026-06-25": 90 },
    });

    const sim = techTilt(dates, closes);

    expect(sim.valueSeries.map((v) => v.value)).toEqual([10000, 10000]);
    expect(sim.twrPct).toBe(0);
  });
});

describe("AI Concentrate synthetic fixture", () => {
  it("two qualifying tickers, closes day0 100&200 dayN 110&190 -> 50sh+25sh -> $10,250 -> +2.50% exactly", () => {
    // This fixture tests the shared rebalance engine's equal-weight math
    // directly (bypassing the "fewer than 3 -> VOO" business rule, which
    // is a separate concern of aiConcentrate() itself, tested below) —
    // exactly 2 tickers is the point of the fixture.
    const dates = ["2026-06-24", "2026-07-10"];
    const closes = toCloseMap({
      A: { "2026-06-24": 100, "2026-07-10": 110 },
      B: { "2026-06-24": 200, "2026-07-10": 190 },
    });
    const rebalanceDates = firstTradingDayOfEachMonth(dates);

    const sim = simulateRebalanced(
      "AI Concentrate (fixture)",
      dates,
      closes,
      rebalanceDates,
      () => [
        { ticker: "A", weight: 0.5 },
        { ticker: "B", weight: 0.5 },
      ],
      () => "monthly rebalance: rule = equal-weight High-AI holdings",
    );

    // 5000/100 = 50 sh of A, 5000/200 = 25 sh of B.
    expect(sim.valueSeries[0].value).toBe(10000);
    expect(sim.valueSeries[1].value).toBeCloseTo(50 * 110 + 25 * 190, 10); // 5500 + 4750 = 10250
    expect(sim.twrPct).toBeCloseTo(0.025, 10);
  });
});

describe("aiConcentrate's <3-qualifying business rule", () => {
  it("falls back to 100% VOO for a rebalance date where fewer than 3 qualifying tickers have a close", () => {
    const dates = ["2026-06-24", "2026-07-01"];
    const closes = toCloseMap({
      VOO: { "2026-06-24": 100, "2026-07-01": 105 },
      A: { "2026-06-24": 50, "2026-07-01": 55 },
      B: { "2026-06-24": 20, "2026-07-01": 22 },
    });

    const sim = aiConcentrate(dates, closes, ["A", "B"]); // only 2 qualifying tickers

    expect(sim.trades[0]).toMatchObject({ ticker: "VOO", action: "buy" });
    expect(sim.valueSeries[1].value).toBeCloseTo(10000 * (105 / 100), 10);
  });

  it("equal-weights across 3+ qualifying tickers that all have a close", () => {
    const dates = ["2026-06-24"];
    const closes = toCloseMap({
      A: { "2026-06-24": 10 },
      B: { "2026-06-24": 20 },
      C: { "2026-06-24": 40 },
    });

    const sim = aiConcentrate(dates, closes, ["A", "B", "C"]);

    const buys = sim.trades.filter((t) => t.action === "buy");
    expect(buys).toHaveLength(3);
    for (const trade of buys) {
      const price = closes.get(trade.ticker)!.get("2026-06-24")!;
      expect(trade.shares * price).toBeCloseTo(10000 / 3, 6);
    }
  });

  it("skips a qualifying ticker missing a close on the rebalance date and renormalizes among the rest", () => {
    const dates = ["2026-06-24"];
    const closes = toCloseMap({
      A: { "2026-06-24": 10 },
      B: { "2026-06-24": 20 },
      C: { "2026-06-24": 40 },
      // D has no close at all on 2026-06-24
    });

    const sim = aiConcentrate(dates, closes, ["A", "B", "C", "D"]);

    expect(sim.trades.some((t) => t.ticker === "D")).toBe(false);
    const buys = sim.trades.filter((t) => t.action === "buy");
    expect(buys).toHaveLength(3);
    expect(sim.valueSeries[0].value).toBe(10000);
  });
});

describe("steadyMarket trade log", () => {
  it("logs a single initial-purchase trade", () => {
    const sim = steadyMarket(["2026-06-24"], new Map([["2026-06-24", 100]]));
    expect(sim.trades).toEqual([
      { date: "2026-06-24", ticker: "VOO", shares: 100, action: "buy", reason: "initial purchase: 100% VOO, buy and hold" },
    ]);
  });
});
