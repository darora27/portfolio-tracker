import type { CompanyMetric } from "@/lib/finnhub-metric";
import { Card } from "@/components/ui/Card";
import { formatCurrency, formatMarketCap, formatNumber, formatPercent } from "@/lib/format";

function WeekRange({ low, high, price }: { low: number; high: number; price: number | null }) {
  const pct = price !== null && high > low ? Math.min(1, Math.max(0, (price - low) / (high - low))) : null;
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary">52-week range</div>
      <div className="relative mt-3 h-1 rounded-full bg-border">
        {pct !== null && (
          <div
            className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-accent"
            style={{ left: `calc(${pct * 100}% - 5px)` }}
          />
        )}
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-xs text-text-muted">
        <span>{formatCurrency(low)}</span>
        <span>{formatCurrency(high)}</span>
      </div>
    </div>
  );
}

export function FundamentalsRow({
  metric,
  price,
  positionValue,
}: {
  metric: CompanyMetric | null;
  price: number | null;
  positionValue: number;
}) {
  if (!metric) return null;

  const estimatedAnnualIncome =
    metric.dividendYieldPct !== null ? (metric.dividendYieldPct / 100) * positionValue : null;

  return (
    <Card>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        {metric.week52Low !== null && metric.week52High !== null ? (
          <WeekRange low={metric.week52Low} high={metric.week52High} price={price} />
        ) : (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              52-week range
            </div>
            <div className="mt-3 text-sm text-text-muted">—</div>
          </div>
        )}

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary">P/E (TTM)</div>
          <div className="mt-1 font-mono text-lg text-text-primary">
            {metric.peTTM !== null ? formatNumber(metric.peTTM, 1) : "—"}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Market cap</div>
          <div className="mt-1 font-mono text-lg text-text-primary">
            {metric.marketCapMillions !== null ? formatMarketCap(metric.marketCapMillions) : "—"}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Dividend yield
          </div>
          <div className="mt-1 font-mono text-lg text-text-primary">
            {metric.dividendYieldPct !== null ? formatPercent(metric.dividendYieldPct / 100, 2) : "—"}
          </div>
          {estimatedAnnualIncome !== null && (
            <div className="mt-0.5 text-xs text-text-secondary">
              Estimated annual income: {formatCurrency(estimatedAnnualIncome)}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
