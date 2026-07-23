"use client";

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency, formatDate } from "@/lib/format";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0 || typeof payload[0].value !== "number") return null;
  return (
    <div className="rounded-lg border border-border-strong bg-surface px-3 py-2 text-xs shadow-lg">
      <div className="font-medium text-text-secondary">{typeof label === "string" ? formatDate(label) : label}</div>
      <div className="mt-1 font-mono text-text-primary">{formatCurrency(payload[0].value)}</div>
    </div>
  );
}

/**
 * Daily-close price line since purchase, with a dashed reference line at
 * cost per share. A single data point (a position bought today, before
 * any real history exists) still renders — a dot plus the reference line
 * — rather than an empty or crashing chart.
 */
export function StockPriceChart({
  data,
  costPerShare,
}: {
  data: { date: string; price: number }[];
  costPerShare: number;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (data.length === 0) {
    return (
      <div className="mt-3 flex h-64 items-center justify-center rounded-xl border border-border text-sm text-text-muted">
        No price history yet.
      </div>
    );
  }

  return (
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
            width={56}
            tickCount={5}
            tickFormatter={(v: number) => formatCurrency(v, true)}
          />
          <Tooltip content={<ChartTooltip />} />
          <ReferenceLine
            y={costPerShare}
            stroke="var(--text-muted)"
            strokeDasharray="4 4"
            label={{
              value: "Cost basis",
              position: "insideTopLeft",
              fill: "var(--text-muted)",
              fontSize: 11,
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="var(--chart-portfolio)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--chart-portfolio)", strokeWidth: 0 }}
            isAnimationActive={!prefersReducedMotion}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
