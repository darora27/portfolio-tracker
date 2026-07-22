import { DeltaChip } from "@/components/ui/DeltaChip";
import type { BenchmarkComparison } from "@/lib/portfolio/benchmark-comparison";

export function ExcessReturns({ comparisons }: { comparisons: BenchmarkComparison[] }) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
        Excess return (TWR vs benchmark)
      </h2>
      <div className="mt-3 flex flex-wrap gap-3">
        {comparisons.map((c) => (
          <div key={c.ticker} className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">vs {c.ticker}</span>
            {c.excessReturnPct !== null ? (
              <DeltaChip value={c.excessReturnPct} percent />
            ) : (
              <span className="text-xs text-text-muted">—</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
