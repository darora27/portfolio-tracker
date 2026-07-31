import { addDays } from "@/lib/date";

export type ChartRoomRange = "7d" | "30d" | "sinceBuy" | "max";

/**
 * Slices a ticker's own price history to one of the graph's four range
 * detents. 7d/30d are calendar-day trailing windows from the series' own
 * last date (same addDays pattern trailing-return.ts uses), not a fixed
 * session count — a holding with gaps in its history still gets a window
 * proportional to real elapsed time. Never crashes on thin history: a
 * window that reaches further back than the data available simply returns
 * everything there is.
 */
export function sliceToRange(
  priceHistory: { date: string; price: number }[],
  range: ChartRoomRange,
  firstTradeDate: string | null,
): { date: string; price: number }[] {
  if (priceHistory.length === 0) return [];

  if (range === "max") return [...priceHistory];

  if (range === "sinceBuy") {
    if (!firstTradeDate) return [];
    return priceHistory.filter((p) => p.date >= firstTradeDate);
  }

  const days = range === "7d" ? 7 : 30;
  const lastDate = priceHistory[priceHistory.length - 1].date;
  const targetDate = addDays(lastDate, -days);
  return priceHistory.filter((p) => p.date >= targetDate);
}

/**
 * Aligns a comparison series (VOO close history, book growth index) to an
 * exact list of dates — the currently displayed graph range's own dates,
 * per the mock's "SAME PERIOD" overlay labels. Returns `available: false`
 * (mirroring computeBenchmarkComparison's own guard) rather than silently
 * comparing over a shorter, misaligned window when any requested date is
 * missing from the series.
 */
export function alignToDates<V>(
  series: { date: string; value: V }[],
  dates: string[],
): { available: true; values: V[] } | { available: false } {
  const byDate = new Map(series.map((p) => [p.date, p.value]));
  const values: V[] = [];
  for (const date of dates) {
    const value = byDate.get(date);
    if (value === undefined) return { available: false };
    values.push(value);
  }
  return { available: true, values };
}
