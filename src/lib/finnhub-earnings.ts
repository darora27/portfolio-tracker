export type EarningsHour = "bmo" | "amc" | "dmh" | "";

export type EarningsEvent = {
  ticker: string;
  date: string;
  hour: EarningsHour;
  epsEstimate: number | null;
  /**
   * Finnhub's own resolved symbol for this event, when it differs from
   * `ticker` (e.g. querying GOOG returns events under "GOOGL", ASML under
   * "ASML.AS"). Only set when a `queriedTicker` was passed in and differs
   * from the response's symbol — undefined otherwise, so callers can show
   * it as a muted sublabel without a redundant "GOOGL (GOOGL)".
   */
  resolvedSymbol?: string;
};

/**
 * Parses Finnhub's /calendar/earnings response shape for a single ticker.
 * Pure and network-free so it can be unit tested directly; the fetching
 * logic that touches the API key lives in finnhub.ts (server-only).
 *
 * `queriedTicker` is the HELD ticker the request was made with. When
 * provided, `ticker` on each event is that held ticker (not whatever
 * symbol Finnhub resolved it to internally) so the UI always shows what
 * the user actually owns.
 */
export function parseEarningsCalendarResponse(
  json: unknown,
  queriedTicker?: string,
): EarningsEvent[] {
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
      ticker: queriedTicker ?? row.symbol,
      date: row.date,
      hour,
      epsEstimate: typeof row.epsEstimate === "number" ? row.epsEstimate : null,
      resolvedSymbol: queriedTicker && queriedTicker !== row.symbol ? row.symbol : undefined,
    });
  }
  return events;
}
