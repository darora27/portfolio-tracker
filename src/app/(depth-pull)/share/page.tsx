import type { Metadata } from "next";
import { getDashboardData } from "@/lib/dashboard-data";
import { formatDate } from "@/lib/format";
import { ObservatoryShell } from "@/components/observatory/ObservatoryShell";
import { ObservatoryEntrance } from "@/components/observatory/ObservatoryEntrance";
import { ForcesChapter } from "@/components/observatory/ForcesChapter";
import { LabChapter } from "@/components/observatory/LabChapter";
import { PulseChapter } from "@/components/observatory/PulseChapter";
import { StructureChapter } from "@/components/observatory/StructureChapter";
import { TimelineChapter } from "@/components/observatory/TimelineChapter";
import { OrreryWorld } from "@/components/observatory/orrery/OrreryWorld";
import { resolveObservatoryChapter } from "@/lib/observatory/chapters";
import { resolveExplainParam } from "@/lib/observatory/metric-explanations";
import { getPublicTimelineData } from "@/lib/observatory/timeline-data";
import styles from "./share-orrery.module.css";

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
  searchParams: Promise<{
    chapter?: string | string[];
    explain?: string | string[];
    focus?: string | string[];
    holding?: string | string[];
    no3d?: string | string[];
  }>;
}) {
  const [data, timeline] = await Promise.all([
    getDashboardData(),
    getPublicTimelineData(),
  ]);
  const params = await searchParams;
  const active = resolveObservatoryChapter(params.chapter);
  const explainOpenId = resolveExplainParam(params.explain);
  const focusParam = Array.isArray(params.focus) ? params.focus[0] : params.focus;
  const holdingParam = Array.isArray(params.holding) ? params.holding[0] : params.holding;
  const no3dParam = Array.isArray(params.no3d) ? params.no3d[0] : params.no3d;
  const portfolioSelected = focusParam === "portfolio";
  const selectedTicker = data.publicOrreryHoldings.some(
    (holding) => holding.ticker === holdingParam,
  )
    ? holdingParam ?? null
    : null;
  const preservedQueryEntries = {
    ...(portfolioSelected ? { focus: "portfolio" } : {}),
    ...(explainOpenId ? { explain: explainOpenId } : {}),
    ...(no3dParam === "1" ? { no3d: "1" } : {}),
  };
  const preservedQuery =
    Object.keys(preservedQueryEntries).length > 0
      ? preservedQueryEntries
      : undefined;
  const voo = data.benchmarkComparisons.find((comparison) => comparison.ticker === "VOO") ?? {
    available: false,
    twrPct: null,
    excessReturnPct: null,
  };

  return (
    <div className={styles.page}>
      <section
        id="portfolio-observatory"
        className={styles.semanticObservatory}
        aria-label="Portfolio chapters"
      >
        <ObservatoryShell
          mode="public"
          basePath="/share"
          preservedQuery={preservedQuery}
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
            basePath="/share"
            preservedQuery={preservedQuery}
            explainOpenId={
              active.id === "structure" ? explainOpenId : undefined
            }
            pricesAsOf={data.pricesAsOf}
            dailyChangeAsOf={data.dailyChangeAsOf}
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
            basePath="/share"
            preservedQuery={preservedQuery}
            explainOpenId={active.id === "lab" ? explainOpenId : undefined}
            historyDays={data.historyDays}
            firstFundedDate={data.chartData[0]?.date ?? null}
            pricesAsOf={data.pricesAsOf}
            dailyChangeAsOf={data.dailyChangeAsOf}
            twrPct={data.twrPct}
            xirrPct={data.xirrPct}
            benchmark={{
              available: voo.available,
              twrPct: voo.twrPct,
              excessReturnPct: voo.excessReturnPct,
            }}
          />
        ),
          }}
          forceNo3d={no3dParam === "1"}
        />
      </section>

      <ObservatoryEntrance mode="public" disabled={no3dParam === "1"}>
        <div className={styles.orreryEntry}>
          <OrreryWorld
            basePath="/share"
            semanticTitle={false}
            holdings={data.publicOrreryHoldings}
            selectedTicker={selectedTicker}
            portfolioSelected={portfolioSelected}
            forceNo3d={no3dParam === "1"}
            portfolioSummary={{
              returnPct: data.twrPct,
              marketRelativePct: voo.excessReturnPct,
              topTwoWeight: data.top2ConcentrationPct,
            }}
          />
        </div>
      </ObservatoryEntrance>
    </div>
  );
}
