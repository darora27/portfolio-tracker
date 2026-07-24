import Link from "next/link";
import { formatSignedPercent } from "@/lib/format";
import {
  foldContributionsForDisplay,
  forcesMarginaliaCopy,
  rankContributions,
} from "@/lib/observatory/forces-copy";
import { observatoryChapterHref } from "@/lib/observatory/chapters";
import styles from "./forces-chapter.module.css";

export type ForcesChapterProps = {
  positions: { ticker: string; contribution: number | null }[];
  movers: { ticker: string; dayPct: number }[];
};

export function ForcesChapter({ positions, movers }: ForcesChapterProps) {
  const ranked = rankContributions(positions);
  const display = foldContributionsForDisplay(ranked);
  const rows = display.otherSum === null
    ? display.named
    : [...display.named, { ticker: "Other", contribution: display.otherSum }];
  const maximum = Math.max(
    ...rows.map((row) => Math.abs(row.contribution)),
    0.0001,
  );
  const marginalia = forcesMarginaliaCopy(ranked);
  const positiveCount = ranked.filter((row) => row.contribution > 0).length;
  const biggestMover = movers[0];

  return (
    <div className={styles.chapter}>
      <p className={styles.eyebrow}>Contribution field notes</p>
      <p className={styles.lead}>
        Every holding&apos;s share of the portfolio&apos;s total return, ranked.
      </p>

      <figure className={styles.contributions}>
        <figcaption>Contribution to total return by holding</figcaption>
        {rows.length > 0 ? (
          <ol className={styles.barList}>
            {rows.map((row) => {
              const width = `${Math.max((Math.abs(row.contribution) / maximum) * 50, 1.5)}%`;
              return (
                <li key={row.ticker} className={styles.barRow}>
                  <span className={styles.ticker}>{row.ticker}</span>
                  <span className={styles.barTrack} aria-hidden="true">
                    <i
                      className={row.contribution >= 0 ? styles.positiveBar : styles.negativeBar}
                      style={{ width }}
                    />
                  </span>
                  <span className={styles.value}>
                    {formatSignedPercent(row.contribution, 1)}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className={styles.empty}>Contribution appears after a holding has a priced result.</p>
        )}
      </figure>

      {marginalia ? (
        <aside className={styles.marginalia} aria-label="Contribution observation">
          <span>Evidence note</span>
          <p>{marginalia}</p>
        </aside>
      ) : null}

      <ul className={styles.facts}>
        {ranked.length > 0 ? (
          <li>{positiveCount} of {ranked.length} holdings added to the result.</li>
        ) : null}
        {biggestMover ? (
          <li>
            {biggestMover.ticker} moved the most today,{" "}
            {formatSignedPercent(biggestMover.dayPct, 1)}.
          </li>
        ) : null}
      </ul>

      <Link
        className={styles.continuation}
        href={observatoryChapterHref("/share", "structure")}
      >
        Open Structure
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
