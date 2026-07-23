"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { HoldingsPerformanceSeries } from "@/lib/portfolio/holdings-performance";
import { formatDate, formatPercent, formatSignedPercent } from "@/lib/format";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";

// Fixed hue order (validated against this app's --surface for the dark-mode
// CVD/contrast checks) — never reorder or cycle. A 9th holding folds into
// --series-other rather than taking a new hue.
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
          .map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-4">
              <span style={{ color: entry.color }}>{entry.name}</span>
              <span className="font-mono text-text-primary">
                {typeof entry.value === "number" ? formatSignedPercent(entry.value / 100, 1) : entry.value}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

/**
 * One line per holding since ITS OWN purchase date (not a shared start —
 * holdings were bought on different days), all plotted on the same
 * calendar-date x-axis so shapes are visually comparable. Beyond 8
 * holdings, the smallest by weight fold into a single muted "Other" line
 * rather than adding a 9th hue (see the dataviz palette this chart
 * validates against).
 */
export function HoldingsPerformanceChart({ data }: { data: HoldingsPerformanceSeries }) {
  const allKeys = [...data.tickers, ...(data.hasOther ? ["Other"] : [])];
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const prefersReducedMotion = usePrefersReducedMotion();

  if (allKeys.length === 0) {
    return null;
  }

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
        Holdings performance
      </h2>
      <p className="mt-1 text-xs text-text-muted">
        Each line is % return since that holding&rsquo;s own purchase date — not a shared start, since
        holdings were bought on different days.
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
          <LineChart data={data.points} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
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
              width={52}
              tickFormatter={(v: number) => formatPercent(v / 100, 0)}
            />
            <Tooltip content={<ChartTooltip />} />
            {allKeys.map((key) =>
              hidden.has(key) ? null : (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colorFor(key)}
                  strokeWidth={key === "Other" ? 1.5 : 2}
                  strokeDasharray={key === "Other" ? "4 3" : undefined}
                  dot={false}
                  name={key}
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
