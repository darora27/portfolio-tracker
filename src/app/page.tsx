import { supabase } from "@/lib/supabase/client";
import { dailyReturns } from "@/lib/math/returns";
import { twr } from "@/lib/math/twr";
import { drawdown } from "@/lib/math/drawdown";
import { annualizedVolatility } from "@/lib/math/volatility";
import { sharpeRatio } from "@/lib/math/sharpe";
import { xirr } from "@/lib/math/xirr";
import { daysBetween } from "@/lib/date";
import {
  buildXirrCashFlows,
  computeHoldings,
  concentration,
  latestKnownPrices,
  latestPriceDate,
  topWinnersLosers,
} from "@/lib/portfolio/holdings";
import { HeadlineStats } from "@/components/dashboard/HeadlineStats";
import { PositionsTable, type PositionRow } from "@/components/dashboard/PositionsTable";
import { WinnersLosers } from "@/components/dashboard/WinnersLosers";
import { ValueChart, type ChartPoint } from "@/components/dashboard/ValueChart";
import { RiskPanel } from "@/components/dashboard/RiskPanel";

// This dashboard reflects live DB state (trades can be added any time), so
// it must never be baked into a static build.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [
    { data: trades, error: tradesError },
    { data: snapshots, error: snapshotsError },
    { data: snapshotPositions, error: positionsError },
  ] = await Promise.all([
    supabase.from("trades").select("*").order("date", { ascending: true }),
    supabase.from("snapshots").select("*").order("date", { ascending: true }),
    supabase.from("snapshot_positions").select("snapshot_id, ticker, close_price"),
  ]);

  if (tradesError) throw tradesError;
  if (snapshotsError) throw snapshotsError;
  if (positionsError) throw positionsError;

  // Current holdings are derived from trades, never read from a stored table.
  const snapshotDateById = new Map((snapshots ?? []).map((s) => [s.id, s.date]));
  const priceRows = (snapshotPositions ?? [])
    .map((row) => {
      const date = snapshotDateById.get(row.snapshot_id);
      return date ? { ticker: row.ticker, closePrice: row.close_price, date } : null;
    })
    .filter((row): row is { ticker: string; closePrice: number; date: string } => row !== null);

  const prices = latestKnownPrices(priceRows);
  const positions = computeHoldings(trades ?? [], prices);

  const totalValue = positions.reduce((sum, p) => sum + p.value, 0);
  const totalCost = positions.reduce((sum, p) => sum + p.costBasis, 0);
  const simpleReturnPct = totalCost !== 0 ? (totalValue - totalCost) / totalCost : 0;
  const pricesAsOf = latestPriceDate(positions);

  const positionRows: PositionRow[] = positions.map((p) => ({
    ...p,
    contribution: p.gain !== null && totalCost !== 0 ? p.gain / totalCost : null,
  }));

  const { winners, losers } = topWinnersLosers(positions, 3);
  const { top2, hhi } = concentration(positions);

  // Performance history from daily snapshots, net of cash flows. Drop any
  // leading zero-value snapshots (days before the first investment) since
  // the return formula divides by the prior day's value.
  const allMathSnapshots = (snapshots ?? []).map((s) => ({
    date: s.date,
    totalCost: s.total_cost,
    totalValue: s.total_value,
  }));
  const firstFundedIndex = allMathSnapshots.findIndex((s) => s.totalValue > 0);
  const mathSnapshots = firstFundedIndex >= 0 ? allMathSnapshots.slice(firstFundedIndex) : [];
  const returns = dailyReturns(mathSnapshots);
  const twrPct = twr(returns);
  const { maxDrawdown } = drawdown(returns);
  const volatilityPct = annualizedVolatility(returns);
  const sharpe = sharpeRatio(returns);

  const lastSnapshot = mathSnapshots.at(-1);
  const prevSnapshot = mathSnapshots.at(-2);
  const dailyChange =
    lastSnapshot && prevSnapshot ? lastSnapshot.totalValue - prevSnapshot.totalValue : 0;
  const dailyChangePct =
    lastSnapshot && prevSnapshot && prevSnapshot.totalValue !== 0
      ? dailyChange / prevSnapshot.totalValue
      : 0;

  const today = new Date().toISOString().slice(0, 10);
  const cashFlows = buildXirrCashFlows(trades ?? [], totalValue, today);
  const xirrPct = cashFlows.length >= 2 ? xirr(cashFlows) : 0;
  const historyDays = mathSnapshots[0] ? daysBetween(mathSnapshots[0].date, today) : 0;

  const chartData: ChartPoint[] = [];
  if (mathSnapshots.length > 0) {
    let index = 100;
    chartData.push({ date: mathSnapshots[0].date, portfolioIndex: index });
    returns.forEach((r, i) => {
      index *= 1 + r;
      chartData.push({ date: mathSnapshots[i + 1].date, portfolioIndex: index });
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold">Portfolio Tracker</h1>

      <div className="mt-8 space-y-10">
        <HeadlineStats
          totalValue={totalValue}
          totalCost={totalCost}
          simpleReturnPct={simpleReturnPct}
          dailyChange={dailyChange}
          dailyChangePct={dailyChangePct}
          dailyChangeAsOf={lastSnapshot?.date ?? today}
          twrPct={twrPct}
          xirrPct={xirrPct}
          historyDays={historyDays}
          pricesAsOf={pricesAsOf}
        />

        <ValueChart data={chartData} />

        <PositionsTable positions={positionRows} />

        <WinnersLosers winners={winners} losers={losers} />

        <RiskPanel
          volatilityPct={volatilityPct}
          maxDrawdownPct={maxDrawdown}
          sharpe={sharpe}
          top2ConcentrationPct={top2}
          hhi={hhi}
        />
      </div>
    </div>
  );
}
