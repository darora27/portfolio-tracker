export type CompanyMetric = {
  peTTM: number | null;
  marketCapMillions: number | null;
  dividendYieldPct: number | null;
  week52Low: number | null;
  week52High: number | null;
};

/**
 * Extracts the fields Phase 8's fundamentals row needs from Finnhub's
 * /stock/metric?metric=all response. Any individual field that's missing
 * or the wrong type comes back null — the UI renders "—" per field, this
 * only returns null outright when the whole `metric` object is unusable.
 *
 * Pure and network-free so it can be unit tested directly; the fetching
 * logic that touches the API key lives in finnhub.ts (server-only).
 */
export function parseMetricResponse(json: unknown): CompanyMetric | null {
  if (typeof json !== "object" || json === null) return null;
  const data = json as Record<string, unknown>;
  const metric = data.metric;
  if (typeof metric !== "object" || metric === null) return null;
  const m = metric as Record<string, unknown>;

  const num = (value: unknown): number | null =>
    typeof value === "number" && Number.isFinite(value) ? value : null;

  return {
    peTTM: num(m.peTTM),
    marketCapMillions: num(m.marketCapitalization),
    dividendYieldPct: num(m.currentDividendYieldTTM),
    week52Low: num(m["52WeekLow"]),
    week52High: num(m["52WeekHigh"]),
  };
}
