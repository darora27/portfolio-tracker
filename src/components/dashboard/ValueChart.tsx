"use client";

import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate } from "@/lib/format";

export type ChartPoint = {
  date: string;
  portfolioIndex: number;
  benchmarkIndex?: number;
};

export function ValueChart({ data }: { data: ChartPoint[] }) {
  const hasBenchmark = data.some((d) => d.benchmarkIndex !== undefined);

  return (
    <section>
      <h2 className="text-lg font-medium">Value over time</h2>
      <p className="mt-1 text-xs text-zinc-500">
        {hasBenchmark
          ? "Both series indexed to 100 at the same start date, net of cash flows — a fair same-period comparison against VOO."
          : "Indexed to 100 at the first snapshot, net of cash flows. VOO comparison needs a full-history benchmark match — it'll appear once that's available."}
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
              formatter={(value, name) => [typeof value === "number" ? value.toFixed(2) : value, name]}
            />
            {hasBenchmark && <Legend wrapperStyle={{ fontSize: 12 }} />}
            <Line
              type="monotone"
              dataKey="portfolioIndex"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              name="Portfolio"
            />
            {hasBenchmark && (
              <Line
                type="monotone"
                dataKey="benchmarkIndex"
                stroke="#9ca3af"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={false}
                name="VOO"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
