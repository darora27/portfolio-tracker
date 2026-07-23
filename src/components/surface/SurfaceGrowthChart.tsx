"use client";

import { useState } from "react";
import { Area, AreaChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatDate, formatNumber } from "@/lib/format";
import type { ChartPoint } from "@/components/dashboard/ValueChart";

function SurfaceTooltip({
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
    <div className="rounded-lg border border-line bg-paper-raised px-3 py-2 text-xs shadow-sm">
      <div className="font-medium text-ink-soft">{typeof label === "string" ? formatDate(label) : label}</div>
      <div className="mt-1 space-y-0.5">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className="font-mono text-ink">{typeof entry.value === "number" ? formatNumber(entry.value, 2) : entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Act 2 — "the shape." A single clean area chart of the TWR growth
 * index, deliberately spare compared to the deep-tier ValueChart: no
 * gridlines, one 3px accent line with a gradient fill, only the first
 * and last date labeled. A "vs the market" toggle chip adds the VOO
 * line — nothing else lives on this screen.
 */
export function SurfaceGrowthChart({ data }: { data: ChartPoint[] }) {
  const [showMarket, setShowMarket] = useState(false);
  const hasVoo = data.some((d) => d.vooIndex !== undefined);
  const firstDate = data[0]?.date;
  const lastDate = data[data.length - 1]?.date;

  return (
    <div>
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <defs>
              <linearGradient id="surfaceGrowthFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              type="category"
              ticks={firstDate && lastDate ? [firstDate, lastDate] : undefined}
              padding={{ left: 32, right: 32 }}
              tickFormatter={(d: string) => formatDate(d)}
              tick={{ fontSize: 12, fill: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}
              axisLine={{ stroke: "var(--line)" }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <Tooltip content={<SurfaceTooltip />} />
            <Area
              type="monotone"
              dataKey="portfolioIndex"
              stroke="var(--accent)"
              strokeWidth={3}
              fill="url(#surfaceGrowthFill)"
              dot={false}
              name="Portfolio"
              isAnimationActive={false}
            />
            {showMarket && hasVoo && (
              <Line
                type="monotone"
                dataKey="vooIndex"
                stroke="var(--ink-faint)"
                strokeWidth={1.5}
                strokeDasharray="6 3"
                dot={false}
                name="VOO"
                connectNulls
                isAnimationActive={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {hasVoo && (
        <button
          type="button"
          onClick={() => setShowMarket((v) => !v)}
          aria-pressed={showMarket}
          className={`mt-4 inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors ${
            showMarket ? "border-accent-ink text-accent-ink" : "border-line text-ink-soft"
          }`}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: showMarket ? "var(--ink-faint)" : "var(--line)" }}
          />
          vs the market
        </button>
      )}
    </div>
  );
}
