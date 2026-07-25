import { BetaTable } from "@/components/dashboard/BetaTable";
import { ClassificationBarList } from "@/components/dashboard/ClassificationBarList";
import { CompositionDonut } from "@/components/dashboard/CompositionDonut";
import { CorrelationHeatmap } from "@/components/dashboard/CorrelationHeatmap";
import { EarningsCalendar } from "@/components/dashboard/EarningsCalendar";
import { ExcessReturns } from "@/components/dashboard/ExcessReturns";
import { HoldingRiskTable } from "@/components/dashboard/HoldingRiskTable";
import { HoldingsPerformanceChart } from "@/components/dashboard/HoldingsPerformanceChart";
import { LatestNews } from "@/components/dashboard/LatestNews";
import { LivePositionsTable } from "@/components/dashboard/LivePositionsTable";
import { LiveWinnersLosers } from "@/components/dashboard/LiveWinnersLosers";
import { RealizedUnrealized } from "@/components/dashboard/RealizedUnrealized";
import { RiskPanel } from "@/components/dashboard/RiskPanel";
import { CompareEntryPoint } from "@/components/compare/CompareEntryPoint";
import type { DashboardData } from "@/lib/dashboard-data";
import type { MetricExplanationId } from "@/lib/observatory/metric-explanations";

export type AllAnalyticsViewProps = {
  data: DashboardData;
  explainOpenId?: MetricExplanationId;
};

const groupClass = "scroll-mt-24 space-y-8 border-t border-border pt-6";
const groupHeadingClass =
  "font-mono text-sm font-semibold uppercase tracking-[0.14em] text-text-primary";

export function AllAnalyticsView({
  data,
  explainOpenId,
}: AllAnalyticsViewProps) {
  return (
    <section className="space-y-10" aria-labelledby="dashboard-analytics-heading">
      <div className="max-w-3xl">
        <h2
          id="dashboard-analytics-heading"
          className="text-2xl font-semibold text-text-primary"
        >
          All analytics
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          Every dashboard metric, grouped by what it explains. Nothing here is
          deleted or hidden — this is the complete toolset.
        </p>
      </div>

      <section id="performance" aria-labelledby="performance-heading" className={groupClass}>
        <h3 id="performance-heading" className={groupHeadingClass}>
          Performance
        </h3>
        <CompareEntryPoint />
        <BetaTable comparisons={data.benchmarkComparisons} />
        <ExcessReturns comparisons={data.benchmarkComparisons} />
        <RealizedUnrealized
          realizedGain={data.realizedGain}
          unrealizedGain={data.unrealizedGain}
          totalCost={data.totalCost}
        />
      </section>

      <section id="holdings" aria-labelledby="holdings-heading" className={groupClass}>
        <h3 id="holdings-heading" className={groupHeadingClass}>
          Holdings
        </h3>
        <LivePositionsTable />
        <CompositionDonut slices={data.donutSlices} />
        <ClassificationBarList title="Sector weights" items={data.sectorWeights} />
        <ClassificationBarList title="AI exposure" items={data.aiExposureWeights} />
        <HoldingsPerformanceChart data={data.holdingsPerformance} />
      </section>

      <section id="risk" aria-labelledby="risk-heading" className={groupClass}>
        <h3 id="risk-heading" className={groupHeadingClass}>
          Risk
        </h3>
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
          historyDays={data.historyDays}
          dailyChangeAsOf={data.dailyChangeAsOf}
          pricesAsOf={data.pricesAsOf}
          explainOpenId={explainOpenId}
        />
        <CorrelationHeatmap
          tickers={data.correlationTickers}
          matrix={data.correlationCells}
        />
        <HoldingRiskTable risks={data.holdingRisks} />
      </section>

      <section id="events" aria-labelledby="events-heading" className={groupClass}>
        <h3 id="events-heading" className={groupHeadingClass}>
          Events
        </h3>
        <EarningsCalendar events={data.upcomingEarnings} />
        {data.latestNews.length > 0 ? <LatestNews items={data.latestNews} /> : null}
        <LiveWinnersLosers winners={data.winners} losers={data.losers} />
      </section>
    </section>
  );
}
