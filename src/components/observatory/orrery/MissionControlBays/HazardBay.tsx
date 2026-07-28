import styles from "../orrery.module.css";

function pct(value: number | null): string {
  return value === null ? "—" : `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

export function HazardBay({
  volatility,
  beta,
  drawdown,
  winRate,
  best,
  worst,
}: {
  volatility: number | null;
  beta: number | null;
  drawdown: number | null;
  winRate: number;
  best: number | null;
  worst: number | null;
}) {
  return (
    <section className={styles.operationsBay} aria-labelledby="hazard-title">
      <h3 id="hazard-title">HAZARD</h3>
      <div className={styles.hazardGrid}>
        <div className={styles.needleGauge}>
          <span>VOL</span><i style={{ rotate: `${-55 + Math.min(110, (volatility ?? 0) * 180)}deg` }} />
          <strong>{pct(volatility)}</strong>
        </div>
        <div className={styles.needleGauge}>
          <span>BETA</span><i style={{ rotate: `${-55 + Math.min(110, Math.max(0, beta ?? 0) * 55)}deg` }} />
          <strong>{beta === null ? "—" : beta.toFixed(2)}</strong>
        </div>
        <div className={styles.pressureColumn}>
          <span>PRESSURE</span><i style={{ height: `${Math.min(100, Math.abs(drawdown ?? 0) * 250)}%` }} />
          <b>ATH</b><strong>{pct(drawdown)}</strong>
        </div>
        <div className={styles.lampBar}>
          <span>WIN RATE</span>
          <div>{Array.from({ length: 10 }, (_, index) => <i key={index} data-lit={index < Math.round(winRate / 10)} />)}</div>
          <strong>{winRate.toFixed(1)}%</strong>
        </div>
      </div>
      <div className={styles.stampedExtremes}>
        <span>BEST <b>{pct(best)}</b></span>
        <span>WORST <b>{pct(worst)}</b></span>
      </div>
    </section>
  );
}
