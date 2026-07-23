"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatSignedPercent } from "@/lib/format";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";

export type ContributionEntry = { ticker: string; contribution: number };

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ContributionEntry }[];
}) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0].payload;
  return (
    <div className="rounded-lg border border-border-strong bg-surface px-3 py-2 text-xs shadow-lg">
      <div className="font-medium text-text-primary">{entry.ticker}</div>
      <div className={`mt-0.5 font-mono ${entry.contribution >= 0 ? "text-gain" : "text-loss"}`}>
        {formatSignedPercent(entry.contribution, 2)} of total return
      </div>
    </div>
  );
}

/**
 * Ranks every position by its contribution to overall portfolio return —
 * a $10k position up 2% and a $500 position up 40% can have the exact
 * same gain %, but very different contributions; this is the view that
 * tells you which holdings are actually moving the portfolio.
 */
export function ContributionChart({ entries }: { entries: ContributionEntry[] }) {
  const sorted = [...entries].sort((a, b) => b.contribution - a.contribution);
  const prefersReducedMotion = usePrefersReducedMotion();

  if (sorted.length === 0) return null;

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
        Contribution to return
      </h2>
      <p className="mt-1 text-xs text-text-muted">
        Each holding&rsquo;s share of total portfolio gain/loss — size and return both matter here, not
        return alone.
      </p>
      <div className="mt-3 rounded-xl border border-border p-2" style={{ height: Math.max(200, sorted.length * 32) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} layout="vertical" margin={{ top: 8, right: 24, bottom: 0, left: 0 }}>
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => formatSignedPercent(v, 0)}
            />
            <YAxis
              type="category"
              dataKey="ticker"
              tick={{ fontSize: 11, fill: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--surface-hover)" }} />
            <Bar dataKey="contribution" isAnimationActive={!prefersReducedMotion} radius={2}>
              {sorted.map((entry) => (
                <Cell key={entry.ticker} fill={entry.contribution >= 0 ? "var(--gain)" : "var(--loss)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
