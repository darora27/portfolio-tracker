import Link from "next/link";
import styles from "../orrery.module.css";

function pct(value: number | null): string {
  return value === null ? "—" : `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`;
}

export function HazardBay({
  basePath,
  volatility,
  beta,
  drawdown,
  winRate,
  best,
  worst,
}: {
  basePath: string;
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
      <p className={styles.bayQuestion}>how much can this hurt</p>
      <div className={styles.hazardGrid}>
        <div className={styles.needleGauge}>
          <span>VOL</span><i style={{ rotate: `${-55 + Math.min(110, (volatility ?? 0) * 180)}deg` }} />
          <strong title={volatility === null ? "Volatility unavailable: source history missing" : undefined}>{pct(volatility)}</strong>
        </div>
        <div className={styles.needleGauge}>
          <span>BETA</span><i style={{ rotate: `${-55 + Math.min(110, Math.max(0, beta ?? 0) * 55)}deg` }} />
          <strong title={beta === null ? "Beta unavailable: unmatched same-period benchmark" : undefined}>{beta === null ? "—" : beta.toFixed(2)}</strong>
        </div>
        <div className={styles.pressureColumn}>
          <span>PRESSURE</span><i style={{ height: `${Math.min(100, Math.abs(drawdown ?? 0) * 250)}%` }} />
          <b>ATH</b><strong title={drawdown === null ? "Drawdown unavailable: source history missing" : undefined}>{pct(drawdown)}</strong>
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
      <Link
        className={styles.bayDestination}
        href={basePath === "/share" ? "/share/full" : "/history"}
      >
        DRAWDOWN HISTORY ▸
      </Link>
    </section>
  );
}
