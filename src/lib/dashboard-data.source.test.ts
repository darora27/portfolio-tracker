import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  from,
  getQuotes,
  getUpcomingEarnings,
  getCompanyNews,
} = vi.hoisted(() => ({
  from: vi.fn(),
  getQuotes: vi.fn(),
  getUpcomingEarnings: vi.fn(),
  getCompanyNews: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: { from },
}));

vi.mock("@/lib/finnhub", () => ({
  getQuotes,
  getUpcomingEarnings,
  getCompanyNews,
}));

vi.mock("@/lib/date", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/date")>();
  return {
    ...actual,
    todayInTimeZone: () => "2026-07-27",
  };
});

import { getDashboardData } from "./dashboard-data";

const source = readFileSync(path.resolve(__dirname, "dashboard-data.ts"), "utf8");

describe("dashboard-data §8 public projection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("projects day return without exposing dollar-bearing position fields", () => {
    expect(source).toContain("dayReturn:");
    expect(source).toContain("positionRows.find");
    expect(source).toContain("?.dayPct");
  });

  it("derives sticky prior membership from the latest prior snapshot", () => {
    expect(source).toContain("previousSnapshotRecord");
    expect(source).toContain("snapshot.date < today");
    expect(source).toContain("position.value / previousSnapshotRecord.total_value");
    expect(source).toContain("resolveBeltMembership(");
  });

  it("populates dayReturn and derives sticky belt membership from prior snapshot rows", async () => {
    const tickers = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "NEW", "OLD"];
    const currentPrices = new Map([
      ["P1", 20],
      ["P2", 19],
      ["P3", 18],
      ["P4", 17],
      ["P5", 16],
      ["P6", 15],
      ["P7", 14],
      ["NEW", 3.8],
      ["OLD", 3.7],
    ]);
    const priorClose = new Map(tickers.map((ticker) => [ticker, 10]));
    priorClose.set("NEW", 3.5);
    priorClose.set("OLD", 3.6);

    const trades = tickers.map((ticker) => ({
      date: "2026-07-20",
      ticker,
      action: "buy" as const,
      shares: 1,
      price: priorClose.get(ticker)!,
      realized_gain: null,
    }));
    const snapshots = [
      {
        id: 41,
        date: "2026-07-26",
        total_cost: 126.5,
        total_value: 126.5,
      },
    ];
    const previousValues = new Map([
      ["P1", 20],
      ["P2", 19],
      ["P3", 18],
      ["P4", 17],
      ["P5", 16],
      ["P6", 15],
      ["P7", 14],
      ["OLD", 4],
      ["NEW", 3],
    ]);
    const snapshotPositions = tickers.map((ticker) => ({
      snapshot_id: 41,
      ticker,
      close_price: priorClose.get(ticker)!,
      value: previousValues.get(ticker)!,
    }));
    const rows = {
      trades,
      snapshots,
      snapshot_positions: snapshotPositions,
      benchmarks: [],
      ticker_sector: [],
    };

    from.mockImplementation((table: keyof typeof rows) => ({
      select: vi.fn(() => {
        if (table === "snapshot_positions") {
          return Promise.resolve({ data: rows[table], error: null });
        }
        if (table === "benchmarks") {
          return {
            in: vi.fn().mockResolvedValue({ data: rows[table], error: null }),
          };
        }
        return {
          order: vi.fn().mockResolvedValue({ data: rows[table], error: null }),
        };
      }),
    }));
    getQuotes.mockResolvedValue(
      new Map(
        [...currentPrices].map(([ticker, price]) => [
          ticker,
          { price, timestamp: 1_722_038_400 },
        ]),
      ),
    );
    getUpcomingEarnings.mockResolvedValue([]);
    getCompanyNews.mockResolvedValue([]);

    const result = await getDashboardData();

    expect(
      result.publicOrreryHoldings.find(({ ticker }) => ticker === "NEW")
        ?.dayReturn,
    ).toBeCloseTo(3.8 / 3.5 - 1, 12);
    expect(result.orreryBelt).toEqual({
      planetTickers: ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "OLD"],
      beltTickers: ["NEW"],
    });

    getCompanyNews.mockRejectedValue(new Error("news source offline"));
    const degraded = await getDashboardData();
    expect(degraded.newsByHolding?.NEW).toEqual([]);
    expect(
      degraded.publicOrreryHoldings.find(({ ticker }) => ticker === "NEW")
        ?.newsCount,
    ).toBe(0);

    // FB-24 (§13): a holding with news items that have no usable http(s) URL
    // must not produce a moon -- newsCount has to match the same linkable
    // predicate PlanetDetail.tsx's click destination uses, not a raw count.
    getCompanyNews.mockImplementation(async (ticker: string) => {
      if (ticker !== "NEW") return [];
      return [
        {
          headline: "NEW reports strong quarter",
          source: "Wire",
          url: "",
          datetime: Math.floor(new Date("2026-07-27").getTime() / 1000),
        },
      ];
    });
    const noLinkableNews = await getDashboardData();
    expect(
      noLinkableNews.publicOrreryHoldings.find(({ ticker }) => ticker === "NEW")
        ?.newsCount,
    ).toBe(0);

    getCompanyNews.mockImplementation(async (ticker: string) => {
      if (ticker !== "NEW") return [];
      return [
        {
          headline: "NEW reports strong quarter",
          source: "Wire",
          url: "https://example.test/new-earnings",
          datetime: Math.floor(new Date("2026-07-27").getTime() / 1000),
        },
      ];
    });
    const withLinkableNews = await getDashboardData();
    expect(
      withLinkableNews.publicOrreryHoldings.find(({ ticker }) => ticker === "NEW")
        ?.newsCount,
    ).toBe(1);
  });

  it("§15: exposes drawdownSeries/dailyReturnBars/compositionHistory, the same getHistoryData() series /history already renders", async () => {
    const trades = [
      { date: "2026-07-01", ticker: "AAA", action: "buy" as const, shares: 1, price: 100, realized_gain: null },
    ];
    const snapshots = [
      { id: 1, date: "2026-07-01", total_cost: 100, total_value: 100 },
      { id: 2, date: "2026-07-02", total_cost: 100, total_value: 110 },
      { id: 3, date: "2026-07-03", total_cost: 100, total_value: 99 },
    ];
    const snapshotPositions = [
      { snapshot_id: 1, ticker: "AAA", close_price: 100, value: 100 },
      { snapshot_id: 2, ticker: "AAA", close_price: 110, value: 110 },
      { snapshot_id: 3, ticker: "AAA", close_price: 99, value: 99 },
    ];
    const rows = {
      trades,
      snapshots,
      snapshot_positions: snapshotPositions,
      benchmarks: [],
      ticker_sector: [],
    };

    from.mockImplementation((table: keyof typeof rows) => ({
      select: vi.fn(() => {
        if (table === "snapshot_positions") {
          return Promise.resolve({ data: rows[table], error: null });
        }
        if (table === "benchmarks") {
          return {
            in: vi.fn().mockResolvedValue({ data: rows[table], error: null }),
          };
        }
        return {
          order: vi.fn().mockResolvedValue({ data: rows[table], error: null }),
        };
      }),
    }));
    getQuotes.mockResolvedValue(new Map([["AAA", { price: 99, timestamp: 1_722_038_400 }]]));
    getUpcomingEarnings.mockResolvedValue([]);
    getCompanyNews.mockResolvedValue([]);

    const result = await getDashboardData();

    expect(result.drawdownSeries.map((p) => p.date)).toEqual([
      "2026-07-01",
      "2026-07-02",
      "2026-07-03",
    ]);
    expect(result.drawdownSeries[0].drawdown).toBeCloseTo(0, 10);
    expect(result.drawdownSeries[1].drawdown).toBeCloseTo(0, 10);
    expect(result.drawdownSeries[2].drawdown).toBeCloseTo(-0.1, 10);
    expect(result.dailyReturnBars.map((p) => p.date)).toEqual([
      "2026-07-02",
      "2026-07-03",
    ]);
    expect(result.dailyReturnBars[0].return).toBeCloseTo(0.1, 10);
    expect(result.dailyReturnBars[1].return).toBeCloseTo(-0.1, 10);
    expect(result.compositionHistory.tickers).toEqual(["AAA"]);
    expect(result.compositionHistory.hasOther).toBe(false);
    expect(result.compositionHistory.points).toEqual([
      { date: "2026-07-01", AAA: 100 },
      { date: "2026-07-02", AAA: 100 },
      { date: "2026-07-03", AAA: 100 },
    ]);
  });
});
