import type { DashboardData } from "@/lib/dashboard-data";
import type { MissionControlPanelId } from "./MissionControl";
import styles from "./orrery.module.css";

function pct(value: number | null, digits = 1): string {
  if (value === null) return "Unavailable";
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(digits)}%`;
}

export function PublicMissionControlContent({
  panel,
  data,
}: {
  panel: MissionControlPanelId;
  data: DashboardData;
}) {
  const voo = data.benchmarkComparisons.find(({ ticker }) => ticker === "VOO");

  if (panel === "history") {
    return (
      <section className={styles.publicMissionPanel}>
        <p className={styles.inspectorKicker}>Public history / percentage index</p>
        <h3>Return trajectory</h3>
        <p>
          Portfolio TWR is {pct(data.twrPct)} across {data.historyDays} days;
          the current drawdown is {pct(data.allTimeHigh?.pct ?? null)}.
        </p>
        <ol className={styles.publicTelemetryList}>
          {data.chartData.slice(-12).map(({ date, portfolioIndex }) => (
            <li key={date}>
              <time>{date}</time>
              <span>{portfolioIndex.toFixed(2)} index</span>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  if (panel === "trades") {
    return (
      <section className={styles.publicMissionPanel}>
        <p className={styles.inspectorKicker}>Public position structure / no ledger</p>
        <h3>Current allocation</h3>
        <p>
          The public station exposes weights and returns only. Share counts,
          prices, cost basis, and trade reasons remain owner-only.
        </p>
        <ul className={styles.publicTelemetryGrid}>
          {data.publicOrreryHoldings.map((holding) => (
            <li key={holding.ticker}>
              <strong>{holding.ticker}</strong>
              <span>{pct(holding.weight)} weight</span>
              <span>{pct(holding.weeklyReturn)} week</span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (panel === "research") {
    return (
      <section className={styles.publicMissionPanel}>
        <p className={styles.inspectorKicker}>Public research / derived telemetry</p>
        <h3>Holding risk signals</h3>
        <p>
          Public mode contains derived portfolio scalars only. News, filings,
          private notes, and source-level research remain owner-only.
        </p>
        <ul className={styles.publicTelemetryGrid}>
          {data.publicOrreryHoldings.map((holding) => (
            <li key={holding.ticker}>
              <strong>{holding.ticker}</strong>
              <span>{pct(holding.volatilityPct)} volatility</span>
              <span>
                {holding.betaVsVoo === null
                  ? "Beta unavailable"
                  : `${holding.betaVsVoo.toFixed(2)} beta`}
              </span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className={styles.publicMissionPanel}>
      <p className={styles.inspectorKicker}>Public dashboard / percentage-only</p>
      <h3>Portfolio command summary</h3>
      <div className={styles.publicSummaryGrid}>
        <div><span>TWR</span><strong>{pct(data.twrPct)}</strong></div>
        <div><span>Today</span><strong>{pct(data.dailyChangePct)}</strong></div>
        <div><span>Trailing week</span><strong>{pct(data.twr7d)}</strong></div>
        <div><span>Vs. VOO</span><strong>{pct(voo?.excessReturnPct ?? null)}</strong></div>
        <div><span>Top two weight</span><strong>{pct(data.top2ConcentrationPct)}</strong></div>
        <div><span>Volatility</span><strong>{pct(data.volatilityPct)}</strong></div>
      </div>
    </section>
  );
}
