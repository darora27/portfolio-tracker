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
        // Top |r|, not top r -- a strong negative correlation (a natural
        // hedge) is just as much "the most correlated pair" as a strong
        // positive one, and is a more decision-relevant relationship than a
        // weak positive one.
        (result === null || Math.abs(correlation) > Math.abs(result.correlation))
      ) {
        result = { a: tickers[i], b: tickers[j], correlation };
      }
    }
  }

  return result;
}

const CORRELATION_SENTENCE_STRONG = 0.6;
const CORRELATION_SENTENCE_MODERATE = 0.3;

/**
 * FB-11 (§12a): the CORRELATION section's templated named-pair sentence.
 * Renders beneath (never replacing) the existing generic paragraph, using
 * the top |r| pair from `mostCorrelatedPair`. Returns null when there is no
 * pair with sufficient shared history (correlationMatrix's own MIN_OVERLAP
 * gate already encodes that as every off-diagonal cell being null, which
 * `mostCorrelatedPair` already turns into an overall null) -- the caller
 * must never fabricate a pair, so a null return means "render nothing."
 */
export function correlationPairSentence(pair: CorrelatedPair | null): string | null {
  if (pair === null) return null;
  const { a, b, correlation } = pair;
  if (correlation >= CORRELATION_SENTENCE_STRONG) {
    return `${a} AND ${b} MOVED TOGETHER ON MOST SHARED DAYS — ONE BET, TWICE.`;
  }
  if (correlation <= -CORRELATION_SENTENCE_STRONG) {
    return `${a} AND ${b} MOVED OPPOSITE ON MOST SHARED DAYS — A NATURAL HEDGE.`;
  }
  if (Math.abs(correlation) >= CORRELATION_SENTENCE_MODERATE) {
    return `${a} AND ${b} SHARE SOME MOVEMENT, NOT MUCH ELSE IS THIS CLOSE.`;
  }
  return `${a} AND ${b} ARE THE CLOSEST PAIR HERE, BUT BARELY RELATED.`;
}
