import { formatSignedPercent } from "@/lib/format";
import { PULSE_MATERIALITY_THRESHOLD } from "@/lib/surface-copy";

export type ContributionRow = {
  ticker: string;
  contribution: number;
};

export const FORCES_MATERIALITY_THRESHOLD = PULSE_MATERIALITY_THRESHOLD;

export function rankContributions(
  positions: { ticker: string; contribution: number | null }[],
): ContributionRow[] {
  return positions
    .filter(
      (position): position is ContributionRow =>
        position.contribution !== null,
    )
    .sort((a, b) => b.contribution - a.contribution);
}

export function foldContributionsForDisplay(
  ranked: ContributionRow[],
  maxNamed = 8,
): { named: ContributionRow[]; otherSum: number | null } {
  if (ranked.length <= maxNamed) {
    return { named: ranked, otherSum: null };
  }

  const edgeCount = Math.floor(maxNamed / 2);
  const top = ranked.slice(0, edgeCount);
  const bottom = ranked.slice(ranked.length - edgeCount);
  const otherSum = ranked
    .slice(edgeCount, ranked.length - edgeCount)
    .reduce((sum, row) => sum + row.contribution, 0);

  return { named: [...top, ...bottom], otherSum };
}

export function forcesMarginaliaCopy(
  ranked: ContributionRow[],
): string | null {
  if (ranked.length === 0) return null;

  const top = ranked[0];
  const bottom = ranked[ranked.length - 1];
  const topCrosses =
    top.contribution >= FORCES_MATERIALITY_THRESHOLD;
  const bottomCrosses =
    bottom.contribution <= -FORCES_MATERIALITY_THRESHOLD;

  if (!topCrosses && !bottomCrosses) {
    return "Contribution was spread across the portfolio; no single holding stood out.";
  }
  if (topCrosses && bottomCrosses) {
    return `${top.ticker} contributed the most to total return, at ${formatSignedPercent(top.contribution, 1)}; ${bottom.ticker} weighed on it the most, at ${formatSignedPercent(bottom.contribution, 1)}.`;
  }
  if (topCrosses) {
    return `${top.ticker} contributed the most to total return, at ${formatSignedPercent(top.contribution, 1)}.`;
  }
  return `${bottom.ticker} weighed on the result the most, at ${formatSignedPercent(bottom.contribution, 1)}.`;
}
