import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { DashboardData } from "@/lib/dashboard-data";
import { MissionControlRoomContent } from "./MissionControlRoomContent";

/**
 * FB-11 (§12a) — the CORRELATION section's templated named-pair sentence.
 * BHV-01: word count, source pair, and the insufficient-history fallback.
 */

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

const baseData = {
  publicOrreryHoldings: [
    { ticker: "IBM", weight: 0.5, dayReturn: 0.01, weeklyReturn: 0.03 },
    { ticker: "MSFT", weight: 0.5, dayReturn: 0.01, weeklyReturn: 0.03 },
  ],
  positionRows: [],
  publicTradeLog: [],
  upcomingEarnings: [],
  newsByHolding: {},
  chartData: [{ date: "2026-07-01", portfolioIndex: 100 }],
  volatilityPct: 0.2,
  betaVsVoo: 1,
  allTimeHigh: { pct: -0.08, peakDate: "2026-06-30" },
  historyDays: 120,
  xirrPct: 0.4,
};

describe("MissionControlRoomContent correlation named-pair sentence (FB-11)", () => {
  it("names the actual top |r| pair, beneath the generic paragraph, at 14 words or fewer", () => {
    const data = {
      ...baseData,
      correlationTickers: ["IBM", "MSFT"],
      correlationCells: [
        [1, 0.82],
        [0.82, 1],
      ],
    } as unknown as DashboardData;
    const html = renderToStaticMarkup(
      <MissionControlRoomContent data={data} basePath="/share" mode="public" />,
    );
    expect(html).toContain("fewer independent");
    expect(html).toContain("IBM AND MSFT MOVED TOGETHER");
    const match = html.match(/IBM AND MSFT MOVED TOGETHER[^<]*/);
    expect(match).not.toBeNull();
    expect(match![0].trim().split(/\s+/).length).toBeLessThanOrEqual(14);
  });

  it("renders no sentence below MIN_OVERLAP shared history -- the generic paragraph stands alone", () => {
    const data = {
      ...baseData,
      correlationTickers: ["IBM", "MSFT"],
      // Every off-diagonal cell null: correlationMatrix's own MIN_OVERLAP
      // gate returns null for insufficient shared trading days.
      correlationCells: [
        [1, null],
        [null, 1],
      ],
    } as unknown as DashboardData;
    const html = renderToStaticMarkup(
      <MissionControlRoomContent data={data} basePath="/share" mode="public" />,
    );
    expect(html).toContain("fewer independent");
    expect(html).not.toContain("MOVED TOGETHER");
    expect(html).not.toContain("MOVED OPPOSITE");
    expect(html).not.toContain("SHARE SOME MOVEMENT");
    expect(html).not.toContain("BARELY RELATED");
  });
});
