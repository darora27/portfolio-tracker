import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { DashboardData } from "@/lib/dashboard-data";
import { PublicMissionControlContent } from "./PublicMissionControlContent";

const data = {
  publicOrreryHoldings: [
    {
      ticker: "MSFT",
      companyName: "Microsoft",
      weight: 0.6,
      contributionPct: 0.12,
      dayReturn: 0.01,
      weeklyReturn: 0.03,
      portfolioRelativeReturn: 0.01,
      volatilityPct: 0.2,
      betaVsVoo: 1,
    },
    {
      ticker: "IBM",
      companyName: "IBM",
      weight: 0.4,
      contributionPct: -0.04,
      dayReturn: -0.02,
      weeklyReturn: -0.01,
      portfolioRelativeReturn: -0.02,
      volatilityPct: 0.18,
      betaVsVoo: 0.8,
    },
  ],
  correlationTickers: ["MSFT", "IBM"],
  correlationCells: [[1, -0.4], [-0.4, 1]],
  hhi: 2600,
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
  benchmarkComparisons: [
    { ticker: "VOO", excessReturnPct: 0.01 },
  ],
  dailyChangePct: 0.01,
  twrPct: 0.02,
  volatilityPct: 0.2,
  betaVsVoo: 1,
  allTimeHigh: { pct: -0.08 },
  winRatePct: 55,
  bestDay: { r: 0.03 },
  worstDay: { r: -0.025 },
} as unknown as DashboardData;

describe("public Mission Control bay treatments", () => {
  it("renders manifest contribution bars and focusable plot equivalents", () => {
    const html = renderToStaticMarkup(
      <PublicMissionControlContent panel="manifest" data={data} basePath="/share" />,
    );
    expect(html).toContain("data-manifest-ticker=\"MSFT\"");
    expect(html).toContain("bilateralBar");
    expect(html).toContain("+12.0%");
    expect(html).toContain("-4.0%");
  });

  it("renders correlation signs as glyphs rather than hue alone", () => {
    const html = renderToStaticMarkup(
      <PublicMissionControlContent panel="signals" data={data} basePath="/share" />,
    );
    expect(html).toContain("MSFT / IBM: -0.40");
    expect(html).toContain("−");
    expect(html).toContain("CONCENTRATION: HIGH");
  });

  it("renders only the ratio-safe public log projection", () => {
    const html = renderToStaticMarkup(
      <PublicMissionControlContent panel="log" data={data} basePath="/share" />,
    );
    expect(html).toContain("+2.1% OF BOOK");
    expect(html).not.toMatch(/\$\d/);
    expect(html).not.toContain("realized_gain");
  });

  it("labels unavailable values with their source reason and never fabricates zero", () => {
    const unavailable = {
      ...data,
      publicOrreryHoldings: [
        { ...data.publicOrreryHoldings[0], dayReturn: null },
      ],
    } as DashboardData;
    const html = renderToStaticMarkup(
      <PublicMissionControlContent
        panel="manifest"
        data={unavailable}
        basePath="/share"
      />,
    );
    expect(html).toContain(
      'title="Day return unavailable: source history missing"',
    );
    expect(html).toContain(">—<");
    expect(html).not.toContain(
      'title="Day return unavailable: source history missing">+0.0%',
    );
  });

  it("renders every bay question and its working public destination", () => {
    const expectations = [
      ["plot", "where is everything, and how was the week", "holding=MSFT"],
      ["manifest", "what do I own, at what weight", "holding=MSFT"],
      ["scope", "am I beating the market", "VOO"],
      ["hazard", "how much can this hurt", "DRAWDOWN HISTORY"],
      ["signals", "what moves together", "pair=MSFT-IBM"],
      ["comms", "what’s being said", "https://example.com/public"],
      ["log", "what did I do", "holding=MSFT"],
    ] as const;
    for (const [panel, question, destination] of expectations) {
      const html = renderToStaticMarkup(
        <PublicMissionControlContent
          panel={panel}
          data={data}
          basePath="/share"
        />,
      );
      expect(html, `${panel} question`).toContain(question);
      expect(html, `${panel} destination`).toContain(destination);
    }
  });
});
