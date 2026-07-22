export type Quote = {
  price: number;
  /** Unix seconds, from Finnhub's `t` field. */
  timestamp: number;
};

/**
 * Extracts a usable quote from Finnhub's /quote response shape. Returns
 * null for anything unusable — including a price of exactly 0, which
 * Finnhub returns for an unrecognized symbol rather than an error status.
 *
 * Pure and network-free so it can be unit tested directly; the fetching
 * logic that touches the API key lives in finnhub.ts (server-only).
 */
export function parseQuoteResponse(json: unknown): Quote | null {
  if (typeof json !== "object" || json === null) return null;
  const data = json as Record<string, unknown>;
  const price = data.c;
  const timestamp = data.t;
  if (typeof price !== "number" || price <= 0 || typeof timestamp !== "number") return null;
  return { price, timestamp };
}
