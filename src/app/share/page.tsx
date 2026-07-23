import type { Metadata } from "next";
import { getDashboardData } from "@/lib/dashboard-data";
import { SurfaceHeader } from "@/components/surface/SurfaceHeader";
import { SurfaceActs } from "@/components/surface/SurfaceActs";
import { weeklySubline, todayLine, riskLine } from "@/lib/surface-copy";

// Public, read-only, no login — same staleness posture as /share/full.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Portfolio — Share View",
  description: "A read-only look at portfolio performance.",
  robots: { index: false, follow: false },
};

export default async function SharePage() {
  const data = await getDashboardData();
  const topHolding = data.donutSlices[0] ?? null;

  return (
    <>
      <SurfaceHeader variant="share" />
      <SurfaceActs
        mode="share"
        ownerLabel="The portfolio"
        // Share hero is the same-period TWR percent — never dollars.
        heroValue={data.twrPct}
        weeklySublineText={
          data.twr7d !== null && data.voo7d !== null
            ? weeklySubline({ twr7d: data.twr7d, voo7d: data.voo7d })
            : "Building this week’s picture."
        }
        chartData={data.chartData}
        positionsCount={data.positionRows.length}
        topHoldingTicker={topHolding?.ticker ?? null}
        donutSlices={data.donutSlices}
        hhi={data.hhi}
        riskLineText={riskLine(data.hhi)}
        todayLineText={todayLine({ dayReturn: data.dailyChangePct })}
        topMover={data.movers[0] ?? null}
        primaryHref="/share/full"
        primaryLabel="See the full breakdown"
        orreryWeights={data.donutSlices.slice(0, 5).map((s) => s.weight)}
      />
    </>
  );
}
