export type CompositionHistoryPoint = {
  date: string;
  [ticker: string]: number | string;
};

export type CompositionHistorySeries = {
  /** Individually plotted tickers, ranked by current weight descending, capped at maxSeries. */
  tickers: string[];
  hasOther: boolean;
  points: CompositionHistoryPoint[];
};

/**
 * Portfolio composition (weight %) over time, for a stacked area chart.
 * Unlike the Holdings Performance chart, missing days default to 0% (not
 * a gap) — a ticker not yet purchased, or already sold, legitimately
 * held 0% of the portfolio that day, which is what a stacked chart needs
 * to keep summing to 100.
 *
 * Same categorical-color budget as Holdings Performance: caps at
 * `maxSeries` named tickers (ranked by CURRENT weight, so the two charts
 * agree on which holdings get their own line), folding the rest into a
 * single "Other" band.
 */
export function buildCompositionHistory(
  rankedTickers: string[],
  valueByDateByTicker: Map<string, Map<string, number>>,
  totalValueByDate: Map<string, number>,
  maxSeries = 8,
): CompositionHistorySeries {
  const plotted = rankedTickers.slice(0, maxSeries);
  const folded = rankedTickers.slice(maxSeries);
  const hasOther = folded.length > 0;

  const dates = [...totalValueByDate.keys()].sort();
  const points: CompositionHistoryPoint[] = dates.map((date) => {
    const point: CompositionHistoryPoint = { date };
    const totalValue = totalValueByDate.get(date) ?? 0;
    const valuesForDate = valueByDateByTicker.get(date) ?? new Map<string, number>();

    if (totalValue > 0) {
      for (const ticker of plotted) {
        point[ticker] = ((valuesForDate.get(ticker) ?? 0) / totalValue) * 100;
      }
      if (hasOther) {
        const otherSum = folded.reduce((sum, ticker) => sum + (valuesForDate.get(ticker) ?? 0), 0);
        point.Other = (otherSum / totalValue) * 100;
      }
    } else {
      for (const ticker of plotted) point[ticker] = 0;
      if (hasOther) point.Other = 0;
    }

    return point;
  });

  return { tickers: plotted, hasOther, points };
}
