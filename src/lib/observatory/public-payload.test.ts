// @vitest-environment jsdom
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { DashboardData } from "@/lib/dashboard-data";
import { MissionControlRoomContent } from "@/components/observatory/orrery/MissionControlRoomContent";

/**
 * PRV-01 (§12a) regression canary — none of this section's shared-file
 * edits (orrery.module.css, mission-control-layout.ts,
 * MissionControlRoomContent.tsx) may introduce a new public route, field,
 * or dollar figure. Kept a plain .ts file (no JSX) per this criterion's
 * verifier path.
 */

vi.mock("@/components/observatory/orrery/LazyMissionSection", () => ({
  LazyMissionSection: ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => createElement("section", { id }, createElement("h3", null, title), children),
}));

const data = {
  publicOrreryHoldings: [
    { ticker: "IBM", weight: 0.5, dayReturn: 0.01, weeklyReturn: 0.03 },
    { ticker: "MSFT", weight: 0.5, dayReturn: 0.01, weeklyReturn: 0.03 },
  ],
  positionRows: [
    {
      ticker: "IBM", shares: 10, costBasis: 900_000, price: 99_999.9, priceAsOf: "2026-07-23",
      value: 999_999, gain: 99_999, gainPct: 0.11, weight: 0.53, contribution: 0.11,
      day: 9_000, dayPct: 0.009, isNewToday: false, sparkline: [980_000, 999_999], prevClose: 991_000,
    },
    {
      ticker: "MSFT", shares: 5, costBasis: 800_000, price: 177_777.6, priceAsOf: "2026-07-23",
      value: 888_888, gain: 88_888, gainPct: 0.111, weight: 0.47, contribution: 0.111,
      day: 8_000, dayPct: 0.009, isNewToday: false, sparkline: [880_000, 888_888], prevClose: 880_888,
    },
  ],
  movers: [{ ticker: "IBM", day: 9_000, dayPct: 0.009 }],
  top2ConcentrationPct: 1,
  hhi: 5_000,
  realizedGain: 0,
  unrealizedGain: 188_887,
  donutSlices: [
    { ticker: "IBM", weight: 0.53, value: 999_999 },
    { ticker: "MSFT", weight: 0.47, value: 888_888 },
  ],
  sectorWeights: [],
  aiExposureWeights: [],
  benchmarkComparisons: [
    { ticker: "VOO", available: true, beta: 1, twrPct: 0.01, excessReturnPct: 0, chartIndex: [100] },
    { ticker: "VTI", available: false, beta: null, twrPct: null, excessReturnPct: null, chartIndex: [] },
    { ticker: "XLK", available: false, beta: null, twrPct: null, excessReturnPct: null, chartIndex: [] },
  ],
  holdingsPerformance: { tickers: ["IBM", "MSFT"], hasOther: false, points: [] },
  holdingRisks: [],
  drawdownSeries: [],
  dailyReturnBars: [],
  compositionHistory: { tickers: [], hasOther: false, points: [] },
  publicTradeLog: [
    { date: "2026-07-14", action: "buy", ticker: "IBM", impactPct: 0.021, realizedSign: 0 },
  ],
  upcomingEarnings: [],
  newsByHolding: {},
  chartData: [{ date: "2026-07-01", portfolioIndex: 100 }],
  volatilityPct: 0.2,
  maxDrawdown: 0,
  betaVsVoo: 1,
  allTimeHigh: { pct: -0.08, peakDate: "2026-06-30" },
  historyDays: 120,
  xirrPct: 0.4,
  dailyChangeAsOf: "2026-07-23",
  pricesAsOf: "2026-07-23",
} as unknown as DashboardData;

describe("MissionControlRoomContent public payload (PRV-01)", () => {
  it("never renders a dollar figure or the /stock/[ticker] door in public mode", () => {
    const html = renderToStaticMarkup(
      createElement(MissionControlRoomContent, { data, basePath: "/share", mode: "public" }),
    );
    expect(html).not.toMatch(/\$\s*\d/);
    expect(html).not.toContain("999,999");
    expect(html).not.toContain("888,888");
    expect(html).not.toContain("VALUE");
    expect(html).not.toContain("/stock/");
  });

  it("private mode is unaffected -- the owner VALUE column and dollar figures still render", () => {
    const html = renderToStaticMarkup(
      createElement(MissionControlRoomContent, { data, basePath: "/", mode: "private" }),
    );
    expect(html).toContain("VALUE");
    expect(html).toContain("$999,999");
  });
});
