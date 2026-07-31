import { formatCurrency, formatSignedCurrency } from "@/lib/format";
import styles from "./chart-room.module.css";

/**
 * CONTRIBUTION & POSITION — "what has it done to the book?" Ranks every
 * current holding by contributionRanking (already-computed per-position
 * contribution), sorted descending exactly as ContributionChart already
 * sorts (b.contribution - a.contribution) -- not re-derived. Four
 * owner-tagged tiles use already-existing fields, each omitted, never
 * zeroed, when null.
 */
export function ContributionBench({
  ticker,
  contributionRanking,
  value,
  costBasis,
  day,
  gain,
}: {
  ticker: string;
  contributionRanking: { ticker: string; contribution: number | null }[];
  value: number;
  costBasis: number;
  day: number | null;
  gain: number | null;
}) {
  const ranked = contributionRanking
    .filter((r): r is { ticker: string; contribution: number } => r.contribution !== null)
    .sort((a, b) => b.contribution - a.contribution);
  const rank = ranked.findIndex((r) => r.ticker === ticker) + 1;

  const C = 310;
  const W = 64;
  // The mock's fixed 120px-tall viewBox assumes ~7 holdings (15px/row); a
  // real portfolio can hold more, so the row pitch is preserved and the
  // canvas grows with it instead of rows overlapping the stamp below.
  const svgHeight = Math.max(120, 20 + ranked.length * 15);

  return (
    <section className={styles.inst} aria-label="Contribution and position">
      <div className={styles.instHead}>
        <h2>CONTRIBUTION &amp; POSITION</h2>
        <span className={styles.q}>what has it done to the book?</span>
      </div>
      {ranked.length === 0 ? (
        <p className={styles.empty}>Not enough data to rank contribution yet.</p>
      ) : (
        <>
          <svg viewBox={`0 0 620 ${svgHeight}`} role="img" aria-label="Contribution ranking">
            <line x1={C} x2={C} y1={6} y2={svgHeight - 8} stroke="rgba(213,186,140,.35)" />
            {ranked.map((row, i) => {
              const y = 10 + i * 15;
              const isSelf = row.ticker === ticker;
              const v = row.contribution * 100;
              return (
                <g key={row.ticker}>
                  <rect
                    x={v >= 0 ? C : C + v * W}
                    y={y}
                    width={Math.abs(v) * W}
                    height={10}
                    fill={isSelf ? "var(--baseline)" : "rgba(230,161,77,.4)"}
                  />
                  <text x={v >= 0 ? C - 46 : C + 8} y={y + 9} fill={isSelf ? "var(--cream)" : "var(--word)"}>
                    {row.ticker}
                  </text>
                  <text x={v >= 0 ? C + Math.abs(v) * W + 6 : C - Math.abs(v) * W - 52} y={y + 9}>
                    {`${v > 0 ? "+" : ""}${v.toFixed(1)}%`}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className={styles.stamp}>
            CONTRIBUTION · SINCE BUY{rank > 0 && ` · RANK ${rank} OF ${ranked.length}`}
          </p>
        </>
      )}
      <div className={styles.tiles}>
        <div className={styles.tile}>
          <span>
            VALUE <span className={styles.ownertag}>OWNER</span>
          </span>
          <b>{formatCurrency(value)}</b>
        </div>
        <div className={styles.tile}>
          <span>
            COST BASIS <span className={styles.ownertag}>OWNER</span>
          </span>
          <b>{formatCurrency(costBasis)}</b>
        </div>
        {day !== null && (
          <div className={styles.tile}>
            <span>
              DAY $ <span className={styles.ownertag}>OWNER</span>
            </span>
            <b>{formatSignedCurrency(day)}</b>
          </div>
        )}
        {gain !== null && (
          <div className={styles.tile}>
            <span>
              SINCE BUY $ <span className={styles.ownertag}>OWNER</span>
            </span>
            <b>{formatSignedCurrency(gain)}</b>
          </div>
        )}
      </div>
    </section>
  );
}

