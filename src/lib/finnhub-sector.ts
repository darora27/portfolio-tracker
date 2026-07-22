/**
 * Extracts the sector/industry from Finnhub's /stock/profile2 response.
 * Returns null for anything unusable (missing key, wrong type, empty
 * string) — the caller falls back to "Unclassified" rather than crashing.
 *
 * Pure and network-free so it can be unit tested directly; the fetching
 * logic that touches the API key lives in finnhub.ts (server-only).
 */
export function parseProfileResponse(json: unknown): { sector: string } | null {
  if (typeof json !== "object" || json === null) return null;
  const data = json as Record<string, unknown>;
  const sector = data.finnhubIndustry;
  if (typeof sector !== "string" || sector.trim() === "") return null;
  return { sector };
}
