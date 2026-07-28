import { describe, expect, it } from "vitest";
import type { Database } from "@/lib/supabase/types";
import { buildPublicTradeLog } from "./public-trade-log";

type TradeRow = Database["public"]["Tables"]["trades"]["Row"];

const trades: TradeRow[] = [
  {
    id: 1,
    date: "2026-07-01",
    ticker: "IBM",
    action: "buy",
    shares: 10,
    price: 10,
    total: 100,
    reason: "CANARY_REASON",
    realized_gain: null,
  },
  {
    id: 2,
    date: "2026-07-02",
    ticker: "MSFT",
    action: "buy",
    shares: 5,
    price: 20,
    total: 100,
    reason: null,
    realized_gain: null,
  },
  {
    id: 3,
    date: "2026-07-03",
    ticker: "IBM",
    action: "sell",
    shares: 5,
    price: 12,
    total: 60,
    reason: null,
    realized_gain: 10,
  },
];

describe("public captain's log projection", () => {
  it("computes the first buy, later buy, and sell against post-trade cost basis", () => {
    expect(buildPublicTradeLog(trades)).toEqual([
      {
        date: "2026-07-03",
        action: "sell",
        ticker: "IBM",
        impactPct: -0.4,
        realizedSign: 1,
      },
      {
        date: "2026-07-02",
        action: "buy",
        ticker: "MSFT",
        impactPct: 0.5,
        realizedSign: 0,
      },
      {
        date: "2026-07-01",
        action: "buy",
        ticker: "IBM",
        impactPct: 1,
        realizedSign: 0,
      },
    ]);
  });

  it("returns only the five authorized fields and honors the entry cap", () => {
    const [entry] = buildPublicTradeLog(trades, 1);
    expect(Object.keys(entry).sort()).toEqual([
      "action",
      "date",
      "impactPct",
      "realizedSign",
      "ticker",
    ]);
    expect(JSON.stringify(entry)).not.toMatch(
      /shares|price|total|reason|realized_gain|CANARY_REASON/,
    );
  });
});
