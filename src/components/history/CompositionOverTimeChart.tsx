"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CompositionHistorySeries } from "@/lib/portfolio/composition-history";
import { formatDate, formatPercent } from "@/lib/format";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";

// Same fixed hue order as HoldingsPerformanceChart — never reorder or cycle.
const SERIES_COLORS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
  "var(--series-7)",
  "var(--series-8)",
];
const OTHER_COLOR = "var(--series-other)";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border-strong bg-surface px-3 py-2 text-xs shadow-lg">
      <div className="font-medium text-text-secondary">
        {typeof label === "string" ? formatDate(label) : label}
      </div>
      <div className="mt-1 space-y-0.5">
        {[...payload]
          .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
          .filter((entry) => (entry.value ?? 0) > 0)
          .map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <span style={{ color: entry.color }}>{entry.name}</span>
              <span className="font-mono text-text-primary">
                {typeof entry.value === "number" ? formatPercent(entry.value / 100, 1) : entry.value}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

/** How portfolio composition (weight %) has shifted since inception — a 100%-stacked area, oldest first. */
export function CompositionOverTimeChart({ data }: { data: CompositionHistorySeries }) {
  const allKeys = [...data.tickers, ...(data.hasOther ? ["Other"] : [])];
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const prefersReducedMotion = usePrefersReducedMotion();

  if (allKeys.length === 0 || data.points.length === 0) return null;

  function toggle(key: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function colorFor(key: string): string {
    if (key === "Other") return OTHER_COLOR;
    return SERIES_COLORS[data.tickers.indexOf(key) % SERIES_COLORS.length];
  }

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
        Composition over time
      </h2>
      <p className="mt-1 text-xs text-text-muted">
        Portfolio weight by holding, since inception.
        {data.hasOther && " Smaller holdings are combined into “Other”."}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {allKeys.map((key) => {
          const isHidden = hidden.has(key);
          const color = colorFor(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors hover:border-border-strong ${
                isHidden ? "border-border text-text-muted" : "border-border-strong text-text-primary"
              }`}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: isHidden ? "var(--text-muted)" : color }} />
              {key}
            </button>
          );
        })}
      </div>

      <div className="mt-3 h-72 rounded-xl border border-border p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.points} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(d: string) => formatDate(d)}
              tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              minTickGap={40}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              width={44}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v: number) => formatPercent(v / 100, 0)}
            />
            <Tooltip content={<ChartTooltip />} />
            {allKeys.map((key) =>
              hidden.has(key) ? null : (
                <Area
                  key={key}
                  type="linear"
                  dataKey={key}
                  stackId="composition"
                  stroke="var(--surface)"
                  strokeWidth={2}
                  fill={colorFor(key)}
                  fillOpacity={0.85}
                  name={key}
                  isAnimationActive={!prefersReducedMotion}
                />
              ),
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
