import Link from "next/link";
import { formatDate, formatSignedPercent } from "@/lib/format";
import { windowLabel } from "@/lib/surface-copy";
import styles from "./lab-chapter.module.css";

export type LabChapterProps = {
  historyDays: number;
  firstFundedDate: string | null;
  pricesAsOf: string | null;
  dailyChangeAsOf: string;
  twrPct: number;
  benchmark: {
    available: boolean;
    twrPct: number | null;
    excessReturnPct: number | null;
  };
};

export function LabChapter({
  historyDays,
  firstFundedDate,
  pricesAsOf,
  dailyChangeAsOf,
  twrPct,
  benchmark,
}: LabChapterProps) {
  const period = firstFundedDate
    ? windowLabel(firstFundedDate)
    : "since the first funded snapshot";

  return (
    <div className={styles.chapter}>
      <p className={styles.eyebrow}>Method ledger</p>
      <p className={styles.lead}>
        This portfolio&apos;s return is measured with time-weighted return (TWR),
        which removes the effect of deposits and withdrawals.
      </p>

      <dl className={styles.method}>
        <div>
          <dt>What it measures</dt>
          <dd>TWR chains each funded day&apos;s return into one portfolio result.</dd>
        </div>
        <div className={styles.current}>
          <dt>Current value</dt>
          <dd>{formatSignedPercent(twrPct, 2)} {period}.</dd>
        </div>
        <div>
          <dt>Why deposits are removed</dt>
          <dd>
            A same-day deposit would otherwise look like investment performance,
            even though it is new capital rather than a gain.
          </dd>
        </div>
        <div>
          <dt>Benchmark method</dt>
          <dd>
            {benchmark.available && benchmark.twrPct !== null
              ? `Portfolio TWR is compared with VOO TWR over the identical funded-history window; VOO is currently available at ${formatSignedPercent(benchmark.twrPct, 2)}.`
              : "Portfolio TWR is compared with VOO TWR only over an identical funded-history window; VOO is currently unavailable for a complete same-period comparison."}
          </dd>
        </div>
        <div>
          <dt>Limitations</dt>
          <dd>
            TWR-versus-benchmark comparisons under 14 days of history are
            unreliable. This view currently has {historyDays} days of history.
          </dd>
        </div>
        <div>
          <dt>Freshness</dt>
          <dd>
            Prices as of {formatDate(dailyChangeAsOf)}.
            {pricesAsOf === null ? " The latest source is currently stale." : ""}
          </dd>
        </div>
      </dl>

      <p className={styles.annotation}>
        Method keeps deposits separate from performance and compares both paths
        over the same dates; it does not make a short history more certain.
      </p>

      <Link className={styles.continuation} href="/share/full">
        View the complete public dataset
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
