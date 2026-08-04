import { drawdown } from "@/lib/math/drawdown";
import styles from "./chart-room.module.css";

function signedPercentLabel(value: number, digits = 1): string {
  const glyph = value > 0 ? "▲" : value < 0 ? "▼" : "◆";
  return `${glyph} ${Math.abs(value * 100).toFixed(digits)}%`;
}

/**
 * DEPTH — "how far under its high?" Since-buy drawdown, computed via
 * drawdown() called directly on this ticker's own daily returns (matches
 * dashboard-data.ts's own portfolio-level call, just fed a single
 * ticker's series) -- not a second drawdown implementation.
 */
export function DepthBench({ dailyReturns }: { dailyReturns: { date: string; r: number }[] }) {
  if (dailyReturns.length === 0) {
    return (
      <section className={styles.inst} aria-label="Drawdown depth gauge">
        <div className={styles.instHead}>
          <h2>DEPTH</h2>
          <span className={styles.q}>how far under its high?</span>
        </div>
        <p className={styles.empty}>Not enough history since purchase yet.</p>
      </section>
    );
  }

  const { series } = drawdown(dailyReturns.map((d) => d.r));
  let worst = 0;
  let worstIndex = 0;
  series.forEach((dd, i) => {
    if (dd < worst) {
      worst = dd;
      worstIndex = i;
    }
  });
  const cur = series[series.length - 1];
  const worstDate = worstIndex > 0 ? dailyReturns[worstIndex - 1].date : dailyReturns[0].date;

  const T = 24;
  const B = 160;
  const X = 70;
  const scale = (v: number) => T + (Math.abs(v) / 0.3) * (B - T);

  return (
    <section className={styles.inst} aria-label="Drawdown depth gauge">
      <div className={styles.instHead}>
        <h2>DEPTH</h2>
        <span className={styles.q}>how far under its high?</span>
      </div>
      <svg viewBox="0 0 300 190" role="img" aria-label="Drawdown depth gauge">
        <line x1={X} x2={X} y1={T} y2={B} stroke="rgba(213,186,140,.35)" strokeWidth={3} />
        <text x={X + 12} y={T + 4}>0 · AT HIGH</text>
        {[-0.1, -0.2, -0.3].map((v, step) =>
          Math.abs(scale(v) - scale(worst)) > 12 ? (
            // R7-W9: these three are distinct literals, so this one was safe —
            // changed for consistency, since the next person adding a tick
            // should not have to work out which of these rules applies.
            <g key={step}>
              <line className={styles.hair} x1={X - 8} x2={X + 8} y1={scale(v)} y2={scale(v)} />
              <text x={X + 12} y={scale(v) + 4}>{`${v * 100}%`}</text>
            </g>
          ) : null,
        )}
        <line x1={X - 16} x2={X + 16} y1={scale(worst)} y2={scale(worst)} stroke="var(--loss)" strokeWidth={2} />
        <text x={X + 24} y={scale(worst) + 4} fill="var(--loss)">
          {`WORST ${(worst * 100).toFixed(1)}% · ${worstDate}`}
        </text>
        <path d={`M${X - 22} ${scale(cur)} l-12 -7 l0 14 Z`} className={styles.benchBar} />
        <text x={X - 34} y={scale(cur) - 12} fill="var(--trace)">NOW</text>
      </svg>
      <p className={styles.stamp}>OFF HIGH {signedPercentLabel(cur)} · SINCE BUY</p>
    </section>
  );
}
