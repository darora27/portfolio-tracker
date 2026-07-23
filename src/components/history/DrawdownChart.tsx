"use client";

import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate, formatPercent, formatSignedPercent } from "@/lib/format";
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
      <div className="mt-1 font-mono text-text-primary">{formatSignedPercent(payload[0].value, 2)}</div>
    </div>
  );
}

/** Underwater/drawdown chart: decline from the running peak of the net-of-flow growth index. */
export function DrawdownChart({ data }: { data: { date: string; drawdown: number }[] }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Drawdown</h2>
      <div className="mt-3 h-56 rounded-xl border border-border p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--loss)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--loss)" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              width={48}
              domain={["auto", 0]}
              tickFormatter={(v: number) => formatPercent(v, 0)}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="drawdown"
              stroke="var(--loss)"
              strokeWidth={2}
              fill="url(#drawdownGradient)"
              dot={false}
              isAnimationActive={!prefersReducedMotion}
            />
            <ReferenceLine y={0} stroke="var(--text-muted)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
