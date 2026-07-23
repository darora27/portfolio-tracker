export type AllTimeHighInfo = {
  /** last/peak - 1. Always <= 0, since peak includes the last point itself. 0 exactly means "at the high". */
  pct: number;
  peakDate: string;
};

/**
 * How far the most recent point in a growth-index series sits below its
 * own running peak (which may be the last point itself). Null for an
 * empty series.
 */
export function fromAllTimeHigh(series: { date: string; index: number }[]): AllTimeHighInfo | null {
  if (series.length === 0) return null;
  const peak = series.reduce((best, cur) => (cur.index > best.index ? cur : best));
  const last = series[series.length - 1];
  return { pct: peak.index !== 0 ? last.index / peak.index - 1 : 0, peakDate: peak.date };
}
