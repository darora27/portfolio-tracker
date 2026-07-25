import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { dashboardTestFixture } from "./dashboard-test-fixture";
import { AllAnalyticsView } from "./AllAnalyticsView";

vi.mock("@/components/compare/CompareEntryPoint", () => ({
  CompareEntryPoint: () => <div data-component="compare">Compare</div>,
}));
vi.mock("./BetaTable", () => ({ BetaTable: () => <div data-component="beta">Beta</div> }));
vi.mock("./ExcessReturns", () => ({ ExcessReturns: () => <div data-component="excess">Excess</div> }));
vi.mock("./RealizedUnrealized", () => ({ RealizedUnrealized: () => <div data-component="realized">Realized</div> }));
vi.mock("./LivePositionsTable", () => ({ LivePositionsTable: () => <div data-component="positions">Positions</div> }));
vi.mock("./CompositionDonut", () => ({ CompositionDonut: () => <div data-component="composition">Composition</div> }));
vi.mock("./ClassificationBarList", () => ({
  ClassificationBarList: ({ title }: { title: string }) => (
    <div data-component={`classification-${title}`}>{title}</div>
  ),
}));
vi.mock("./HoldingsPerformanceChart", () => ({
  HoldingsPerformanceChart: () => <div data-component="holdings-performance">Holdings performance</div>,
}));
vi.mock("./RiskPanel", () => ({
  RiskPanel: ({ explainOpenId }: { explainOpenId?: string }) => (
    <div data-component="risk" data-explain={explainOpenId}>Risk panel</div>
  ),
}));
vi.mock("./CorrelationHeatmap", () => ({ CorrelationHeatmap: () => <div data-component="correlation">Correlation</div> }));
vi.mock("./HoldingRiskTable", () => ({ HoldingRiskTable: () => <div data-component="holding-risk">Holding risk</div> }));
vi.mock("./EarningsCalendar", () => ({ EarningsCalendar: () => <div data-component="earnings">Earnings</div> }));
vi.mock("./LatestNews", () => ({ LatestNews: () => <div data-component="news">News</div> }));
vi.mock("./LiveWinnersLosers", () => ({ LiveWinnersLosers: () => <div data-component="winners-losers">Winners losers</div> }));

describe("AllAnalyticsView", () => {
  it("groups every assigned analytic exactly once and threads explanation state", () => {
    const html = renderToStaticMarkup(
      <AllAnalyticsView
        data={{
          ...dashboardTestFixture,
          latestNews: [{
            datetime: 1, headline: "Headline", source: "Source",
            url: "https://example.com", ticker: "IBM",
          }],
        }}
        explainOpenId="beta"
      />,
    );
    for (const heading of ["Performance", "Holdings", "Risk", "Events"]) {
      expect(html).toContain(`>${heading}</h3>`);
    }
    const ids = [
      "compare", "beta", "excess", "realized", "positions", "composition",
      "classification-Sector weights", "classification-AI exposure",
      "holdings-performance", "risk", "correlation", "holding-risk",
      "earnings", "news", "winners-losers",
    ];
    for (const id of ids) {
      expect((html.match(new RegExp(`data-component=\"${id}\"`, "g")) ?? []).length).toBe(1);
    }
    expect(html).toContain('data-explain="beta"');
    expect(html).not.toContain("Value chart");
    expect(html).not.toContain("Contribution chart");
  });

  it("keeps LatestNews conditional when no items exist", () => {
    expect(renderToStaticMarkup(<AllAnalyticsView data={dashboardTestFixture} />))
      .not.toContain('data-component="news"');
  });
});
