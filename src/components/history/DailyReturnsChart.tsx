"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate, formatSignedPercent } from "@/lib/format";
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

/** One bar per snapshot day, net-of-flow daily return — deposits/withdrawals never paint a fake green or red bar. */
export function DailyReturnsChart({ data }: { data: { date: string; return: number }[] }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Daily returns</h2>
      <div className="mt-3 h-56 rounded-xl border border-border p-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
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
              tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--surface-hover)" }} />
            <Bar dataKey="return" isAnimationActive={!prefersReducedMotion}>
              {data.map((d) => (
                <Cell key={d.date} fill={d.return >= 0 ? "var(--gain)" : "var(--loss)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
