import { mean } from "./stats";
import { annualizedVolatility, TRADING_DAYS_PER_YEAR } from "./volatility";

/**
 * Null (not NaN/Infinity) when volatility is null (fewer than 2 daily
 * returns) or exactly 0 (a constant return series has nothing to divide
 * excess return by).
 */
export function sharpeRatio(
  dailyReturns: number[],
  riskFreeRate = 0,
  tradingDaysPerYear = TRADING_DAYS_PER_YEAR,
): number | null {
  const vol = annualizedVolatility(dailyReturns, tradingDaysPerYear);
  if (vol === null || vol === 0) return null;
  const annualizedReturn = mean(dailyReturns) * tradingDaysPerYear;
  return (annualizedReturn - riskFreeRate) / vol;
}
