import Link from "next/link";
import type { PublicTradeEntry } from "@/lib/observatory/public-trade-log";
import styles from "../orrery.module.css";

export function LogBay({
  entries,
  basePath,
}: {
  entries: readonly PublicTradeEntry[];
  basePath: string;
}) {
  return (
    <section className={styles.operationsBay} aria-labelledby="log-title">
      <h3 id="log-title">LOG</h3>
      <p className={styles.bayQuestion}>what did I do</p>
      <ol className={styles.logRows}>
        {entries.length ? entries.map((entry, index) => (
          <li key={`${entry.date}-${entry.ticker}-${index}`}>
            <Link href={`${basePath}?holding=${encodeURIComponent(entry.ticker)}&camera=approach`}>
              <time>{entry.date}</time>
              <strong>{entry.action.toUpperCase()}</strong>
              <span>{entry.ticker}</span>
              <b>{entry.impactPct >= 0 ? "+" : ""}{(entry.impactPct * 100).toFixed(1)}% OF BOOK</b>
            </Link>
          </li>
        )) : <li><span>NO PUBLIC LOG ENTRIES</span></li>}
      </ol>
    </section>
  );
}
