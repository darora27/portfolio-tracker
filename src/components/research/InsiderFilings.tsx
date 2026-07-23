import { formatDate, formatNumber } from "@/lib/format";
import type { InsiderTransaction } from "@/lib/finnhub-insider";

/**
 * Per-ticker insider (SEC Form 4) filings, collapsed behind a native
 * <details> — the disclosure triangle is a visible, keyboard- and
 * screen-reader-accessible affordance with no JS required.
 */
export function InsiderFilings({
  ticker,
  transactions,
}: {
  ticker: string;
  transactions: InsiderTransaction[];
}) {
  return (
    <details className="rounded-xl border border-border bg-surface open:pb-2">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-text-primary marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="font-mono">{ticker}</span>{" "}
        <span className="text-text-secondary">
          — {transactions.length} filing{transactions.length === 1 ? "" : "s"} (90d)
        </span>
      </summary>
      {transactions.length === 0 ? (
        <p className="px-4 pb-3 text-sm text-text-muted">No SEC Form 4 filings in the last 90 days.</p>
      ) : (
        <ul className="space-y-1.5 px-4 pb-1">
          {transactions.map((t, i) => (
            <li key={i} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-text-primary">{t.filerName}</span>
              <span className={`font-mono text-xs ${t.direction === "buy" ? "text-gain" : "text-loss"}`}>
                {t.direction === "buy" ? "Bought" : "Sold"} {formatNumber(t.shares, 0)} sh
              </span>
              <span className="font-mono text-xs text-text-muted">{formatDate(t.date)}</span>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
}
