import { annualizedVolatility } from "@/lib/math/volatility";
import { beta } from "@/lib/math/beta";
import { sampleVariance } from "@/lib/math/stats";
import type { ReturnPoint } from "@/lib/math/correlation";

export type HoldingRisk = {
  ticker: string;
  volatilityPct: number | null;
  betaVsVoo: number | null;
};

const MIN_OVERLAP = 5;

/**
 * Annualized volatility (needs no alignment — a ticker's own price
 * returns) and beta vs VOO (needs date alignment, same "shared dates
 * only" approach as correlationMatrix — holdings were bought on
 * different days so each ticker's overlap with VOO differs) for every
 * currently-held ticker. Either figure is null when there isn't enough
 * history yet (fewer than 2 returns for volatility, fewer than
 * MIN_OVERLAP shared trading days or zero VOO variance for beta) rather
 * than a divide-by-zero NaN.
 */
export function perHoldingRisk(
  returnsByTicker: Record<string, ReturnPoint[]>,
  vooReturns: ReturnPoint[],
): HoldingRisk[] {
  const vooByDate = new Map(vooReturns.map((p) => [p.date, p.r]));

  return Object.entries(returnsByTicker).map(([ticker, points]) => {
    const returns = points.map((p) => p.r);
    const volatilityPct = returns.length >= 2 ? annualizedVolatility(returns) : null;

    const sharedDates = points.filter((p) => vooByDate.has(p.date));
    let betaVsVoo: number | null = null;
    if (sharedDates.length >= MIN_OVERLAP) {
      const a = sharedDates.map((p) => p.r);
      const b = sharedDates.map((p) => vooByDate.get(p.date)!);
      if (sampleVariance(b) !== 0) {
        betaVsVoo = beta(a, b);
      }
    }

    return { ticker, volatilityPct, betaVsVoo };
  });
}
