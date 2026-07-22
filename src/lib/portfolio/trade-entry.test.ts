import { describe, expect, it } from "vitest";
import { TradeValidationError, validateNewTrade } from "./trade-entry";
import type { Trade } from "./holdings";

describe("validateNewTrade", () => {
  it("computes total and leaves realizedGain null for a buy", () => {
    const result = validateNewTrade([], {
      date: "2026-07-22",
      ticker: "aapl",
      action: "buy",
      shares: 3,
      price: 925,
      reason: null,
    });
    expect(result.ticker).toBe("AAPL"); // normalized to uppercase
    expect(result.total).toBeCloseTo(2775, 10);
    expect(result.realizedGain).toBeNull();
  });

  it("computes realized gain for a sell against average cost basis", () => {
    // buy 10@100, buy 5@120 -> avg cost = 1600/15 = 106.6667
    // sell 3@130 -> gain = 3*(130 - 1600/15) = 390 - 320 = 70 exactly
    const existing: Trade[] = [
      { date: "2026-01-01", ticker: "AAA", action: "buy", shares: 10, price: 100 },
      { date: "2026-01-05", ticker: "AAA", action: "buy", shares: 5, price: 120 },
    ];
    const result = validateNewTrade(existing, {
      date: "2026-01-10",
      ticker: "AAA",
      action: "sell",
      shares: 3,
      price: 130,
      reason: "trim position",
    });
    expect(result.realizedGain).toBeCloseTo(70, 10);
    expect(result.total).toBeCloseTo(390, 10);
  });

  it("rejects selling more shares than are held", () => {
    const existing: Trade[] = [
      { date: "2026-01-01", ticker: "AAA", action: "buy", shares: 5, price: 100 },
    ];
    expect(() =>
      validateNewTrade(existing, {
        date: "2026-01-10",
        ticker: "AAA",
        action: "sell",
        shares: 6,
        price: 110,
        reason: null,
      }),
    ).toThrow(TradeValidationError);
  });

  it("rejects a sell when the ticker has never been bought", () => {
    expect(() =>
      validateNewTrade([], {
        date: "2026-01-10",
        ticker: "ZZZ",
        action: "sell",
        shares: 1,
        price: 10,
        reason: null,
      }),
    ).toThrow(TradeValidationError);
  });

  it("rejects non-positive shares, negative price, missing ticker, and bad dates", () => {
    const base = { date: "2026-01-10", ticker: "AAA", action: "buy" as const, shares: 1, price: 10, reason: null };
    expect(() => validateNewTrade([], { ...base, shares: 0 })).toThrow(TradeValidationError);
    expect(() => validateNewTrade([], { ...base, shares: -1 })).toThrow(TradeValidationError);
    expect(() => validateNewTrade([], { ...base, price: -5 })).toThrow(TradeValidationError);
    expect(() => validateNewTrade([], { ...base, ticker: "  " })).toThrow(TradeValidationError);
    expect(() => validateNewTrade([], { ...base, date: "not-a-date" })).toThrow(TradeValidationError);
  });
});
