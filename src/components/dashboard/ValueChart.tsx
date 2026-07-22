"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate } from "@/lib/format";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";

export type ChartPoint = {
  date: string;
  portfolioIndex: number;
  vooIndex?: number;
  vtiIndex?: number;
  xlkIndex?: number;
};

type SeriesKey = "portfolioIndex" | "vooIndex" | "vtiIndex" | "xlkIndex";

const SERIES: {
  key: SeriesKey;
  name: string;
  color: string;
  strokeWidth: number;
  dashArray?: string;
}[] = [
  { key: "portfolioIndex", name: "Portfolio", color: "var(--chart-portfolio)", strokeWidth: 2 },
  { key: "vooIndex", name: "VOO", color: "var(--chart-voo)", strokeWidth: 1.5, dashArray: "6 3" },
  { key: "vtiIndex", name: "VTI", color: "var(--chart-vti)", strokeWidth: 1.5, dashArray: "2 3" },
  { key: "xlkIndex", name: "XLK", color: "var(--chart-xlk)", strokeWidth: 1.5, dashArray: "8 3 2 3" },
];

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
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className="font-mono text-text-primary">
              {typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ValueChart({ data }: { data: ChartPoint[] }) {
  const availableSeries = SERIES.filter(
    (s) => s.key === "portfolioIndex" || data.some((d) => d[s.key] !== undefined),
  );
  const [hidden, setHidden] = useState<Set<SeriesKey>>(new Set());
  const hasBenchmarks = availableSeries.length > 1;
  const prefersReducedMotion = usePrefersReducedMotion();

  function toggle(key: SeriesKey) {
    if (key === "portfolioIndex") return; // portfolio series always visible
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
        Value over time
      </h2>
      <p className="mt-1 text-xs text-text-muted">
        {hasBenchmarks
          ? "All series indexed to 100 at the same start date, net of cash flows — a fair same-period comparison."
          : "Indexed to 100 at the first snapshot, net of cash flows. Benchmark comparison needs a full-history match — it'll appear once that's available."}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {availableSeries.map((s) => {
          const isHidden = hidden.has(s.key);
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggle(s.key)}
              disabled={s.key === "portfolioIndex"}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                isHidden
                  ? "border-border text-text-muted"
                  : "border-border-strong text-text-primary"
              } ${s.key === "portfolioIndex" ? "cursor-default" : "cursor-pointer hover:border-border-strong"}`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: isHidden ? "var(--text-muted)" : s.color }}
              />
              {s.name}
            </button>
          );
        })}
      </div>

      <div className="mt-3 h-64 rounded-xl border border-border p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
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
              domain={["auto", "auto"]}
              width={48}
              tickCount={5}
              tickFormatter={(v: number) => v.toFixed(0)}
            />
            <Tooltip content={<ChartTooltip />} />
            {availableSeries.map((s) =>
              hidden.has(s.key) ? null : (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={s.strokeWidth}
                  strokeDasharray={s.dashArray}
                  dot={false}
                  name={s.name}
                  connectNulls
                  isAnimationActive={!prefersReducedMotion}
                />
              ),
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
