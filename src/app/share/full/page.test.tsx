import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDashboardData, from } = vi.hoisted(() => ({
  getDashboardData: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/lib/dashboard-data", () => ({ getDashboardData }));
vi.mock("@/lib/supabase/client", () => ({ supabase: { from } }));
vi.mock("@/components/layout/NavBar", () => ({
  NavBar: () => <nav>Share navigation</nav>,
}));

vi.mock("@/components/dashboard/HeadlineStats", () => ({
  HeadlineStats: ({ hideDollars }: { hideDollars?: boolean }) => (
    <div data-hide-dollars={String(hideDollars)}>Public analytic</div>
  ),
}));
vi.mock("@/components/dashboard/PositionsTable", () => ({
  PositionsTable: ({ hideDollars }: { hideDollars?: boolean }) => (
    <div data-hide-dollars={String(hideDollars)}>Public analytic</div>
  ),
}));
vi.mock("@/components/dashboard/RealizedUnrealized", () => ({
  RealizedUnrealized: ({ hideDollars }: { hideDollars?: boolean }) => (
    <div data-hide-dollars={String(hideDollars)}>Public analytic</div>
  ),
}));
vi.mock("@/components/dashboard/CompositionDonut", () => ({
  CompositionDonut: ({ hideDollars }: { hideDollars?: boolean }) => (
    <div data-hide-dollars={String(hideDollars)}>Public analytic</div>
  ),
}));
vi.mock("@/components/dashboard/WinnersLosers", () => ({
  WinnersLosers: ({ hideDollars }: { hideDollars?: boolean }) => (
    <div data-hide-dollars={String(hideDollars)}>Public analytic</div>
  ),
}));
vi.mock("@/components/dashboard/ValueChart", () => ({ ValueChart: () => <div>Value chart</div> }));
vi.mock("@/components/dashboard/RiskPanel", () => ({ RiskPanel: () => <div>Risk</div> }));
vi.mock("@/components/dashboard/BetaTable", () => ({ BetaTable: () => <div>Beta</div> }));
vi.mock("@/components/dashboard/ExcessReturns", () => ({ ExcessReturns: () => <div>Excess</div> }));
vi.mock("@/components/dashboard/ClassificationBarList", () => ({
  ClassificationBarList: () => <div>Classification</div>,
}));
vi.mock("@/components/dashboard/CorrelationHeatmap", () => ({
  CorrelationHeatmap: () => <div>Correlation</div>,
}));
vi.mock("@/components/dashboard/EarningsCalendar", () => ({
  EarningsCalendar: () => <div>Earnings</div>,
}));
vi.mock("@/components/dashboard/HoldingsPerformanceChart", () => ({
  HoldingsPerformanceChart: () => <div>Holdings performance</div>,
}));
vi.mock("@/components/dashboard/HoldingRiskTable", () => ({
  HoldingRiskTable: () => <div>Holding risk</div>,
}));
vi.mock("@/components/dashboard/ContributionChart", () => ({
  ContributionChart: () => <div>Contribution</div>,
}));

const dashboardFixture = {
  totalValue: 999999.99,
  totalCost: 800000,
  simpleReturnPct: 0.1,
  dailyChange: 100,
  dailyChangePct: 0.01,
  dailyChangeAsOf: "2026-07-23",
  twrPct: 0.02,
  xirrPct: 0.03,
  historyDays: 30,
  pricesAsOf: "2026-07-23",
  allTimeHigh: null,
  chartData: [],
  holdingsPerformance: { tickers: [], hasOther: false, points: [] },
  benchmarkComparisons: [],
  positionRows: [],
  realizedGain: 500,
  unrealizedGain: 600,
  donutSlices: [],
  sectorWeights: [],
  aiExposureWeights: [],
  correlationTickers: [],
  correlationCells: [],
  winners: [],
  losers: [],
  movers: [],
  upcomingEarnings: [],
  volatilityPct: null,
  maxDrawdown: 0,
  sharpe: null,
  betaVsVoo: null,
  top2ConcentrationPct: 0,
  hhi: 0,
  sortinoRatio: null,
  bestDay: null,
  worstDay: null,
  winRatePct: 0,
  currentStreak: null,
  holdingRisks: [],
};

describe("/share/full compatibility route", () => {
  beforeEach(() => {
    getDashboardData.mockResolvedValue(dashboardFixture);
    from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
    });
  });

  it("links back to the Observatory and keeps missing-setting dollars hidden", async () => {
    const { default: ShareFullPage } = await import("./page");
    const html = renderToStaticMarkup(await ShareFullPage());

    expect(html).toContain('href="/share"');
    expect(html).toContain("Back to Observatory");
    expect(html.match(/data-hide-dollars="true"/g)?.length).toBeGreaterThanOrEqual(4);
    expect(html).not.toMatch(/\$\d[\d,]*\.\d{2}\b/);
  });
});
