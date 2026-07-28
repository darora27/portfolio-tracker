"use client";

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
import styles from "../orrery.module.css";

export function ScopeBay({ data }: { data: readonly ChartPoint[] }) {
  const values = data.flatMap((point) => [
    point.portfolioIndex,
    point.vooIndex ?? point.portfolioIndex,
  ]);
  const minimum = Math.min(100, ...values);
  return (
    <section className={styles.operationsBay} aria-labelledby="scope-title">
      <h3 id="scope-title">SCOPE</h3>
      <div className={styles.scopeTrace}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={[...data]} margin={{ top: 8, right: 10, bottom: 8, left: -18 }}>
            <CartesianGrid stroke="rgba(232,196,141,.13)" strokeDasharray="2 4" />
            <ReferenceArea y1={minimum} y2={100} fill="#8f3d27" fillOpacity={0.16} />
            <ReferenceLine y={100} stroke="#f4dba8" strokeWidth={1.5} />
            <XAxis dataKey="date" hide />
            <YAxis domain={["auto", "auto"]} tick={{ fill: "#cdb98f", fontSize: 10 }} />
            <Line dataKey="portfolioIndex" stroke="#e6a14d" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            <Line dataKey="vooIndex" stroke="#927e64" strokeDasharray="5 5" dot={false} isAnimationActive={false} />
            <Line dataKey="vtiIndex" stroke="#725f4e" strokeDasharray="2 6" dot={false} isAnimationActive={false} />
            <Line dataKey="xlkIndex" stroke="#5e5044" strokeDasharray="8 4" dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
        <span className={styles.scopeStamp}>INDEXED 100 · NET OF FLOWS</span>
      </div>
    </section>
  );
}
