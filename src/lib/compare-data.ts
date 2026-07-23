import { supabase } from "@/lib/supabase/client";
import { computeHoldings } from "@/lib/portfolio/holdings";
import { dailyReturns } from "@/lib/math/returns";
import { annualizedVolatility } from "@/lib/math/volatility";
import { drawdown } from "@/lib/math/drawdown";
import {
  steadyMarket,
  techTilt,
  aiConcentrate,
  SIM_INCEPTION_DATE,
  type CloseMap,
  type SimResult,
} from "@/lib/math/sim-portfolio";
import aiExposureByTicker from "../../data/ai-exposure.json";

export type CompareRow = {
  name: string;
  twrPct: number;
  volatilityPct: number;
  maxDrawdown: number;
};

export type CompareChartPoint = {
  date: string;
  portfolio?: number;
  steadyMarket?: number;
  techTilt?: number;
  aiConcentrate?: number;
};

export type CompareData = {
  /** Real portfolio's own growth index, indexed to 100 at SIM_INCEPTION_DATE. Empty if the portfolio has no snapshots on/after inception. */
  realPortfolioSeries: { date: string; index: number }[];
  sims: SimResult[];
  stats: CompareRow[];
  /** realPortfolioSeries + all three sims' value series, indexed to 100, merged by date for the chart. */
  chartData: CompareChartPoint[];
};

/** All computed /compare data — owner-only, zero new external calls (pure math over data already in the database). */
export async function getCompareData(): Promise<CompareData> {
  const [
    { data: trades, error: tradesError },
    { data: snapshots, error: snapshotsError },
    { data: snapshotPositions, error: positionsError },
    { data: benchmarkRows, error: benchmarksError },
  ] = await Promise.all([
    supabase.from("trades").select("*"),
    supabase.from("snapshots").select("*").order("date", { ascending: true }),
    supabase.from("snapshot_positions").select("snapshot_id, ticker, close_price"),
    supabase.from("benchmarks").select("date, close, ticker").in("ticker", ["VOO", "XLK"]),
  ]);
  if (tradesError) throw tradesError;
  if (snapshotsError) throw snapshotsError;
  if (positionsError) throw positionsError;
  if (benchmarksError) throw benchmarksError;

  const dates = (snapshots ?? [])
    .map((s) => s.date)
    .filter((d) => d >= SIM_INCEPTION_DATE)
    .sort();

  const closes: CloseMap = new Map();
  for (const row of benchmarkRows ?? []) {
    const series = closes.get(row.ticker) ?? new Map<string, number>();
    series.set(row.date, row.close);
    closes.set(row.ticker, series);
  }

  const snapshotDateById = new Map((snapshots ?? []).map((s) => [s.id, s.date]));
  for (const row of snapshotPositions ?? []) {
    const date = snapshotDateById.get(row.snapshot_id);
    if (!date) continue;
    const series = closes.get(row.ticker) ?? new Map<string, number>();
    series.set(date, row.close_price);
    closes.set(row.ticker, series);
  }

  const heldTickers = computeHoldings(trades ?? [], new Map()).map((p) => p.ticker);
  const aiExposureMap = new Map(Object.entries(aiExposureByTicker));
  const qualifyingTickers = heldTickers.filter((t) => aiExposureMap.get(t) === "High");

  const vooCloses = closes.get("VOO") ?? new Map<string, number>();

  const sims: SimResult[] = [steadyMarket(dates, vooCloses), techTilt(dates, closes), aiConcentrate(dates, closes, qualifyingTickers)];

  const stats: CompareRow[] = sims.map((sim) => ({
    name: sim.name,
    twrPct: sim.twrPct,
    volatilityPct: annualizedVolatility(sim.returns),
    maxDrawdown: drawdown(sim.returns).maxDrawdown,
  }));

  // Real portfolio, net of cash flows — the same TWR growth-index
  // convention as everywhere else in the app (dashboard-data.ts), NOT a
  // raw value ratio (which would show deposits like the $2,775 COST
  // purchase as if they were investment gains — the exact bug Phase 8
  // §1 fixed for the Daily Change card). Re-based to 100 at
  // SIM_INCEPTION_DATE specifically (which may differ from the
  // portfolio's own first-funded day) for a fair same-period comparison
  // against the sims.
  const allMathSnapshots = (snapshots ?? []).map((s) => ({
    date: s.date,
    totalCost: s.total_cost,
    totalValue: s.total_value,
  }));
  const firstFundedIndex = allMathSnapshots.findIndex((s) => s.totalValue > 0);
  const mathSnapshots = firstFundedIndex >= 0 ? allMathSnapshots.slice(firstFundedIndex) : [];
  const portfolioReturns = dailyReturns(mathSnapshots);

  let growthIndexValue = 1;
  const growthIndexSeries = mathSnapshots.map((s, i) => ({
    date: s.date,
    index: i === 0 ? growthIndexValue : (growthIndexValue *= 1 + portfolioReturns[i - 1]),
  }));

  const baseEntry = growthIndexSeries.find((g) => g.date >= SIM_INCEPTION_DATE);
  const realPortfolioSeries: { date: string; index: number }[] = baseEntry
    ? growthIndexSeries
        .filter((g) => g.date >= SIM_INCEPTION_DATE)
        .map((g) => ({ date: g.date, index: (g.index / baseEntry.index) * 100 }))
    : [];

  // Sims start at exactly $10,000, so indexing to 100 is just value/100.
  const [steadyMarketSim, techTiltSim, aiConcentrateSim] = sims;
  const chartByDate = new Map<string, CompareChartPoint>();
  const setPoint = (date: string, key: keyof Omit<CompareChartPoint, "date">, value: number) => {
    const point = chartByDate.get(date) ?? { date };
    point[key] = value;
    chartByDate.set(date, point);
  };
  for (const p of realPortfolioSeries) setPoint(p.date, "portfolio", p.index);
  for (const p of steadyMarketSim.valueSeries) setPoint(p.date, "steadyMarket", p.value / 100);
  for (const p of techTiltSim.valueSeries) setPoint(p.date, "techTilt", p.value / 100);
  for (const p of aiConcentrateSim.valueSeries) setPoint(p.date, "aiConcentrate", p.value / 100);
  const chartData = [...chartByDate.values()].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  return { realPortfolioSeries, sims, stats, chartData };
}
