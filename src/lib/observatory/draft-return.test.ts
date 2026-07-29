import { describe, expect, it } from "vitest";
import { simulateRebalanced, type CloseMap } from "@/lib/math/sim-portfolio";
import { draftUnitsFromWeights } from "./draft-ledger";
import { mixHeldReturn } from "./draft-return";

describe("DRAFT mix-held return identity", () => {
  it("matches one window-start rebalance in the existing simulator to 1e-9", () => {
    const dates = ["2026-07-20", "2026-07-21", "2026-07-22", "2026-07-23"];
    const closes: CloseMap = new Map([
      ["ASML", new Map([
        [dates[0], 100], [dates[1], 103], [dates[2], 101], [dates[3], 106],
      ])],
      ["GOOG", new Map([
        [dates[0], 200], [dates[1], 198], [dates[2], 205], [dates[3], 208],
      ])],
      ["MSFT", new Map([
        [dates[0], 50], [dates[1], 51], [dates[2], 52], [dates[3], 49],
      ])],
      ["IBM", new Map([
        [dates[0], 80], [dates[1], 82], [dates[2], 83], [dates[3], 84],
      ])],
      ["COST", new Map([
        [dates[0], 900], [dates[1], 905], [dates[2], 899], [dates[3], 918],
      ])],
      ["INTC", new Map([
        [dates[0], 25], [dates[1], 24], [dates[2], 26], [dates[3], 27],
      ])],
      ["NBIS", new Map([
        [dates[0], 40], [dates[1], 44], [dates[2], 43], [dates[3], 47],
      ])],
      ["CBRS", new Map([
        [dates[0], 60], [dates[1], 58], [dates[2], 59], [dates[3], 55],
      ])],
    ]);
    const tickers = [...closes.keys()];
    const units = draftUnitsFromWeights([26, 20, 14, 10, 10, 8, 6, 6]);
    const returns = tickers.map((ticker) => {
      const series = closes.get(ticker)!;
      return series.get(dates.at(-1)!)! / series.get(dates[0])! - 1;
    });
    const simulated = simulateRebalanced(
      "DRAFT identity",
      dates,
      closes,
      new Set(),
      () => tickers.map((ticker, index) => ({
        ticker,
        weight: units[index] / 200,
      })),
      () => "window-start identity",
    );

    expect(mixHeldReturn(units, returns)).toBeCloseTo(simulated.twrPct, 9);
  });
});
