export type InsiderTransaction = {
  filerName: string;
  /** Shares transacted (absolute value of Finnhub's `change` field — not the resulting total holding). */
  shares: number;
  direction: "buy" | "sell";
  /** ISO date (YYYY-MM-DD) the transaction occurred. */
  date: string;
};

/**
 * Parses Finnhub's /stock/insider-transactions response (`{ data: [...] }`),
 * filtered to transactions on or after `sinceDate`, newest first.
 *
 * Direction comes from the sign of Finnhub's `change` field (shares
 * acquired vs. disposed) — this is a simplification (it doesn't
 * distinguish an open-market purchase from an option exercise or award,
 * SEC transaction codes like "P"/"S"/"A"/"F"), reasonable for a personal
 * research aggregator rather than SEC-analyst-grade classification.
 * Entries with a zero or missing `change` are skipped — there's no
 * buy/sell direction to show.
 *
 * Pure and network-free so it can be unit tested directly; the fetching
 * logic that touches the API key lives in finnhub.ts (server-only).
 */
export function parseInsiderTransactionsResponse(json: unknown, sinceDate: string): InsiderTransaction[] {
  if (typeof json !== "object" || json === null) return [];
  const data = (json as Record<string, unknown>).data;
  if (!Array.isArray(data)) return [];

  const items: InsiderTransaction[] = [];
  for (const entry of data) {
    if (typeof entry !== "object" || entry === null) continue;
    const row = entry as Record<string, unknown>;
    if (
      typeof row.name !== "string" ||
      typeof row.change !== "number" ||
      row.change === 0 ||
      typeof row.transactionDate !== "string"
    ) {
      continue;
    }
    if (row.transactionDate < sinceDate) continue;
    items.push({
      filerName: row.name,
      shares: Math.abs(row.change),
      direction: row.change > 0 ? "buy" : "sell",
      date: row.transactionDate,
    });
  }

  return items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** (#buys - #sells) — the "per-ticker net count badge" from PHASE9.md §4. */
export function netInsiderCount(transactions: InsiderTransaction[]): number {
  return transactions.reduce((net, t) => net + (t.direction === "buy" ? 1 : -1), 0);
}
