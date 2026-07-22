import { mean } from "./stats";
import { annualizedVolatility, TRADING_DAYS_PER_YEAR } from "./volatility";

export function sharpeRatio(
  dailyReturns: number[],
  riskFreeRate = 0,
  tradingDaysPerYear = TRADING_DAYS_PER_YEAR,
): number {
  const annualizedReturn = mean(dailyReturns) * tradingDaysPerYear;
  const vol = annualizedVolatility(dailyReturns, tradingDaysPerYear);
  return (annualizedReturn - riskFreeRate) / vol;
}
