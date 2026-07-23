import { formatDate, formatNumber } from "@/lib/format";
import type { SimTrade } from "@/lib/math/sim-portfolio";

/** One sim's trade log, collapsed behind a native <details>. */
export function SimTradeLog({ name, trades }: { name: string; trades: SimTrade[] }) {
  return (
    <details className="rounded-xl border border-border bg-surface open:pb-2">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-text-primary marker:content-none [&::-webkit-details-marker]:hidden">
        {name} <span className="text-text-secondary">— {trades.length} trade{trades.length === 1 ? "" : "s"}</span>
      </summary>
      <ul className="space-y-1.5 px-4 pb-1">
        {trades.map((t, i) => (
          <li key={i} className="text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className={`font-mono text-xs ${t.action === "buy" ? "text-gain" : "text-loss"}`}>
                {t.action === "buy" ? "Bought" : "Sold"} {formatNumber(t.shares, 2)} sh {t.ticker}
              </span>
              <span className="font-mono text-xs text-text-muted">{formatDate(t.date)}</span>
            </div>
            <p className="mt-0.5 text-xs text-text-muted">{t.reason}</p>
          </li>
        ))}
      </ul>
    </details>
  );
}
