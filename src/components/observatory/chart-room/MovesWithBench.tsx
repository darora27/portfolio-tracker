import { correlationPairSentence, type CorrelatedPair } from "@/lib/observatory/structure-copy";
import styles from "./chart-room.module.css";

/**
 * MOVES WITH — "is this its own bet?" correlationRow is already this
 * ticker's own row of the whole-portfolio correlation matrix
 * (getStockDetailData), no new data. The sentence reuses
 * correlationPairSentence (FB-11's already-shipped "compare by |r|, not
 * raw r" convention) fed the top-|r| entry in this row.
 */
export function MovesWithBench({
  ticker,
  correlationRow,
}: {
  ticker: string;
  correlationRow: { ticker: string; value: number | null }[];
}) {
  const rows: { ticker: string; value: number }[] = correlationRow.filter(
    (c): c is { ticker: string; value: number } => c.value !== null,
  );

  if (rows.length === 0) {
    return (
      <section className={styles.inst} aria-label="Correlation with other holdings">
        <div className={styles.instHead}>
          <h2>MOVES WITH</h2>
          <span className={styles.q}>is this its own bet?</span>
        </div>
        <p className={styles.empty}>Not enough shared history with other holdings yet.</p>
      </section>
    );
  }

  const topRow = rows.reduce((best, row) => (Math.abs(row.value) > Math.abs(best.value) ? row : best));
  const pair: CorrelatedPair = { a: ticker, b: topRow.ticker, correlation: topRow.value };
  const sentence = correlationPairSentence(pair);

  const C = 150;
  const W = 118;

  return (
    <section className={styles.inst} aria-label="Correlation with other holdings">
      <div className={styles.instHead}>
        <h2>MOVES WITH</h2>
        <span className={styles.q}>is this its own bet?</span>
      </div>
      <svg viewBox="0 0 300 168" role="img" aria-label="Correlation bars">
        <line x1={C} x2={C} y1={6} y2={162} stroke="rgba(213,186,140,.35)" />
        {rows.map((row, i) => {
          const y = 16 + i * 21;
          return (
            <g key={row.ticker}>
              <rect
                x={row.value >= 0 ? C : C + row.value * W}
                y={y - 7}
                width={Math.abs(row.value) * W}
                height={14}
                className={styles.benchBar}
                opacity={0.35 + Math.abs(row.value) * 0.6}
              />
              <text x={6} y={y + 4} fill="#f5ead1">{row.ticker}</text>
              <text x={252} y={y + 4}>{row.value.toFixed(2)}</text>
            </g>
          );
        })}
      </svg>
      {sentence && <p className={styles.sentence}>{sentence}</p>}
      <p className={styles.stamp}>SINCE BUY · SHARED DAYS</p>
    </section>
  );
}
