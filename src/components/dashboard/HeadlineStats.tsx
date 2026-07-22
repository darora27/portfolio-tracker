import { formatCurrency, formatDate, formatSignedCurrency, formatSignedPercent } from "@/lib/format";

function StatCard({
  label,
  value,
  sub,
  muted = false,
}: {
  label: string;
  value: string;
  sub?: string;
  muted?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 ${
        muted ? "opacity-60" : ""
      }`}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-zinc-500">{sub}</div>}
    </div>
  );
}

export function HeadlineStats({
  totalValue,
  totalCost,
  simpleReturnPct,
  dailyChange,
  dailyChangePct,
  dailyChangeAsOf,
  twrPct,
  xirrPct,
  historyDays,
  pricesAsOf,
}: {
  totalValue: number;
  totalCost: number;
  simpleReturnPct: number;
  dailyChange: number;
  dailyChangePct: number;
  dailyChangeAsOf: string;
  twrPct: number;
  xirrPct: number;
  historyDays: number;
  pricesAsOf: string | null;
}) {
  const gain = totalValue - totalCost;
  const deemphasizeXirr = historyDays < 90;

  return (
    <section>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Total value"
          value={formatCurrency(totalValue)}
          sub={pricesAsOf ? `Prices as of ${formatDate(pricesAsOf)}` : "Prices unavailable"}
        />
        <StatCard label="Invested" value={formatCurrency(totalCost)} />
        <StatCard
          label="Gain / loss"
          value={formatSignedCurrency(gain)}
          sub={`Simple return: ${formatSignedPercent(simpleReturnPct)}`}
        />
        <StatCard
          label="Daily change"
          value={formatSignedCurrency(dailyChange)}
          sub={`${formatSignedPercent(dailyChangePct)} — as of ${formatDate(dailyChangeAsOf)}`}
        />
        <StatCard label="TWR (time-weighted)" value={formatSignedPercent(twrPct)} />
        <StatCard
          label="XIRR (annualized)"
          value={formatSignedPercent(xirrPct)}
          sub={deemphasizeXirr ? `Only ${historyDays}d of history — noisy` : undefined}
          muted={deemphasizeXirr}
        />
      </div>
    </section>
  );
}
