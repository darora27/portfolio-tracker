import { supabase } from "@/lib/supabase/client";
import { getQuotes, getUpcomingEarnings } from "@/lib/finnhub";
import type { EarningsEvent } from "@/lib/finnhub-earnings";
import { dailyReturns } from "@/lib/math/returns";
import { twr } from "@/lib/math/twr";
import { drawdown } from "@/lib/math/drawdown";
import { annualizedVolatility } from "@/lib/math/volatility";
import { sharpeRatio } from "@/lib/math/sharpe";
import { beta } from "@/lib/math/beta";
import { xirr } from "@/lib/math/xirr";
import { daysBetween, todayInTimeZone } from "@/lib/date";
import {
  buildXirrCashFlows,
  computeHoldings,
  concentration,
  latestKnownPrices,
  latestPriceDate,
  mergePrices,
  topWinnersLosers,
  type Position,
} from "@/lib/portfolio/holdings";
import type { ChartPoint } from "@/components/dashboard/ValueChart";
import type { PositionRow } from "@/components/dashboard/PositionsTable";

export type DashboardData = {
  totalValue: number;
  totalCost: number;
  simpleReturnPct: number;
  dailyChange: number;
  dailyChangePct: number;
  dailyChangeAsOf: string;
  twrPct: number;
  xirrPct: number;
  historyDays: number;
  pricesAsOf: string | null;
  chartData: ChartPoint[];
  positionRows: PositionRow[];
  winners: (Position & { gainPct: number })[];
  losers: (Position & { gainPct: number })[];
  upcomingEarnings: EarningsEvent[];
  volatilityPct: number;
  maxDrawdown: number;
  sharpe: number;
  betaVsVoo: number | null;
  top2ConcentrationPct: number;
  hhi: number;
};

/**
 * All computed dashboard data, shared between the owner's private view (/)
 * and the public read-only view (/share) — both render the same numbers,
 * they just differ in whether dollar amounts are shown.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const [
    { data: trades, error: tradesError },
    { data: snapshots, error: snapshotsError },
    { data: snapshotPositions, error: positionsError },
    { data: vooBenchmarks, error: benchmarksError },
  ] = await Promise.all([
    supabase.from("trades").select("*").order("date", { ascending: true }),
    supabase.from("snapshots").select("*").order("date", { ascending: true }),
    supabase.from("snapshot_positions").select("snapshot_id, ticker, close_price"),
    supabase.from("benchmarks").select("date, close").eq("ticker", "VOO"),
  ]);

  if (tradesError) throw tradesError;
  if (snapshotsError) throw snapshotsError;
  if (positionsError) throw positionsError;
  if (benchmarksError) throw benchmarksError;

  const today = todayInTimeZone("America/New_York");

  // Current holdings are derived from trades, never read from a stored table.
  const snapshotDateById = new Map((snapshots ?? []).map((s) => [s.id, s.date]));
  const priceRows = (snapshotPositions ?? [])
    .map((row) => {
      const date = snapshotDateById.get(row.snapshot_id);
      return date ? { ticker: row.ticker, closePrice: row.close_price, date } : null;
    })
    .filter((row): row is { ticker: string; closePrice: number; date: string } => row !== null);
  const fallbackPrices = latestKnownPrices(priceRows);

  // Live quotes take priority; if Finnhub is down or rate-limited for a
  // ticker, mergePrices falls back to its last known snapshot price rather
  // than showing no price (or $0) at all.
  const heldTickers = computeHoldings(trades ?? [], new Map()).map((p) => p.ticker);
  const [liveQuotes, upcomingEarnings] = await Promise.all([
    getQuotes(heldTickers),
    getUpcomingEarnings(heldTickers),
  ]);
  const livePrices = new Map(
    [...liveQuotes.entries()].map(([ticker, quote]) => [
      ticker,
      { price: quote.price, date: today },
    ]),
  );
  const prices = mergePrices(livePrices, fallbackPrices);
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

  // Benchmark (VOO) daily returns, aligned to the exact same dates as the
  // portfolio's funded history — beta and the chart comparison are only
  // meaningful over an identical date range. Both series start indexed at
  // 100 on the same first funded date (neither has a "return" for that
  // first day itself), so no separate anchor day is needed here. Falls
  // back to unavailable (rather than a partial/misaligned comparison) if
  // any date is missing.
  const benchmarkDates = mathSnapshots.map((s) => s.date);
  const vooCloseByDate = new Map((vooBenchmarks ?? []).map((b) => [b.date, b.close]));
  const hasCompleteBenchmarkHistory =
    benchmarkDates.length > 0 && benchmarkDates.every((d) => vooCloseByDate.has(d));

  let benchmarkReturns: number[] = [];
  let betaVsVoo: number | null = null;
  if (hasCompleteBenchmarkHistory) {
    const benchmarkSnapshots = benchmarkDates.map((date) => ({
      date,
      totalCost: 0, // VOO itself has no cash flows; this reduces dailyReturns to a plain % change
      totalValue: vooCloseByDate.get(date)!,
    }));
    benchmarkReturns = dailyReturns(benchmarkSnapshots);
    betaVsVoo = beta(returns, benchmarkReturns);
  }

  const lastSnapshot = mathSnapshots.at(-1);
  const prevSnapshot = mathSnapshots.at(-2);
  const dailyChange =
    lastSnapshot && prevSnapshot ? lastSnapshot.totalValue - prevSnapshot.totalValue : 0;
  const dailyChangePct =
    lastSnapshot && prevSnapshot && prevSnapshot.totalValue !== 0
      ? dailyChange / prevSnapshot.totalValue
      : 0;

  const cashFlows = buildXirrCashFlows(trades ?? [], totalValue, today);
  const xirrPct = cashFlows.length >= 2 ? xirr(cashFlows) : 0;
  const historyDays = mathSnapshots[0] ? daysBetween(mathSnapshots[0].date, today) : 0;

  const chartData: ChartPoint[] = [];
  if (mathSnapshots.length > 0) {
    let index = 100;
    let benchmarkIndex = hasCompleteBenchmarkHistory ? 100 : undefined;
    chartData.push({ date: mathSnapshots[0].date, portfolioIndex: index, benchmarkIndex });
    returns.forEach((r, i) => {
      index *= 1 + r;
      if (benchmarkIndex !== undefined) benchmarkIndex *= 1 + benchmarkReturns[i];
      chartData.push({ date: mathSnapshots[i + 1].date, portfolioIndex: index, benchmarkIndex });
    });
  }

  return {
    totalValue,
    totalCost,
    simpleReturnPct,
    dailyChange,
    dailyChangePct,
    dailyChangeAsOf: lastSnapshot?.date ?? today,
    twrPct,
    xirrPct,
    historyDays,
    pricesAsOf,
    chartData,
    positionRows,
    winners,
    losers,
    upcomingEarnings,
    volatilityPct,
    maxDrawdown,
    sharpe,
    betaVsVoo,
    top2ConcentrationPct: top2,
    hhi,
  };
}
