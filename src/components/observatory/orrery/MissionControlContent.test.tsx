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
});
