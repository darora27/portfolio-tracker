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
  });
});
