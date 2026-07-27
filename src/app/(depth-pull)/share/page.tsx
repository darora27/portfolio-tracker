import type { Metadata } from "next";
import { ForcesChapter } from "@/components/observatory/ForcesChapter";
import { LabChapter } from "@/components/observatory/LabChapter";
import { PulseChapter } from "@/components/observatory/PulseChapter";
import { StructureChapter } from "@/components/observatory/StructureChapter";
import { TimelineChapter } from "@/components/observatory/TimelineChapter";
import {
  OrreryWorld,
  type OrreryCameraState,
} from "@/components/observatory/orrery/OrreryWorld";
import { getDashboardData } from "@/lib/dashboard-data";
import {
  healthScalarForPortfolio,
  resolveBeltMembership,
  sunspotIntensityForDrawdown,
} from "@/lib/observatory/orrery";
import { resolveObservatoryChapter } from "@/lib/observatory/chapters";
import { resolveExplainParam } from "@/lib/observatory/metric-explanations";
import { getPublicTimelineData } from "@/lib/observatory/timeline-data";
import styles from "./share-orrery.module.css";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Stock Market Universe — Share View",
  description: "Explore a public, read-only portfolio solar system.",
  robots: { index: false, follow: false },
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{
    camera?: string | string[];
    chapter?: string | string[];
    explain?: string | string[];
    focus?: string | string[];
    holding?: string | string[];
    planet?: string | string[];
    manual?: string | string[];
    no3d?: string | string[];
  }>;
}) {
  const [data, timeline, params] = await Promise.all([
    getDashboardData(),
    getPublicTimelineData(),
    searchParams,
  ]);
  const active = resolveObservatoryChapter(params.chapter);
  const explainOpenId = resolveExplainParam(params.explain);
  const focusParam = first(params.focus);
  const holdingParam = first(params.holding) ?? first(params.planet);
  const no3d = first(params.no3d) === "1";
  const manualOpen = first(params.manual) === "1";
  const portfolioSelected = focusParam === "portfolio";
  const selectedTicker = data.publicOrreryHoldings.some(
    (holding) => holding.ticker === holdingParam,
  )
    ? holdingParam ?? null
    : null;
  const requestedCamera = first(params.camera);
  const cameraState: OrreryCameraState =
    requestedCamera === "approach" ||
    requestedCamera === "command" ||
    requestedCamera === "overview"
      ? requestedCamera
      : selectedTicker
        ? "approach"
        : portfolioSelected
          ? "command"
          : "overview";
  const preservedQuery = {
    ...(portfolioSelected ? { focus: "portfolio", camera: "command" } : {}),
    ...(explainOpenId ? { explain: explainOpenId } : {}),
    ...(no3d ? { no3d: "1" } : {}),
  };
  const chapterQuery =
    Object.keys(preservedQuery).length > 0 ? preservedQuery : undefined;
  const voo = data.benchmarkComparisons.find(
    (comparison) => comparison.ticker === "VOO",
  ) ?? {
    available: false,
    twrPct: null,
    excessReturnPct: null,
  };

  const chapterContent = {
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
        positions={data.positionRows.map(({ ticker, contribution }) => ({
          ticker,
          contribution,
        }))}
      />
    ),
    forces: (
      <ForcesChapter
        positions={data.positionRows.map(({ ticker, contribution }) => ({
          ticker,
          contribution,
        }))}
        movers={data.movers.map(({ ticker, dayPct }) => ({ ticker, dayPct }))}
      />
    ),
    structure: (
      <StructureChapter
        basePath="/share"
        preservedQuery={chapterQuery}
        explainOpenId={active.id === "structure" ? explainOpenId : undefined}
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
        preservedQuery={chapterQuery}
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
  };
  const orreryBelt =
    data.orreryBelt ??
    resolveBeltMembership(
      data.publicOrreryHoldings.map(({ ticker, weight }) => ({ ticker, weight })),
      null,
    );
  const portfolioHealth = {
    h: healthScalarForPortfolio(
      data.dailyChangePct,
      data.twr7d ?? 0,
      data.volatilityPct ?? 0.02,
    ),
    sunspotIntensity: sunspotIntensityForDrawdown(
      data.allTimeHigh?.pct ?? 0,
    ),
  };

  return (
    <div className={styles.page}>
      <div className={styles.orreryEntry}>
        <OrreryWorld
          basePath="/share"
          holdings={data.publicOrreryHoldings}
          orreryBelt={orreryBelt}
          selectedTicker={selectedTicker}
          portfolioSelected={portfolioSelected}
          cameraState={cameraState}
          manualOpen={manualOpen}
          forceNo3d={no3d}
          portfolioHealth={portfolioHealth}
          portfolioSummary={{
            returnPct: data.twrPct,
            dayReturnPct: data.dailyChangePct,
            marketRelativePct: voo.excessReturnPct,
            topTwoWeight: data.top2ConcentrationPct,
          }}
          missionControlContent={chapterContent[active.id]}
          activeChapterId={active.id}
          missionPreservedQuery={{
            ...(explainOpenId ? { explain: explainOpenId } : {}),
            ...(no3d ? { no3d: "1" } : {}),
          }}
        />
      </div>
    </div>
  );
}
