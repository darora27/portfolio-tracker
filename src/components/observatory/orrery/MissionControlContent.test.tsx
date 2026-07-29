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
  positionRows: [{ ticker: "MSFT", value: 12345 }],
  correlationTickers: ["MSFT"],
  correlationCells: [[1]],
  hhi: 10_000,
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
  betaVsVoo: 1,
  allTimeHigh: { pct: -0.08, peakDate: "2026-06-30" },
  historyDays: 34,
  xirrPct: 0.4,
} as unknown as DashboardData;

describe("MissionControlRoomContent", () => {
  it("renders the complete plain-language descent and adjacent explanation", () => {
    const html = renderToStaticMarkup(
      <MissionControlRoomContent data={data} basePath="/share" mode="public" />,
    );
    for (const name of [
      "HOLDINGS", "RETURNS", "RISK", "CORRELATION", "EARNINGS", "NEWS", "TRADES",
    ]) {
      expect(html).toContain(name);
    }
    expect(html).toContain("fewer independent paths");
    expect(html).toContain("not cause, certainty, or what happens next");
    expect(html).toContain("https://example.com/public");
    expect(html).not.toMatch(/\\$12/);
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
