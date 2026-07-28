import Link from "next/link";
import type { PublicOrreryHolding } from "@/lib/observatory/orrery";
import styles from "../orrery.module.css";

export function SignalsBay({
  basePath,
  tickers,
  cells,
  holdings,
  hhi,
}: {
  basePath: string;
  tickers: readonly string[];
  cells: readonly (readonly (number | null)[])[];
  holdings: readonly PublicOrreryHolding[];
  hhi: number;
}) {
  const band = hhi >= 2500 ? "HIGH" : hhi >= 1500 ? "WATCH" : "BROAD";
  return (
    <section className={styles.operationsBay} aria-labelledby="signals-title">
      <h3 id="signals-title">SIGNALS</h3>
      <p className={styles.bayQuestion}>what moves together</p>
      <div className={styles.signalsLayout}>
        <div className={styles.signalMatrix} style={{ gridTemplateColumns: `repeat(${Math.max(1, tickers.length)}, 1fr)` }}>
          {tickers.flatMap((ticker, row) =>
            tickers.map((column, col) => {
              const value = cells[row]?.[col] ?? null;
              const diagonal = row === col;
              return (
                <Link
                  key={`${ticker}-${column}`}
                  title={`${ticker} / ${column}: ${value === null ? "unavailable" : value.toFixed(2)}`}
                  href={`${basePath}?focus=portfolio&camera=command&station=plot&pair=${encodeURIComponent(`${ticker}-${column}`)}`}
                  style={{ opacity: diagonal ? 1 : Math.max(0.25, Math.abs(value ?? 0)) }}
                >
                  {diagonal ? ticker : value === null ? "—" : value >= 0 ? "+" : "−"}
                </Link>
              );
            }),
          )}
        </div>
        <div className={styles.compositionArcs}>
          {holdings.map((holding, index) => (
            <i
              key={holding.ticker}
              title={`${holding.ticker} ${(holding.weight * 100).toFixed(1)}% at orbital rank ${index + 1}`}
              style={{
                inset: `${index * 5}px`,
                "--arc": `${Math.max(12, holding.weight * 360)}deg`,
              } as React.CSSProperties}
            />
          ))}
          <strong>CONCENTRATION: {band}</strong>
        </div>
      </div>
    </section>
  );
}
