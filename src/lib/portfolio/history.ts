import type { DailySnapshot } from "@/lib/math/types";
import { dailyReturns } from "@/lib/math/returns";
import { dailyChangeAmount, dailyChangePercent } from "@/lib/math/daily-change";

export type HistoryRow = {
  date: string;
  invested: number;
  value: number;
  day: number | null;
  dayPct: number | null;
  cumulativeTwr: number;
};

/**
 * Per-day history rows (oldest first), net of cash flows throughout. Day
 * $/% reuse the exact same flow-adjusted formula as the dashboard's live
 * Daily Change card (dailyChangeAmount/Percent from daily-change.ts),
 * just fed the cost-basis delta between two already-closed snapshots
 * instead of today's live trades — the two are mathematically the same
 * "backed out cash flow", just sourced differently depending on whether
 * the later day has closed yet.
 */
export function buildHistoryRows(mathSnapshots: DailySnapshot[]): HistoryRow[] {
  const returns = dailyReturns(mathSnapshots);
  let growthIndex = 1;
  const growthIndexSeries = [growthIndex, ...returns.map((r) => (growthIndex *= 1 + r))];

  return mathSnapshots.map((s, i) => {
    if (i === 0) {
      return { date: s.date, invested: s.totalCost, value: s.totalValue, day: null, dayPct: null, cumulativeTwr: 0 };
    }
    const prev = mathSnapshots[i - 1];
    const flow = s.totalCost - prev.totalCost;
    return {
      date: s.date,
      invested: s.totalCost,
      value: s.totalValue,
      day: dailyChangeAmount(s.totalValue, prev.totalValue, flow),
      dayPct: dailyChangePercent(s.totalValue, prev.totalValue, flow),
      cumulativeTwr: growthIndexSeries[i] - 1,
    };
  });
}
