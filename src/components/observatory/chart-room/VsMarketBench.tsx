import styles from "./chart-room.module.css";

/**
 * VS MARKET — "with it, or against it?" Scatter of shared-date
 * (vooReturn, tickerReturn) pairs, regression line at the already-computed
 * betaVsVoo slope (perHoldingRisk) -- beta is never recomputed here.
 */
export function VsMarketBench({
  dailyReturns,
  vooDailyReturns,
  betaVsVoo,
  correlationWithVoo,
}: {
  dailyReturns: { date: string; r: number }[];
  vooDailyReturns: { date: string; r: number }[];
  betaVsVoo: number | null;
  correlationWithVoo: number | null;
}) {
  const vooByDate = new Map(vooDailyReturns.map((p) => [p.date, p.r]));
  const pairs = dailyReturns
    .filter((p) => vooByDate.has(p.date))
    .map((p) => ({ voo: vooByDate.get(p.date)!, ticker: p.r }));

  if (betaVsVoo === null || pairs.length === 0) {
    return (
      <section className={styles.inst} aria-label="Beta scatter vs VOO">
        <div className={styles.instHead}>
          <h2>VS MARKET</h2>
          <span className={styles.q}>with it, or against it?</span>
        </div>
        <p className={styles.empty}>Not enough shared trading history with VOO yet.</p>
      </section>
    );
  }

  const C = 150;
  const Cy = 88;
  const SC = 1500;
  const x0 = -0.05;
  const x1 = 0.05;

  return (
    <section className={styles.inst} aria-label="Beta scatter vs VOO">
      <div className={styles.instHead}>
        <h2>VS MARKET</h2>
        <span className={styles.q}>with it, or against it?</span>
      </div>
      <svg viewBox="0 0 300 190" role="img" aria-label="Beta scatter versus VOO">
        <line className={styles.hair} x1={0} x2={300} y1={Cy} y2={Cy} />
        <line className={styles.hair} x1={C} x2={C} y1={8} y2={168} />
        <text x={212} y={20}>WITH</text>
        <text x={30} y={20}>AGAINST</text>
        {pairs.map((p, i) => (
          <circle
            key={i}
            cx={C + p.voo * SC}
            cy={Cy - p.ticker * SC}
            r={2.4}
            fill={i === pairs.length - 1 ? "#fff7e6" : "var(--trace)"}
            opacity={i === pairs.length - 1 ? 1 : 0.65}
          />
        ))}
        <line
          x1={C + x0 * SC}
          y1={Cy - betaVsVoo * x0 * SC}
          x2={C + x1 * SC}
          y2={Cy - betaVsVoo * x1 * SC}
          stroke="var(--baseline)"
          strokeWidth={1.6}
        />
        <text x={10} y={160}>VOO DAY →</text>
      </svg>
      <p className={styles.stamp}>
        SLOPE = BETA {betaVsVoo.toFixed(2)}
        {correlationWithVoo !== null && ` · FIT r ${correlationWithVoo.toFixed(2)}`} · N={pairs.length} SHARED DAYS
      </p>
    </section>
  );
}
