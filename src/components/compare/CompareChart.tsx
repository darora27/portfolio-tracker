"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate, formatNumber } from "@/lib/format";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";

export type CompareChartPoint = {
  date: string;
  portfolio?: number;
  steadyMarket?: number;
  techTilt?: number;
  aiConcentrate?: number;
};

// Reuses Phase 7's established 4-series visual system (one solid
// portfolio line + three distinguishable dash treatments) rather than
// inventing a fifth palette — same reasoning PHASE9.md gives for "sims
// get the VTI/XLK/muted line treatments."
const SERIES = [
  { key: "portfolio" as const, name: "Real portfolio", color: "var(--chart-portfolio)", strokeWidth: 2 },
  { key: "steadyMarket" as const, name: "Steady Market", color: "var(--chart-vti)", strokeWidth: 1.5, dashArray: "2 3" },
  { key: "techTilt" as const, name: "Tech Tilt", color: "var(--chart-xlk)", strokeWidth: 1.5, dashArray: "8 3 2 3" },
  { key: "aiConcentrate" as const, name: "AI Concentrate", color: "var(--text-muted)", strokeWidth: 1.5, dashArray: "6 3" },
];

function CompareTooltip({
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
      <div className="font-medium text-text-secondary">{typeof label === "string" ? formatDate(label) : label}</div>
      <div className="mt-1 space-y-0.5">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className="font-mono text-text-primary">{typeof entry.value === "number" ? formatNumber(entry.value, 2) : entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CompareChart({ data }: { data: CompareChartPoint[] }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section>
      <div className="flex flex-wrap gap-2">
        {SERIES.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-text-primary">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>

      <div className="mt-3 h-72 rounded-xl border border-border p-2">
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
              tickFormatter={(v: number) => formatNumber(v, 0)}
            />
            <Tooltip content={<CompareTooltip />} />
            {SERIES.map((s) => (
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
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
