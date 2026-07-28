import type { PublicTradeEntry } from "@/lib/observatory/public-trade-log";
import styles from "../orrery.module.css";

export function LogBay({ entries }: { entries: readonly PublicTradeEntry[] }) {
  return (
    <section className={styles.operationsBay} aria-labelledby="log-title">
      <h3 id="log-title">LOG</h3>
      <ol className={styles.logRows}>
        {entries.length ? entries.map((entry, index) => (
          <li key={`${entry.date}-${entry.ticker}-${index}`}>
            <time>{entry.date}</time>
            <strong>{entry.action.toUpperCase()}</strong>
            <span>{entry.ticker}</span>
            <b>{entry.impactPct >= 0 ? "+" : ""}{(entry.impactPct * 100).toFixed(1)}% OF BOOK</b>
          </li>
        )) : <li><span>NO PUBLIC LOG ENTRIES</span></li>}
      </ol>
    </section>
  );
}
