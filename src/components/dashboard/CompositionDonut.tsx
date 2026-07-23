"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency, formatPercent } from "@/lib/format";

// 13 hues rotated from the brand accent (#7C6FFF), tuned for the dark
// surface (contrast + chroma floor pass; full pairwise CVD separation is
// not achievable at 13 categorical slots — see PHASE7_PROGRESS.md §7).
// Identity is carried by the legend/tooltip text, never by hue alone.
const DONUT_COLORS = [
  "#5e4bdd",
  "#a24bdd",
  "#dd4bd5",
  "#dd4b91",
  "#dd4b4e",
  "#dd8b4b",
  "#ddcf4b",
  "#a8dd4b",
  "#64dd4b",
  "#4bdd75",
  "#4bddb8",
  "#4bbedd",
  "#4b7bdd",
];

export type DonutSlice = { ticker: string; weight: number; value: number };

function DonutTooltip({
  active,
  payload,
  hideDollars,
}: {
  active?: boolean;
  payload?: { payload: DonutSlice }[];
  hideDollars: boolean;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const slice = payload[0].payload;
  return (
    <div className="rounded-lg border border-border-strong bg-surface px-3 py-2 text-xs shadow-lg">
      <div className="font-medium text-text-primary">{slice.ticker}</div>
      <div className="mt-0.5 font-mono text-text-secondary">
        {hideDollars ? formatPercent(slice.weight, 1) : `${formatCurrency(slice.value)} (${formatPercent(slice.weight, 1)})`}
      </div>
    </div>
  );
}

export function CompositionDonut({
  slices,
  hideDollars = false,
  compact = false,
}: {
  slices: DonutSlice[];
  hideDollars?: boolean;
  /** Small footprint for tight spaces (e.g. a FlipCard back face): smaller donut, top-5 legend only, no section heading. Same data/colors, nothing hidden — just condensed. */
  compact?: boolean;
}) {
  const sorted = [...slices].sort((a, b) => b.weight - a.weight);
  const legendSlices = compact ? sorted.slice(0, 5) : sorted;

  return (
    <section>
      {!compact && (
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
          Composition
        </h2>
      )}
      <div className={`flex flex-col gap-4 ${compact ? "items-center" : "mt-3 sm:flex-row sm:items-center"}`}>
        <div className={`relative w-full shrink-0 ${compact ? "h-24 w-24" : "h-64 sm:w-64"}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sorted}
                dataKey="weight"
                nameKey="ticker"
                innerRadius="60%"
                outerRadius="90%"
                startAngle={90}
                endAngle={-270}
                isAnimationActive={false}
              >
                {sorted.map((slice, i) => (
                  <Cell key={slice.ticker} fill={DONUT_COLORS[i % DONUT_COLORS.length]} stroke="var(--surface)" />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip hideDollars={hideDollars} />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-mono font-bold text-text-primary ${compact ? "text-sm" : "text-lg"}`}>
              {sorted.length}
            </span>
            {!compact && <span className="text-xs text-text-secondary">positions</span>}
          </div>
        </div>

        {compact ? (
          <div className="w-full max-w-[180px] space-y-1">
            {legendSlices.map((slice, i) => (
              <div key={slice.ticker} className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                <span className="text-text-primary">{slice.ticker}</span>
                <span className="ml-auto shrink-0 font-mono text-text-secondary">{formatPercent(slice.weight, 1)}</span>
              </div>
            ))}
            {sorted.length > legendSlices.length && (
              <p className="text-xs text-text-muted">+{sorted.length - legendSlices.length} more</p>
            )}
          </div>
        ) : (
          <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-1">
            {sorted.map((slice, i) => (
              <div key={slice.ticker} className="flex items-center gap-2 text-sm">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
                />
                <span className="text-text-primary">{slice.ticker}</span>
                <span className="ml-auto font-mono text-xs text-text-secondary">
                  {formatPercent(slice.weight, 1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
