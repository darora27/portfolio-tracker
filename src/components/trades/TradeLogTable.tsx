import type { Database } from "@/lib/supabase/types";
import { formatCurrency, formatDate, formatSignedCurrency } from "@/lib/format";

type TradeRow = Database["public"]["Tables"]["trades"]["Row"];

export function TradeLogTable({ trades }: { trades: TradeRow[] }) {
  return (
    <section>
      <h2 className="text-lg font-medium">History ({trades.length})</h2>
      <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
              <th className="px-3 py-2 font-medium">Date</th>
              <th className="px-3 py-2 font-medium">Ticker</th>
              <th className="px-3 py-2 font-medium">Action</th>
              <th className="px-3 py-2 font-medium">Shares</th>
              <th className="px-3 py-2 font-medium">Price</th>
              <th className="px-3 py-2 font-medium">Total</th>
              <th className="px-3 py-2 font-medium">Realized G/L</th>
              <th className="px-3 py-2 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr
                key={t.id}
                className="border-b border-zinc-100 last:border-0 dark:border-zinc-900"
              >
                <td className="px-3 py-2">{formatDate(t.date)}</td>
                <td className="px-3 py-2 font-medium">{t.ticker}</td>
                <td className="px-3 py-2 capitalize">{t.action}</td>
                <td className="px-3 py-2 tabular-nums">{t.shares}</td>
                <td className="px-3 py-2 tabular-nums">{formatCurrency(t.price)}</td>
                <td className="px-3 py-2 tabular-nums">{formatCurrency(t.total)}</td>
                <td className="px-3 py-2 tabular-nums">
                  {t.realized_gain !== null ? (
                    <span className={t.realized_gain >= 0 ? "text-emerald-600" : "text-red-600"}>
                      {formatSignedCurrency(t.realized_gain)}
                    </span>
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </td>
                <td className="px-3 py-2 text-zinc-500">{t.reason ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
