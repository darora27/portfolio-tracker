import { dailyReturns } from "@/lib/math/returns";
import { twr } from "@/lib/math/twr";
import { beta } from "@/lib/math/beta";

export type BenchmarkTicker = "VOO" | "VTI" | "XLK";

export type BenchmarkComparison = {
  ticker: BenchmarkTicker;
  available: boolean;
  beta: number | null;
  twrPct: number | null;
  excessReturnPct: number | null;
  /** Indexed to 100 at benchmarkDates[0], one entry per date including the start. Empty when unavailable. */
  chartIndex: number[];
};

/**
 * Beta, same-period TWR, and excess return (portfolio TWR minus benchmark
 * TWR) for one benchmark against the portfolio's funded history. Only
 * meaningful when the benchmark has a close price for every one of
 * `benchmarkDates` — a partial/misaligned comparison is worse than none, so
 * this returns `available: false` (nulls, empty chart series) rather than
 * silently comparing over a shorter window.
 */
export function computeBenchmarkComparison(
  ticker: BenchmarkTicker,
  closeByDate: Map<string, number>,
  benchmarkDates: string[],
  portfolioReturns: number[],
  portfolioTwrPct: number,
): BenchmarkComparison {
  const available = benchmarkDates.length > 0 && benchmarkDates.every((d) => closeByDate.has(d));
  if (!available) {
    return { ticker, available: false, beta: null, twrPct: null, excessReturnPct: null, chartIndex: [] };
  }

  const benchmarkSnapshots = benchmarkDates.map((date) => ({
    date,
    totalCost: 0, // the benchmark itself has no cash flows; this reduces dailyReturns to a plain % change
    totalValue: closeByDate.get(date)!,
  }));
  const benchmarkReturns = dailyReturns(benchmarkSnapshots);
  const betaValue = beta(portfolioReturns, benchmarkReturns);
  const twrPct = twr(benchmarkReturns);

  let index = 100;
  const chartIndex = [index];
  for (const r of benchmarkReturns) {
    index *= 1 + r;
    chartIndex.push(index);
  }

  return {
    ticker,
    available: true,
    beta: betaValue,
    twrPct,
    excessReturnPct: portfolioTwrPct - twrPct,
    chartIndex,
  };
}
