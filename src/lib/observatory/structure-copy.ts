import { formatPercent } from "@/lib/format";
import { riskLine } from "@/lib/surface-copy";

export type CorrelatedPair = {
  a: string;
  b: string;
  correlation: number;
};

export function structureConcentrationCopy(
  hhi: number,
  top2ConcentrationPct: number,
): string {
  return `${riskLine(hhi)} The top two holdings make up ${formatPercent(top2ConcentrationPct, 1)} of the portfolio.`;
}

export function mostCorrelatedPair(
  tickers: string[],
  cells: (number | null)[][],
): CorrelatedPair | null {
  let result: CorrelatedPair | null = null;

  for (let i = 0; i < tickers.length; i += 1) {
    for (let j = i + 1; j < tickers.length; j += 1) {
      const correlation = cells[i]?.[j];
      if (
        correlation !== null &&
        correlation !== undefined &&
        (result === null || correlation > result.correlation)
      ) {
        result = { a: tickers[i], b: tickers[j], correlation };
      }
    }
  }

  return result;
}
