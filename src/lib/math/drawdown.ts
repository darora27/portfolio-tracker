export type DrawdownResult = {
  /** Largest peak-to-trough decline, e.g. -0.2 for -20%. 0 if never negative. */
  maxDrawdown: number;
  /** Drawdown at each point of the equity curve; series[0] is 0 (the start). */
  series: number[];
};

/**
 * Builds a cumulative growth index from daily net-of-flow returns (starting
 * at 1, so cash flows don't distort the curve) and measures decline from the
 * running peak.
 */
export function drawdown(dailyReturns: number[]): DrawdownResult {
  let index = 1;
  let peak = 1;
  const series: number[] = [0];
  let maxDrawdown = 0;
  for (const r of dailyReturns) {
    index *= 1 + r;
    peak = Math.max(peak, index);
    const dd = index / peak - 1;
    series.push(dd);
    maxDrawdown = Math.min(maxDrawdown, dd);
  }
  return { maxDrawdown, series };
}
