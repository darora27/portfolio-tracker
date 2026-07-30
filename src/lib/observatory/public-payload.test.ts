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
  positionRows: [{ ticker: "IBM", value: 999_999 }, { ticker: "MSFT", value: 888_888 }],
  correlationTickers: ["IBM", "MSFT"],
  correlationCells: [
    [1, 0.82],
    [0.82, 1],
  ],
  publicTradeLog: [
    { date: "2026-07-14", action: "buy", ticker: "IBM", impactPct: 0.021, realizedSign: 0 },
  ],
  upcomingEarnings: [],
  newsByHolding: {},
  chartData: [{ date: "2026-07-01", portfolioIndex: 100 }],
  volatilityPct: 0.2,
  betaVsVoo: 1,
  allTimeHigh: { pct: -0.08, peakDate: "2026-06-30" },
  historyDays: 120,
  xirrPct: 0.4,
} as unknown as DashboardData;

describe("MissionControlRoomContent public payload (PRV-01)", () => {
  it("never renders a dollar figure in public mode, including in the FB-11 correlation sentence", () => {
    const html = renderToStaticMarkup(
      createElement(MissionControlRoomContent, { data, basePath: "/share", mode: "public" }),
    );
    expect(html).toMatch(/IBM AND MSFT MOVED TOGETHER/);
    expect(html).not.toMatch(/\$\s*\d/);
    expect(html).not.toContain("999,999");
    expect(html).not.toContain("888,888");
    expect(html).not.toContain("VALUE");
  });

  it("private mode is unaffected -- the owner VALUE column and dollar figures still render", () => {
    const html = renderToStaticMarkup(
      createElement(MissionControlRoomContent, { data, basePath: "/", mode: "private" }),
    );
    expect(html).toContain("VALUE");
    expect(html).toContain("$999,999");
  });
});
