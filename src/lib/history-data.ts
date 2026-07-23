import { supabase } from "@/lib/supabase/client";
import { dailyReturns } from "@/lib/math/returns";
import { drawdown } from "@/lib/math/drawdown";
import { buildHistoryRows, type HistoryRow } from "@/lib/portfolio/history";

export type { HistoryRow };

export type HistoryData = {
  /** Newest first, for the table. */
  rows: HistoryRow[];
  /** Oldest first, for the daily-returns bar chart. */
  dailyReturnBars: { date: string; return: number }[];
  /** Oldest first, for the drawdown area chart. */
  drawdownSeries: { date: string; drawdown: number }[];
};

export async function getHistoryData(): Promise<HistoryData> {
  const { data: snapshots, error } = await supabase
    .from("snapshots")
    .select("*")
    .order("date", { ascending: true });
  if (error) throw error;

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

  return {
    rows: [...rows].reverse(),
    dailyReturnBars,
    drawdownSeries,
  };
}
