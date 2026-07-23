import { formatNumber } from "@/lib/format";

// Matches CorrelationHeatmap.tsx's color scale — same visual language,
// kept local since a single row doesn't need the shared heatmap's hover state.
function cellBackground(value: number): string {
  if (value >= 0) {
    return `color-mix(in srgb, var(--accent) ${Math.round(Math.min(value, 1) * 55)}%, var(--surface))`;
  }
  return `color-mix(in srgb, var(--loss) ${Math.round(Math.min(-value, 1) * 55)}%, var(--surface))`;
}

export function CorrelationRow({ cells }: { cells: { ticker: string; value: number | null }[] }) {
  if (cells.length === 0) return null;

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
        Correlation vs other holdings
      </h2>
      <div className="mt-3 overflow-x-auto">
        <div className="flex gap-1">
          {cells.map((c) => (
            <div key={c.ticker} className="flex flex-col items-center gap-1">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-md font-mono text-[10px] text-text-primary"
                style={{ background: c.value !== null ? cellBackground(c.value) : "var(--surface)" }}
              >
                {c.value !== null ? formatNumber(c.value, 2) : <span className="text-text-muted">—</span>}
              </div>
              <span className="font-mono text-[10px] text-text-muted">{c.ticker}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
