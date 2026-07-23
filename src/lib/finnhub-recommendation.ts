export type RecommendationTrend = {
  period: string;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
};

/**
 * Parses Finnhub's /stock/recommendation response — an array of monthly
 * analyst-consensus snapshots. Sorted newest-period-first so callers can
 * take index 0 as "latest month" directly.
 *
 * Pure and network-free so it can be unit tested directly; the fetching
 * logic that touches the API key lives in finnhub.ts (server-only).
 */
export function parseRecommendationResponse(json: unknown): RecommendationTrend[] {
  if (!Array.isArray(json)) return [];

  const num = (value: unknown): number => (typeof value === "number" ? value : 0);
  const trends: RecommendationTrend[] = [];
  for (const entry of json) {
    if (typeof entry !== "object" || entry === null) continue;
    const row = entry as Record<string, unknown>;
    if (typeof row.period !== "string") continue;
    trends.push({
      period: row.period,
      strongBuy: num(row.strongBuy),
      buy: num(row.buy),
      hold: num(row.hold),
      sell: num(row.sell),
      strongSell: num(row.strongSell),
    });
  }
  return trends.sort((a, b) => (a.period < b.period ? 1 : a.period > b.period ? -1 : 0));
}
