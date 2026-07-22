import type { Position } from "@/lib/portfolio/holdings";
import { formatCurrency, formatSignedCurrency, formatSignedPercent } from "@/lib/format";

export type PositionRow = Position & { contribution: number | null };

export function PositionsTable({ positions }: { positions: PositionRow[] }) {
  return (
    <section>
      <h2 className="text-lg font-medium">Positions</h2>
      <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
              <th className="px-3 py-2 font-medium">Ticker</th>
              <th className="px-3 py-2 font-medium">Shares</th>
              <th className="px-3 py-2 font-medium">Price</th>
              <th className="px-3 py-2 font-medium">Value</th>
              <th className="px-3 py-2 font-medium">Weight</th>
              <th className="px-3 py-2 font-medium">Cost basis</th>
              <th className="px-3 py-2 font-medium">Gain / loss</th>
              <th className="px-3 py-2 font-medium">Contribution</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p) => (
              <tr
                key={p.ticker}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
              >
                <td className="px-3 py-2 font-medium">{p.ticker}</td>
                <td className="px-3 py-2 tabular-nums">{p.shares}</td>
                <td className="px-3 py-2 tabular-nums">
                  {p.price !== null ? (
                    formatCurrency(p.price)
                  ) : (
                    <span className="text-zinc-400" title="No price data yet — valued at cost">
                      at cost
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 tabular-nums">{formatCurrency(p.value)}</td>
                <td className="px-3 py-2 tabular-nums">{formatSignedPercent(p.weight, 1)}</td>
                <td className="px-3 py-2 tabular-nums">{formatCurrency(p.costBasis)}</td>
                <td className="px-3 py-2 tabular-nums">
                  {p.gain !== null && p.gainPct !== null ? (
                    <span className={p.gain >= 0 ? "text-emerald-600" : "text-red-600"}>
                      {formatSignedCurrency(p.gain)} ({formatSignedPercent(p.gainPct, 1)})
                    </span>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </td>
                <td className="px-3 py-2 tabular-nums">
                  {p.contribution !== null ? (
                    formatSignedPercent(p.contribution, 1)
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {positions.some((p) => p.price === null) && (
        <p className="mt-2 text-xs text-zinc-500">
          Positions marked &ldquo;at cost&rdquo; have no closing price yet (
          {positions
            .filter((p) => p.price === null)
            .map((p) => p.ticker)
            .join(", ")}
          ) — live prices arrive once the Finnhub snapshot job is wired up.
        </p>
      )}
    </section>
  );
}
