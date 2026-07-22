import { covariance, sampleVariance } from "./stats";

/**
 * Beta of portfolio returns against benchmark returns. Both arrays must be
 * the same length and index-aligned by date.
 */
export function beta(portfolioReturns: number[], benchmarkReturns: number[]): number {
  if (portfolioReturns.length !== benchmarkReturns.length) {
    throw new Error("portfolioReturns and benchmarkReturns must be the same length");
  }
  return covariance(portfolioReturns, benchmarkReturns) / sampleVariance(benchmarkReturns);
}
