import type { DailySnapshot } from "./types";

/**
 * Daily return net of cash flows: r_t = (V_t - F_t) / V_{t-1} - 1, where F_t
 * is the cash added that day (change in total cost basis). The first
 * snapshot has no prior day, so it produces no return — the result has
 * length `snapshots.length - 1`.
 */
export function dailyReturns(snapshots: DailySnapshot[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1];
    const curr = snapshots[i];
    const flow = curr.totalCost - prev.totalCost;
    returns.push((curr.totalValue - flow) / prev.totalValue - 1);
  }
  return returns;
}

/**
 * Simple close-to-close price returns for a single ticker — no cash-flow
 * adjustment, since a single security's own price history has no "flows"
 * of its own. Input need not be pre-sorted. Fewer than 2 prices produces
 * no returns.
 */
export function priceReturns(
  prices: { date: string; price: number }[],
): { date: string; r: number }[] {
  const sorted = [...prices].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const returns: { date: string; r: number }[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1].price;
    if (prev === 0) continue;
    returns.push({ date: sorted[i].date, r: sorted[i].price / prev - 1 });
  }
  return returns;
}
