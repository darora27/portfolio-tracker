import { sampleStdDev } from "./stats";

export const TRADING_DAYS_PER_YEAR = 252;

/** Null (not NaN) when there are fewer than 2 daily returns to compute a sample standard deviation from. */
export function annualizedVolatility(
  dailyReturns: number[],
  tradingDaysPerYear = TRADING_DAYS_PER_YEAR,
): number | null {
  const stdDev = sampleStdDev(dailyReturns);
  return stdDev === null ? null : stdDev * Math.sqrt(tradingDaysPerYear);
}
