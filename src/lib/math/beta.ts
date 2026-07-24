import { covariance, sampleVariance } from "./stats";

/**
 * Beta of portfolio returns against benchmark returns. Both arrays must be
 * the same length and index-aligned by date. Null (not NaN) when the
 * benchmark has fewer than 2 returns or a constant (zero-variance) series
 * over the window — nothing to regress against.
 */
export function beta(portfolioReturns: number[], benchmarkReturns: number[]): number | null {
  if (portfolioReturns.length !== benchmarkReturns.length) {
    throw new Error("portfolioReturns and benchmarkReturns must be the same length");
  }
  const benchmarkVariance = sampleVariance(benchmarkReturns);
  if (benchmarkVariance === null || benchmarkVariance === 0) return null;
  return covariance(portfolioReturns, benchmarkReturns) / benchmarkVariance;
}
