import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";
import { LoginForm } from "@/components/auth/LoginForm";
import { NavBar } from "@/components/layout/NavBar";
import { LiveQuotesProvider } from "@/components/dashboard/LiveQuotesProvider";
import { LiveHeadlineStats } from "@/components/dashboard/LiveHeadlineStats";
import { LivePositionsTable } from "@/components/dashboard/LivePositionsTable";
import { LiveWinnersLosers } from "@/components/dashboard/LiveWinnersLosers";
import { ValueChart } from "@/components/dashboard/ValueChart";
import { RiskPanel } from "@/components/dashboard/RiskPanel";
import { BetaTable } from "@/components/dashboard/BetaTable";
import { ExcessReturns } from "@/components/dashboard/ExcessReturns";
import { ClassificationBarList } from "@/components/dashboard/ClassificationBarList";
import { CorrelationHeatmap } from "@/components/dashboard/CorrelationHeatmap";
import { CompositionDonut } from "@/components/dashboard/CompositionDonut";
import { RealizedUnrealized } from "@/components/dashboard/RealizedUnrealized";
import { EarningsCalendar } from "@/components/dashboard/EarningsCalendar";
import { LatestNews } from "@/components/dashboard/LatestNews";
import { HoldingsPerformanceChart } from "@/components/dashboard/HoldingsPerformanceChart";
import { HoldingRiskTable } from "@/components/dashboard/HoldingRiskTable";

// This dashboard reflects live DB state (trades can be added any time), so
// it must never be baked into a static build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — Portfolio Tracker",
  robots: { index: false, follow: false },
};

export default async function Home() {
  const ownerPassword = process.env.OWNER_PASSWORD;
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = ownerPassword ? isValidSession(session, ownerPassword) : false;

  // This is the owner's full-detail private view (always shows dollar
  // amounts) — the public link to hand out is /share, which respects the
  // hide-dollars setting. Unauthenticated visitors get bounced here, not
  // shown the real numbers.
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

  const data = await getDashboardData();

  return (
    <>
      <NavBar variant="private" active="dashboard" />
      <LiveQuotesProvider initialPositions={data.positionRows}>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="space-y-8">
            <LiveHeadlineStats
              totalCost={data.totalCost}
              simpleReturnPct={data.simpleReturnPct}
              dailyChangeAsOf={data.dailyChangeAsOf}
              twrPct={data.twrPct}
              xirrPct={data.xirrPct}
              historyDays={data.historyDays}
              pricesAsOf={data.pricesAsOf}
              allTimeHigh={data.allTimeHigh}
              netFlowsToday={data.netFlowsToday}
              prevSnapshotValue={data.prevSnapshotValue}
            />

            <ValueChart data={data.chartData} />

            <HoldingsPerformanceChart data={data.holdingsPerformance} />

            <BetaTable comparisons={data.benchmarkComparisons} />

            <ExcessReturns comparisons={data.benchmarkComparisons} />

            <LivePositionsTable />

            <RealizedUnrealized
              realizedGain={data.realizedGain}
              unrealizedGain={data.unrealizedGain}
              totalCost={data.totalCost}
            />

            <CompositionDonut slices={data.donutSlices} />

            <ClassificationBarList title="Sector weights" items={data.sectorWeights} />

            <ClassificationBarList title="AI exposure" items={data.aiExposureWeights} />

            <CorrelationHeatmap tickers={data.correlationTickers} matrix={data.correlationCells} />

            <LiveWinnersLosers winners={data.winners} losers={data.losers} />

            <EarningsCalendar events={data.upcomingEarnings} />

            {data.latestNews.length > 0 && <LatestNews items={data.latestNews} />}

            <RiskPanel
              volatilityPct={data.volatilityPct}
              maxDrawdownPct={data.maxDrawdown}
              sharpe={data.sharpe}
              betaVsVoo={data.betaVsVoo}
              top2ConcentrationPct={data.top2ConcentrationPct}
              hhi={data.hhi}
              sortinoRatio={data.sortinoRatio}
              bestDay={data.bestDay}
              worstDay={data.worstDay}
              winRatePct={data.winRatePct}
              currentStreak={data.currentStreak}
            />

            <HoldingRiskTable risks={data.holdingRisks} />
          </div>
        </div>
      </LiveQuotesProvider>
    </>
  );
}
