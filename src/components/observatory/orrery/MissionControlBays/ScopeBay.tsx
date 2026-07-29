"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/components/dashboard/ValueChart";
import { UNIVERSE_PALETTE } from "@/lib/observatory/universe-palette";
import styles from "../orrery.module.css";

export function ScopeBay({ data }: { data: readonly ChartPoint[] }) {
  const [range, setRange] = useState<"30" | "90" | "max">("max");
  const [showBenchmark, setShowBenchmark] = useState(true);
  const visibleData = useMemo(() => {
    if (range === "30") return data.slice(-30);
    if (range === "90") return data.slice(-90);
    return data;
  }, [data, range]);
  const values = visibleData.flatMap((point) => [
    point.portfolioIndex,
    point.vooIndex ?? point.portfolioIndex,
  ]);
  const minimum = Math.min(100, ...values);
  return (
    <section className={styles.operationsBay} aria-labelledby="scope-title">
      <h3 id="scope-title">SCOPE</h3>
      <p className={styles.bayQuestion}>am I beating the market</p>
      <div className={styles.scopeControls}>
        {(["30", "90", "max"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={range === value}
            onClick={() => setRange(value)}
          >
            {value === "max" ? "MAX" : `${value}D`}
          </button>
        ))}
        <button
          type="button"
          aria-pressed={showBenchmark}
          onClick={() => setShowBenchmark((current) => !current)}
        >
          VOO
        </button>
      </div>
      <div className={styles.scopeTrace}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={[...visibleData]} margin={{ top: 8, right: 10, bottom: 8, left: -18 }}>
            <CartesianGrid stroke="rgba(232,196,141,.13)" strokeDasharray="2 4" />
            <ReferenceArea y1={minimum} y2={100} fill="#8f3d27" fillOpacity={0.16} />
            <ReferenceLine
              y={100}
              stroke="var(--universe-cabinet-chart-baseline)"
              strokeWidth={1.5}
            />
            <XAxis dataKey="date" hide />
            <YAxis domain={["auto", "auto"]} tick={{ fill: "#cdb98f", fontSize: 10 }} />
            <Line dataKey="portfolioIndex" stroke={UNIVERSE_PALETTE.glass.scopeHero} strokeWidth={2.5} dot={false} isAnimationActive={false} />
            {showBenchmark ? <Line dataKey="vooIndex" stroke="#927e64" strokeDasharray="5 5" dot={false} isAnimationActive={false} /> : null}
            {showBenchmark ? <Line dataKey="vtiIndex" stroke="#725f4e" strokeDasharray="2 6" dot={false} isAnimationActive={false} /> : null}
            {showBenchmark ? <Line dataKey="xlkIndex" stroke="#5e5044" strokeDasharray="8 4" dot={false} isAnimationActive={false} /> : null}
          </LineChart>
        </ResponsiveContainer>
        <span className={styles.scopeStamp}>INDEXED 100 · NET OF FLOWS</span>
      </div>
    </section>
  );
}
