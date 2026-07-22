import { sampleStdDev } from "./stats";

export const TRADING_DAYS_PER_YEAR = 252;

export function annualizedVolatility(
  dailyReturns: number[],
  tradingDaysPerYear = TRADING_DAYS_PER_YEAR,
): number {
  return sampleStdDev(dailyReturns) * Math.sqrt(tradingDaysPerYear);
}
