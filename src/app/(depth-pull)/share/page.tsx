import type { Metadata } from "next";
import { getDashboardData } from "@/lib/dashboard-data";
import { formatDate } from "@/lib/format";
import { ObservatoryShell } from "@/components/observatory/ObservatoryShell";
import { ForcesChapter } from "@/components/observatory/ForcesChapter";
import { LabChapter } from "@/components/observatory/LabChapter";
import { PulseChapter } from "@/components/observatory/PulseChapter";
import { StructureChapter } from "@/components/observatory/StructureChapter";
import { TimelineChapter } from "@/components/observatory/TimelineChapter";
import { resolveObservatoryChapter } from "@/lib/observatory/chapters";
import { getPublicTimelineData } from "@/lib/observatory/timeline-data";

// Public, read-only, no login — same staleness posture as /share/full.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Portfolio — Share View",
  description: "A read-only look at portfolio performance.",
  robots: { index: false, follow: false },
};

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ chapter?: string | string[] }>;
}) {
  const [data, timeline] = await Promise.all([
    getDashboardData(),
    getPublicTimelineData(),
  ]);
  const params = await searchParams;
  const active = resolveObservatoryChapter(params.chapter);
  const voo = data.benchmarkComparisons.find((comparison) => comparison.ticker === "VOO") ?? {
    available: false,
    twrPct: null,
    excessReturnPct: null,
  };

  return (
    <ObservatoryShell
      mode="public"
      basePath="/share"
      activeChapterId={active.id}
      title="Portfolio Observatory"
      freshness={{
        label: "Prices as of",
        value: formatDate(data.dailyChangeAsOf),
        stale: data.pricesAsOf === null,
      }}
      chapterContent={{
        pulse: (
          <PulseChapter
            historyDays={data.historyDays}
            portfolioTwrPct={data.twrPct}
            benchmark={{
              available: voo.available,
              twrPct: voo.twrPct,
              excessReturnPct: voo.excessReturnPct,
            }}
            chartData={data.chartData.map(({ date, portfolioIndex, vooIndex }) => ({
              date,
              portfolioIndex,
              vooIndex,
            }))}
            positions={data.positionRows.map(({ ticker, contribution }) => ({ ticker, contribution }))}
          />
        ),
        forces: (
          <ForcesChapter
            positions={data.positionRows.map(({ ticker, contribution }) => ({
              ticker,
              contribution,
            }))}
            movers={data.movers.map(({ ticker, dayPct }) => ({
              ticker,
              dayPct,
            }))}
          />
        ),
        structure: (
          <StructureChapter
            hhi={data.hhi}
            top2ConcentrationPct={data.top2ConcentrationPct}
            positions={data.positionRows.map(({ ticker, weight }) => ({
              ticker,
              weight,
            }))}
            sectorWeights={data.sectorWeights.map(({ label, weight }) => ({
              label,
              weight,
            }))}
            aiExposureWeights={data.aiExposureWeights.map(({ label, weight }) => ({
              label,
              weight,
            }))}
            correlationTickers={data.correlationTickers}
            correlationCells={data.correlationCells}
          />
        ),
        timeline: (
          <TimelineChapter
            chartData={data.chartData.map(({ date, portfolioIndex }) => ({
              date,
              index: portfolioIndex,
            }))}
            allTimeHigh={data.allTimeHigh}
            bestDay={data.bestDay}
            worstDay={data.worstDay}
            flowMarkers={timeline.flowMarkers}
            tradeMarkers={timeline.tradeMarkers}
            compositionHistory={timeline.compositionHistory}
          />
        ),
        lab: (
          <LabChapter
            historyDays={data.historyDays}
            firstFundedDate={data.chartData[0]?.date ?? null}
            pricesAsOf={data.pricesAsOf}
            dailyChangeAsOf={data.dailyChangeAsOf}
            twrPct={data.twrPct}
            benchmark={{
              available: voo.available,
              twrPct: voo.twrPct,
              excessReturnPct: voo.excessReturnPct,
            }}
          />
        ),
      }}
    />
  );
}
