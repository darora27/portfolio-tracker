import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";
import { LoginForm } from "@/components/auth/LoginForm";
import { BriefingChapter } from "@/components/observatory/BriefingChapter";
import { ForcesChapter } from "@/components/observatory/ForcesChapter";
import { LabChapter } from "@/components/observatory/LabChapter";
import { ObservatoryShell } from "@/components/observatory/ObservatoryShell";
import { OwnerUtilityStrip } from "@/components/observatory/OwnerUtilityStrip";
import { StructureChapter } from "@/components/observatory/StructureChapter";
import { TimelineChapter } from "@/components/observatory/TimelineChapter";
import { todayInTimeZone } from "@/lib/date";
import { formatDate } from "@/lib/format";
import { resolveObservatoryChapter } from "@/lib/observatory/chapters";
import { resolveExplainParam } from "@/lib/observatory/metric-explanations";
import { getPublicTimelineData } from "@/lib/observatory/timeline-data";

// Same reason as the moved /dashboard page: reflects live DB state, so it
// must never be baked into a static build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfolio Tracker",
  robots: { index: false, follow: false },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    chapter?: string | string[];
    explain?: string | string[];
  }>;
}) {
  const ownerPassword = process.env.OWNER_PASSWORD;
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = ownerPassword ? isValidSession(session, ownerPassword) : false;

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <Link href="/share" className="text-sm text-text-secondary hover:text-text-primary hover:underline">
          View public share page
        </Link>
        <h1 className="mt-3 text-xl font-semibold text-text-primary">Portfolio Tracker</h1>
        <p className="mt-1 text-sm text-text-secondary">Sign in to view the private dashboard.</p>
        <LoginForm />
      </div>
    );
  }

  const [data, timeline, params] = await Promise.all([
    getDashboardData(),
    getPublicTimelineData(),
    searchParams,
  ]);
  const active = resolveObservatoryChapter(params.chapter);
  const explainOpenId = resolveExplainParam(params.explain);
  const preservedQuery = explainOpenId
    ? { explain: explainOpenId }
    : undefined;
  const today = todayInTimeZone("America/New_York");
  const voo = data.benchmarkComparisons.find((comparison) => comparison.ticker === "VOO") ?? {
    available: false,
    twrPct: null,
    excessReturnPct: null,
  };

  return (
    <ObservatoryShell
      mode="private"
      basePath="/"
      preservedQuery={preservedQuery}
      activeChapterId={active.id}
      title="Portfolio Observatory"
      freshness={{
        label: "Prices as of",
        value: formatDate(data.dailyChangeAsOf),
        stale: data.pricesAsOf === null,
      }}
      ownerSlot={
        <OwnerUtilityStrip
          totalValue={data.totalValue}
          totalCost={data.totalCost}
          simpleReturnPct={data.simpleReturnPct}
        />
      }
      chapterContent={{
        pulse: (
          <BriefingChapter
            dailyChangePct={data.dailyChangePct}
            movers={data.movers.map(({ ticker, dayPct }) => ({ ticker, dayPct }))}
            pricesStale={data.pricesAsOf === null}
            hhi={data.hhi}
            upcomingEarnings={data.upcomingEarnings.map(({ ticker, date }) => ({ ticker, date }))}
            today={today}
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
            basePath="/"
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
            basePath="/"
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
    />
  );
}
