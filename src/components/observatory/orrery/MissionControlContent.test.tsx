import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { DashboardData } from "@/lib/dashboard-data";
import { MissionControlRoomContent } from "./MissionControlRoomContent";

vi.mock("./LazyMissionSection", () => ({
  LazyMissionSection: ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => <section id={id}><h3>{title}</h3>{children}</section>,
}));

const holding = {
  ticker: "MSFT",
  companyName: "Microsoft",
  weight: 1,
  contributionPct: 0.12,
  dayReturn: 0.01,
  weeklyReturn: 0.03,
  portfolioRelativeReturn: 0.01,
  volatilityPct: 0.2,
  betaVsVoo: 1,
};

const data = {
  publicOrreryHoldings: [holding],
  positionRows: [{
    ticker: "MSFT", shares: 10, costBasis: 10_000, price: 1_234.5, priceAsOf: "2026-07-23",
    value: 12345, gain: 2345, gainPct: 0.2345, weight: 1, contribution: 0.2345,
    day: 50, dayPct: 0.01, isNewToday: false, sparkline: [1200, 1210, 1234.5], prevClose: 1222.3,
  }],
  movers: [{ ticker: "MSFT", day: 50, dayPct: 0.01 }],
  top2ConcentrationPct: 1,
  hhi: 10_000,
  realizedGain: 0,
  unrealizedGain: 2345,
  donutSlices: [{ ticker: "MSFT", weight: 1, value: 12345 }],
  sectorWeights: [{ label: "Technology", weight: 1 }],
  aiExposureWeights: [{ label: "High", weight: 1 }],
  benchmarkComparisons: [
    { ticker: "VOO", available: true, beta: 1, twrPct: 0.02, excessReturnPct: 0.0, chartIndex: [100, 101] },
    { ticker: "VTI", available: true, beta: 1, twrPct: 0.019, excessReturnPct: 0.001, chartIndex: [100, 101] },
    { ticker: "XLK", available: false, beta: null, twrPct: null, excessReturnPct: null, chartIndex: [] },
  ],
  holdingsPerformance: { tickers: ["MSFT"], hasOther: false, points: [{ date: "2026-07-01", MSFT: 0 }, { date: "2026-07-02", MSFT: 2 }] },
  holdingRisks: [{ ticker: "MSFT", volatilityPct: 0.2, betaVsVoo: 1 }],
  drawdownSeries: [{ date: "2026-07-01", drawdown: 0 }, { date: "2026-07-02", drawdown: -0.02 }],
  dailyReturnBars: [{ date: "2026-07-02", return: 0.01 }],
  compositionHistory: { tickers: ["MSFT"], hasOther: false, points: [{ date: "2026-07-01", MSFT: 100 }, { date: "2026-07-02", MSFT: 100 }] },
  publicTradeLog: [
    { date: "2026-07-14", action: "buy", ticker: "MSFT", impactPct: 0.021, realizedSign: 0 },
  ],
  upcomingEarnings: [
    { ticker: "MSFT", date: "2026-08-03", hour: "amc", epsEstimate: 3.2 },
  ],
  newsByHolding: {
    MSFT: [
      {
        ticker: "MSFT",
        headline: "Public fixture headline",
        source: "Fixture",
        url: "https://example.com/public",
        datetime: 1_785_000_000,
      },
    ],
  },
  chartData: [
    { date: "2026-07-01", portfolioIndex: 100, vooIndex: 100 },
    { date: "2026-07-02", portfolioIndex: 102, vooIndex: 101 },
  ],
  volatilityPct: 0.2,
  maxDrawdown: -0.02,
  betaVsVoo: 1,
  allTimeHigh: { pct: -0.08, peakDate: "2026-06-30" },
  historyDays: 34,
  xirrPct: 0.4,
  dailyChangeAsOf: "2026-07-23",
  pricesAsOf: "2026-07-23",
} as unknown as DashboardData;

describe("MissionControlRoomContent", () => {
  it("renders the complete plain-language descent", () => {
    const html = renderToStaticMarkup(
      <MissionControlRoomContent data={data} basePath="/share" mode="public" />,
    );
    for (const name of ["HOLDINGS", "RETURNS", "MIX", "RISK", "ACTIVITY"]) {
      expect(html).toContain(name);
    }
    // §15 §11: CORRELATION and standalone EARNINGS are cut; NEWS is footer
    // content in MissionControl.tsx now, not rendered by this component.
    expect(html).not.toContain("CORRELATION");
    expect(html).not.toContain('id="earnings"');
    expect(html).not.toMatch(/\$12/);
    expect(html).not.toContain("XIRR");
  });

  it("adds owner VALUE and de-emphasises young XIRR without changing math", () => {
    const html = renderToStaticMarkup(
      <MissionControlRoomContent data={data} basePath="/" mode="private" />,
    );
    expect(html).toContain("VALUE");
    expect(html).toContain("$12,345");
    expect(html).toContain("XIRR — (needs 90d)");
    expect(html).toContain("OPEN TRADE DESK");
  });
});
