export type NewsItem = {
  headline: string;
  source: string;
  url: string;
  /** Unix seconds, from Finnhub's `datetime` field. */
  datetime: number;
  /** Attached by the caller (getCompanyNews) when tagging a multi-ticker feed — not from Finnhub itself. */
  ticker?: string;
};

/**
 * Parses Finnhub's /company-news response — an array of articles, newest
 * first by `datetime`, capped at `maxItems`.
 *
 * Pure and network-free so it can be unit tested directly; the fetching
 * logic that touches the API key lives in finnhub.ts (server-only).
 */
export function parseNewsResponse(json: unknown, maxItems = 5): NewsItem[] {
  if (!Array.isArray(json)) return [];

  const items: NewsItem[] = [];
  for (const entry of json) {
    if (typeof entry !== "object" || entry === null) continue;
    const row = entry as Record<string, unknown>;
    if (typeof row.headline !== "string" || typeof row.url !== "string" || typeof row.datetime !== "number") {
      continue;
    }
    items.push({
      headline: row.headline,
      source: typeof row.source === "string" ? row.source : "",
      url: row.url,
      datetime: row.datetime,
    });
  }
  return items.sort((a, b) => b.datetime - a.datetime).slice(0, maxItems);
}
