import { beforeEach, describe, expect, it, vi } from "vitest";

const { from, getHistoryData } = vi.hoisted(() => ({
  from: vi.fn(),
  getHistoryData: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/supabase/client", () => ({
  supabase: { from },
}));

vi.mock("@/lib/history-data", () => ({
  getHistoryData,
}));

import {
  flowMarkers,
  getPublicTimelineData,
  toPublicTradeMarkers,
} from "./timeline-data";

describe("public Timeline data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("emits only cost changes after the first snapshot", () => {
    expect(flowMarkers([
      { date: "2026-01-01", totalCost: 100 },
      { date: "2026-01-02", totalCost: 125 },
      { date: "2026-01-03", totalCost: 125 },
      { date: "2026-01-04", totalCost: 90 },
    ])).toEqual([
      { date: "2026-01-02", direction: "in" },
      { date: "2026-01-04", direction: "out" },
    ]);
  });

  it("copies only the public trade marker fields", () => {
    expect(toPublicTradeMarkers([
      { date: "2026-01-02", ticker: "IBM", action: "buy" },
      { date: "2026-01-04", ticker: "IBM", action: "sell" },
    ])).toEqual([
      { date: "2026-01-02", ticker: "IBM", action: "buy" },
      { date: "2026-01-04", ticker: "IBM", action: "sell" },
    ]);
  });

  it("selects only public columns and forwards only composition history", async () => {
    const selected: Record<string, string> = {};
    const rows = {
      snapshots: [
        { date: "2026-01-01", total_cost: 100 },
        { date: "2026-01-02", total_cost: 125 },
      ],
      trades: [
        { date: "2026-01-02", ticker: "IBM", action: "buy" as const },
      ],
    };
    from.mockImplementation((table: "snapshots" | "trades") => ({
      select: vi.fn((columns: string) => {
        selected[table] = columns;
        return {
          order: vi.fn().mockResolvedValue({ data: rows[table], error: null }),
        };
      }),
    }));
    const compositionHistory = {
      tickers: ["IBM"],
      hasOther: false,
      points: [{ date: "2026-01-02", IBM: 100 }],
    };
    getHistoryData.mockResolvedValue({
      rows: [{ privateDollarField: 999999.99 }],
      dailyReturnBars: [{ privateMarker: "not forwarded" }],
      drawdownSeries: [],
      compositionHistory,
    });

    await expect(getPublicTimelineData()).resolves.toEqual({
      flowMarkers: [{ date: "2026-01-02", direction: "in" }],
      tradeMarkers: [{ date: "2026-01-02", ticker: "IBM", action: "buy" }],
      compositionHistory,
    });
    expect(selected).toEqual({
      snapshots: "date, total_cost",
      trades: "date, ticker, action",
    });
  });
});
