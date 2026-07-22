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
