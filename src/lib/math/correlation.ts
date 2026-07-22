import { covariance, sampleVariance } from "./stats";

export type ReturnPoint = { date: string; r: number };

/**
 * Pairwise correlation matrix across tickers. Holdings are bought on
 * different days, so each pair's overlap window differs — for every pair,
 * only the dates BOTH tickers have a return for are used (not a single
 * shared date range across all tickers). Fewer than `minOverlap` shared
 * observations, or a constant (zero-variance) series over that overlap,
 * produces `null` for that cell rather than `NaN` or a crash.
 */
export function correlationMatrix(
  returnsByTicker: Record<string, ReturnPoint[]>,
  minOverlap = 5,
): { tickers: string[]; matrix: (number | null)[][] } {
  const tickers = Object.keys(returnsByTicker);
  const byDate = new Map<string, Map<string, number>>(
    tickers.map((ticker) => [ticker, new Map(returnsByTicker[ticker].map((p) => [p.date, p.r]))]),
  );

  const matrix: (number | null)[][] = tickers.map((tickerA) => {
    const mapA = byDate.get(tickerA)!;
    return tickers.map((tickerB) => {
      const mapB = byDate.get(tickerB)!;
      const sharedDates = [...mapA.keys()].filter((d) => mapB.has(d));
      if (sharedDates.length < minOverlap) return null;

      const a = sharedDates.map((d) => mapA.get(d)!);
      const b = sharedDates.map((d) => mapB.get(d)!);
      const varA = sampleVariance(a);
      const varB = sampleVariance(b);
      if (varA === 0 || varB === 0) return null;

      return covariance(a, b) / Math.sqrt(varA * varB);
    });
  });

  return { tickers, matrix };
}
