export type EarningsHour = "bmo" | "amc" | "dmh" | "";

export type EarningsEvent = {
  ticker: string;
  date: string;
  hour: EarningsHour;
  epsEstimate: number | null;
};

/**
 * Parses Finnhub's /calendar/earnings response shape for a single ticker.
 * Pure and network-free so it can be unit tested directly; the fetching
 * logic that touches the API key lives in finnhub.ts (server-only).
 */
export function parseEarningsCalendarResponse(json: unknown): EarningsEvent[] {
  if (typeof json !== "object" || json === null) return [];
  const data = json as Record<string, unknown>;
  const calendar = data.earningsCalendar;
  if (!Array.isArray(calendar)) return [];

  const events: EarningsEvent[] = [];
  for (const entry of calendar) {
    if (typeof entry !== "object" || entry === null) continue;
    const row = entry as Record<string, unknown>;
    if (typeof row.symbol !== "string" || typeof row.date !== "string") continue;
    const hour: EarningsHour =
      row.hour === "bmo" || row.hour === "amc" || row.hour === "dmh" ? row.hour : "";
    events.push({
      ticker: row.symbol,
      date: row.date,
      hour,
      epsEstimate: typeof row.epsEstimate === "number" ? row.epsEstimate : null,
    });
  }
  return events;
}
