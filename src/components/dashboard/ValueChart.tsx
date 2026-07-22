"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate } from "@/lib/format";

export type ChartPoint = {
  date: string;
  portfolioIndex: number;
};

export function ValueChart({ data }: { data: ChartPoint[] }) {
  return (
    <section>
      <h2 className="text-lg font-medium">Value over time</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Indexed to 100 at the first snapshot, net of cash flows — a fair basis for a benchmark
        comparison later. VOO will appear here once the daily snapshot job backfills benchmark
        prices (Phase 4).
      </p>
      <div className="mt-3 h-64 rounded-lg border border-zinc-200 p-2 dark:border-zinc-800">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="date"
              tickFormatter={(d: string) => formatDate(d)}
              tick={{ fontSize: 11 }}
              minTickGap={40}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              domain={["auto", "auto"]}
              width={48}
              tickFormatter={(v: number) => v.toFixed(0)}
            />
            <Tooltip
              labelFormatter={(d) => (typeof d === "string" ? formatDate(d) : d)}
              formatter={(value) => [typeof value === "number" ? value.toFixed(2) : value, "Portfolio"]}
            />
            <Line
              type="monotone"
              dataKey="portfolioIndex"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              name="Portfolio"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
