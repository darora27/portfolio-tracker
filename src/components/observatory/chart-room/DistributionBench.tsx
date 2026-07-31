import styles from "./chart-room.module.css";

function signedPercentLabel(value: number, digits = 1): string {
  const glyph = value > 0 ? "▲" : value < 0 ? "▼" : "◆";
  return `${glyph} ${Math.abs(value * 100).toFixed(digits)}%`;
}

/**
 * DISTRIBUTION — "is today normal?" Histogram of since-buy daily returns
 * (implementer's choice, per spec §6.1 -- picked to match DEPTH's own
 * "SINCE BUY" stamp for a consistent window across the bench row).
 * sigma/annualized-vol reuse the already-computed portfolio-level formula's
 * output (volatilityPct, annualizedVolatility/sqrt(252) reversed for the
 * daily figure) rather than a second stdev implementation.
 */
export function DistributionBench({
  dailyReturns,
  volatilityPct,
}: {
  dailyReturns: { date: string; r: number }[];
  volatilityPct: number | null;
}) {
  if (dailyReturns.length === 0) {
    return (
      <section className={styles.inst} aria-label="Return distribution">
        <div className={styles.instHead}>
          <h2>DISTRIBUTION</h2>
          <span className={styles.q}>is today normal?</span>
        </div>
        <p className={styles.empty}>Not enough history since purchase yet.</p>
      </section>
    );
  }

  const rets = dailyReturns.map((d) => d.r);
  const today = rets[rets.length - 1];
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const dailySigma = volatilityPct !== null ? volatilityPct / Math.sqrt(252) : null;

  const lo = -0.08;
  const binW = 0.01;
  const bins = new Array(16).fill(0);
  for (const r of rets) bins[Math.min(15, Math.max(0, Math.floor((r - lo) / binW)))]++;
  const max = Math.max(...bins, 1);
  const L = 10;
  const B = 150;
  const W = 17.5;
  const xFor = (v: number) => L + ((v - lo) / binW) * W;
  const todayColor = today < 0 ? "var(--loss)" : "var(--gain)";

  return (
    <section className={styles.inst} aria-label="Return distribution">
      <div className={styles.instHead}>
        <h2>DISTRIBUTION</h2>
        <span className={styles.q}>is today normal?</span>
      </div>
      <svg viewBox="0 0 300 190" role="img" aria-label="Daily return distribution">
        {dailySigma !== null && (
          <rect x={xFor(mean - dailySigma)} y={26} width={xFor(mean + dailySigma) - xFor(mean - dailySigma)} height={124} fill="rgba(213,186,140,.10)" />
        )}
        {bins.map((c, i) => {
          const h = (c / max) * 112;
          return (
            <rect key={i} className={styles.benchBar} x={L + i * W + 1.5} y={150 - h} width={W - 3} height={Math.max(h, 1)} opacity={0.85} />
          );
        })}
        <line x1={xFor(mean)} x2={xFor(mean)} y1={22} y2={B} stroke="var(--baseline)" strokeWidth={1.5} />
        <line x1={xFor(today)} x2={xFor(today)} y1={16} y2={B} stroke={todayColor} strokeWidth={2.5} />
        <text x={Math.min(230, Math.max(6, xFor(today) - 28))} y={12} fill={todayColor}>
          {`TODAY ${signedPercentLabel(today)}`}
        </text>
        <text x={L} y={B + 16}>−8%</text>
        <text x={139} y={B + 16}>0</text>
        <text x={262} y={B + 16}>+8%</text>
      </svg>
      <p className={styles.stamp}>
        SINCE BUY · N={rets.length} SESSIONS
        {dailySigma !== null && ` · σ DAILY ${(dailySigma * 100).toFixed(1)}%`}
        {volatilityPct !== null && ` · VOL ANN ${(volatilityPct * 100).toFixed(0)}%`}
      </p>
    </section>
  );
}
