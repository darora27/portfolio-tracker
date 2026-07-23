import { formatCurrency, formatPercent } from "@/lib/format";

function Chip({ label }: { label: string }) {
  return (
    <span className="rounded-lg border border-border bg-surface-hover px-2.5 py-1 text-xs font-medium text-text-secondary">
      {label}
    </span>
  );
}

export function StockHeader({
  ticker,
  sector,
  aiExposure,
  value,
  shares,
  weight,
}: {
  ticker: string;
  sector: string | null;
  aiExposure: string | null;
  value: number;
  shares: number;
  weight: number;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-mono text-3xl font-bold text-text-primary">{ticker}</h1>
        <Chip label={sector ?? "Unclassified"} />
        {aiExposure && <Chip label={`AI exposure: ${aiExposure}`} />}
      </div>
      <div className="text-right">
        <div className="font-mono text-2xl font-bold text-text-primary">{formatCurrency(value)}</div>
        <div className="mt-0.5 text-xs text-text-secondary">
          {shares} shares &middot; {formatPercent(weight, 1)} of portfolio
        </div>
      </div>
    </div>
  );
}
