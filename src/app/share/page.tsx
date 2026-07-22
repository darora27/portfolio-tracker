import type { Metadata } from "next";
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

// Public, read-only, no login. Reflects live DB state, so never static.
export const dynamic = "force-dynamic";

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
            hideDollars={hideDollars}
          />

          <ValueChart data={data.chartData} />

          <BetaTable comparisons={data.benchmarkComparisons} />

          <ExcessReturns comparisons={data.benchmarkComparisons} />

          <PositionsTable positions={data.positionRows} hideDollars={hideDollars} />

          <RealizedUnrealized
            realizedGain={data.realizedGain}
            unrealizedGain={data.unrealizedGain}
            totalCost={data.totalCost}
            hideDollars={hideDollars}
          />

          <CompositionDonut slices={data.donutSlices} hideDollars={hideDollars} />

          <ClassificationBarList title="Sector weights" items={data.sectorWeights} />

          <ClassificationBarList title="AI exposure" items={data.aiExposureWeights} />

          <CorrelationHeatmap tickers={data.correlationTickers} matrix={data.correlationCells} />

          <WinnersLosers winners={data.winners} losers={data.losers} />

          <EarningsCalendar events={data.upcomingEarnings} />

          <RiskPanel
            volatilityPct={data.volatilityPct}
            maxDrawdownPct={data.maxDrawdown}
            sharpe={data.sharpe}
            betaVsVoo={data.betaVsVoo}
            top2ConcentrationPct={data.top2ConcentrationPct}
            hhi={data.hhi}
          />
        </div>
      </div>
    </>
  );
}
