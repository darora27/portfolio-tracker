import { formatPercent, formatSignedPercent } from "@/lib/format";

function Metric({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-zinc-500">{sub}</div>}
    </div>
  );
}

export function RiskPanel({
  volatilityPct,
  maxDrawdownPct,
  sharpe,
  betaVsVoo,
  top2ConcentrationPct,
  hhi,
}: {
  volatilityPct: number;
  maxDrawdownPct: number;
  sharpe: number;
  betaVsVoo: number | null;
  top2ConcentrationPct: number;
  hhi: number;
}) {
  return (
    <section>
      <h2 className="text-lg font-medium">Risk</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Metric label="Volatility (ann.)" value={formatPercent(volatilityPct, 1)} />
        <Metric label="Max drawdown" value={formatSignedPercent(maxDrawdownPct, 1)} />
        <Metric label="Sharpe" value={sharpe.toFixed(2)} />
        <Metric
          label="Beta vs VOO"
          value={betaVsVoo !== null ? betaVsVoo.toFixed(2) : "—"}
          sub={betaVsVoo === null ? "Needs a full-history VOO benchmark match" : undefined}
        />
        <Metric label="Top-2 concentration" value={formatPercent(top2ConcentrationPct, 1)} />
        <Metric label="HHI" value={hhi.toFixed(0)} sub="0-10000; higher = more concentrated" />
      </div>
    </section>
  );
}
