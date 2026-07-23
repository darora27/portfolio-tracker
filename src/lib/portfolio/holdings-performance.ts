export type PricePoint = { date: string; price: number };

export type HoldingsPerformancePoint = {
  date: string;
  /** Ticker -> % return since that ticker's own first available price (e.g. 12.3 for +12.3%). Absent before that ticker has data. */
  [ticker: string]: number | string;
};

export type HoldingsPerformanceSeries = {
  /** Individually plotted tickers, ranked by weight descending, capped at maxSeries. */
  tickers: string[];
  /** True when one or more smaller holdings were folded into an "Other" aggregate line. */
  hasOther: boolean;
  points: HoldingsPerformancePoint[];
};

/**
 * Normalizes a single ticker's price history to % return since its OWN
 * first data point (functionally its purchase date) — not a shared
 * portfolio start date, since holdings were bought on different days.
 */
function normalizeToFirstPoint(prices: PricePoint[]): Map<string, number> {
  const sorted = [...prices].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const map = new Map<string, number>();
  if (sorted.length === 0) return map;
  const base = sorted[0].price;
  if (base === 0) return map;
  for (const p of sorted) {
    map.set(p.date, (p.price / base - 1) * 100);
  }
  return map;
}

/**
 * Builds the data for a multi-line "how have my holdings performed since
 * purchase" chart, plotted on a shared calendar date axis so lines are
 * visually comparable even though each starts on a different day.
 *
 * Categorical color only scales to ~8 distinguishable series (see the
 * dataviz palette this app validates against) — beyond that, the
 * smallest-weight holdings are folded into a single "Other" line: the
 * weight-weighted average of their normalized returns, renormalized each
 * day among whichever of those tickers has data on that date.
 */
export function buildHoldingsPerformance(
  positionsByWeightDesc: { ticker: string; weight: number }[],
  pricesByTicker: Map<string, PricePoint[]>,
  maxSeries = 8,
): HoldingsPerformanceSeries {
  const plotted = positionsByWeightDesc.slice(0, maxSeries);
  const folded = positionsByWeightDesc.slice(maxSeries);
  const hasOther = folded.length > 0;

  const normalizedByTicker = new Map<string, Map<string, number>>();
  for (const { ticker } of positionsByWeightDesc) {
    normalizedByTicker.set(ticker, normalizeToFirstPoint(pricesByTicker.get(ticker) ?? []));
  }

  const tickers = plotted.map((p) => p.ticker);
  const allDates = new Set<string>();
  for (const ticker of tickers) {
    for (const date of normalizedByTicker.get(ticker)!.keys()) allDates.add(date);
  }
  if (hasOther) {
    for (const { ticker } of folded) {
      for (const date of normalizedByTicker.get(ticker)!.keys()) allDates.add(date);
    }
  }

  const sortedDates = [...allDates].sort();
  const points: HoldingsPerformancePoint[] = sortedDates.map((date) => {
    const point: HoldingsPerformancePoint = { date };
    for (const ticker of tickers) {
      const v = normalizedByTicker.get(ticker)!.get(date);
      if (v !== undefined) point[ticker] = v;
    }
    if (hasOther) {
      let weightedSum = 0;
      let weightTotal = 0;
      for (const { ticker, weight } of folded) {
        const v = normalizedByTicker.get(ticker)!.get(date);
        if (v !== undefined) {
          weightedSum += v * weight;
          weightTotal += weight;
        }
      }
      if (weightTotal > 0) point.Other = weightedSum / weightTotal;
    }
    return point;
  });

  return { tickers, hasOther, points };
}
