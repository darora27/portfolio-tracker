import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { getDashboardData } from "@/lib/dashboard-data";
import { NavBar } from "@/components/layout/NavBar";
import { HeadlineStats } from "@/components/dashboard/HeadlineStats";
import { PositionsTable } from "@/components/dashboard/PositionsTable";
import { WinnersLosers } from "@/components/dashboard/WinnersLosers";
import { ValueChart } from "@/components/dashboard/ValueChart";
import { RiskPanel } from "@/components/dashboard/RiskPanel";
import { BetaTable } from "@/components/dashboard/BetaTable";
import { ExcessReturns } from "@/components/dashboard/ExcessReturns";
import { ClassificationBarList } from "@/components/dashboard/ClassificationBarList";
import { CorrelationHeatmap } from "@/components/dashboard/CorrelationHeatmap";
import { CompositionDonut } from "@/components/dashboard/CompositionDonut";
import { RealizedUnrealized } from "@/components/dashboard/RealizedUnrealized";
import { EarningsCalendar } from "@/components/dashboard/EarningsCalendar";
import { HoldingsPerformanceChart } from "@/components/dashboard/HoldingsPerformanceChart";
import { HoldingRiskTable } from "@/components/dashboard/HoldingRiskTable";
import { ContributionChart } from "@/components/dashboard/ContributionChart";

// Public, read-only, no login, no client-side polling (unlike the private
// dashboard). Statically served and regenerated at most every 5 minutes —
// "prices as of" staleness on this page is measured in minutes, not
// seconds, which is fine for a read-only view nobody is actively trading
// off of.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Portfolio — Share View",
  description: "A read-only look at portfolio performance.",
  // Public by direct link only — not meant to show up in search results.
  robots: { index: false, follow: false },
};

export default async function SharePage() {
  const [data, { data: setting }] = await Promise.all([
    getDashboardData(),
    supabase.from("settings").select("value").eq("key", "share_hide_dollars").maybeSingle(),
  ]);
  // Default to hidden if the settings row is ever missing — fail toward
  // privacy, not toward accidentally exposing dollar amounts.
  const hideDollars = setting?.value ?? true;

  return (
    <>
      <NavBar variant="share" />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Link
          href="/share"
          className="mb-6 inline-flex min-h-11 items-center text-sm text-text-secondary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          ← Back to Observatory
        </Link>
        <div className="space-y-8">
          <HeadlineStats
            totalValue={data.totalValue}
            totalCost={data.totalCost}
            simpleReturnPct={data.simpleReturnPct}
            dailyChange={data.dailyChange}
            dailyChangePct={data.dailyChangePct}
            dailyChangeAsOf={data.dailyChangeAsOf}
            twrPct={data.twrPct}
            xirrPct={data.xirrPct}
            historyDays={data.historyDays}
            pricesAsOf={data.pricesAsOf}
            allTimeHigh={data.allTimeHigh}
            hideDollars={hideDollars}
          />

          <ValueChart data={data.chartData} />

          <HoldingsPerformanceChart data={data.holdingsPerformance} />

          <BetaTable comparisons={data.benchmarkComparisons} />

          <ExcessReturns comparisons={data.benchmarkComparisons} />

          <PositionsTable positions={data.positionRows} hideDollars={hideDollars} linkRows={false} />

          <RealizedUnrealized
            realizedGain={data.realizedGain}
            unrealizedGain={data.unrealizedGain}
            totalCost={data.totalCost}
            hideDollars={hideDollars}
          />

          <CompositionDonut slices={data.donutSlices} hideDollars={hideDollars} />

          <ContributionChart
            entries={data.positionRows
              .filter((p) => p.contribution !== null)
              .map((p) => ({ ticker: p.ticker, contribution: p.contribution! }))}
          />

          <ClassificationBarList title="Sector weights" items={data.sectorWeights} />

          <ClassificationBarList title="AI exposure" items={data.aiExposureWeights} />

          <CorrelationHeatmap tickers={data.correlationTickers} matrix={data.correlationCells} />

          <WinnersLosers
            winners={data.winners}
            losers={data.losers}
            movers={data.movers}
            hideDollars={hideDollars}
          />

          <EarningsCalendar events={data.upcomingEarnings} />

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
    </>
  );
}
