import { supabase } from "@/lib/supabase/client";
import { dailyReturns } from "@/lib/math/returns";
import { drawdown } from "@/lib/math/drawdown";
import { buildHistoryRows, type HistoryRow } from "@/lib/portfolio/history";
import { buildCompositionHistory, type CompositionHistorySeries } from "@/lib/portfolio/composition-history";

export type { HistoryRow };

export type HistoryData = {
  /** Newest first, for the table. */
  rows: HistoryRow[];
  /** Oldest first, for the daily-returns bar chart. */
  dailyReturnBars: { date: string; return: number }[];
  /** Oldest first, for the drawdown area chart. */
  drawdownSeries: { date: string; drawdown: number }[];
  compositionHistory: CompositionHistorySeries;
};

export async function getHistoryData(): Promise<HistoryData> {
  const [{ data: snapshots, error }, { data: snapshotPositions, error: positionsError }] = await Promise.all([
    supabase.from("snapshots").select("*").order("date", { ascending: true }),
    supabase.from("snapshot_positions").select("snapshot_id, ticker, value"),
  ]);
  if (error) throw error;
  if (positionsError) throw positionsError;

  const allMathSnapshots = (snapshots ?? []).map((s) => ({
    date: s.date,
    totalCost: s.total_cost,
    totalValue: s.total_value,
  }));
  const firstFundedIndex = allMathSnapshots.findIndex((s) => s.totalValue > 0);
  const mathSnapshots = firstFundedIndex >= 0 ? allMathSnapshots.slice(firstFundedIndex) : [];

  const rows = buildHistoryRows(mathSnapshots);

  const returns = dailyReturns(mathSnapshots);
  const dailyReturnBars = mathSnapshots.slice(1).map((s, i) => ({ date: s.date, return: returns[i] }));
  const { series: drawdownSeriesRaw } = drawdown(returns);
  const drawdownSeries = mathSnapshots.map((s, i) => ({ date: s.date, drawdown: drawdownSeriesRaw[i] }));

  // Portfolio composition over time: each snapshot's per-ticker value,
  // divided by that same day's total value. Ranked by the LATEST
  // snapshot's per-ticker value (not live quotes — history-data.ts has
  // no Finnhub dependency by design) so the top-8-by-weight grouping
  // roughly agrees with the live dashboard's Holdings Performance chart.
  const dateBySnapshotId = new Map((snapshots ?? []).map((s) => [s.id, s.date]));
  const valueByDateByTicker = new Map<string, Map<string, number>>();
  for (const row of snapshotPositions ?? []) {
    const date = dateBySnapshotId.get(row.snapshot_id);
    if (!date) continue;
    const forDate = valueByDateByTicker.get(date) ?? new Map<string, number>();
    forDate.set(row.ticker, row.value);
    valueByDateByTicker.set(date, forDate);
  }
  const totalValueByDate = new Map(mathSnapshots.map((s) => [s.date, s.totalValue]));
  const latestDate = mathSnapshots.at(-1)?.date;
  const latestValues = latestDate ? (valueByDateByTicker.get(latestDate) ?? new Map()) : new Map();
  const rankedTickers = [...latestValues.entries()].sort((a, b) => b[1] - a[1]).map(([ticker]) => ticker);
  const compositionHistory = buildCompositionHistory(rankedTickers, valueByDateByTicker, totalValueByDate);

  return {
    rows: [...rows].reverse(),
    dailyReturnBars,
    drawdownSeries,
    compositionHistory,
  };
}
