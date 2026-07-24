import Link from "next/link";
import { MetricExplain } from "@/components/observatory/MetricExplain";
import { observatoryChapterHref } from "@/lib/observatory/chapters";
import {
  twrExplanation,
  xirrExplanation,
  type MetricExplanationId,
} from "@/lib/observatory/metric-explanations";
import styles from "./lab-chapter.module.css";

export type LabChapterProps = {
  basePath: string;
  preservedQuery?: Record<string, string>;
  explainOpenId?: MetricExplanationId;
  historyDays: number;
  firstFundedDate: string | null;
  pricesAsOf: string | null;
  dailyChangeAsOf: string;
  twrPct: number;
  xirrPct: number;
  benchmark: {
    available: boolean;
    twrPct: number | null;
    excessReturnPct: number | null;
  };
};

export function LabChapter({
  basePath,
  preservedQuery,
  explainOpenId,
  historyDays,
  firstFundedDate,
  pricesAsOf,
  dailyChangeAsOf,
  twrPct,
  xirrPct,
  benchmark,
}: LabChapterProps) {
  const twr = twrExplanation({
    twrPct,
    historyDays,
    firstFundedDate,
    pricesAsOf,
    dailyChangeAsOf,
    benchmark,
  });
  const xirr = xirrExplanation({
    xirrPct,
    historyDays,
    pricesAsOf,
    dailyChangeAsOf,
  });

  return (
    <div className={styles.chapter}>
      <p className={styles.eyebrow}>Method ledger</p>
      <p className={styles.lead}>
        This portfolio&apos;s return is measured with time-weighted return (TWR),
        which removes the effect of deposits and withdrawals.
      </p>

      <div className={styles.metrics}>
        <MetricExplain
          explanation={twr}
          permalink={observatoryChapterHref(basePath, "lab", {
            ...preservedQuery,
            explain: "twr",
          })}
          initiallyOpen={explainOpenId === "twr"}
        />
        <MetricExplain
          explanation={xirr}
          permalink={observatoryChapterHref(basePath, "lab", {
            ...preservedQuery,
            explain: "xirr",
          })}
          initiallyOpen={explainOpenId === "xirr"}
        />
      </div>

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
