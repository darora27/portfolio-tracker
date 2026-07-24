import Link from "next/link";
import {
  briefingWhyCopy,
  buildAttentionItems,
} from "@/lib/observatory/briefing-copy";
import { observatoryChapterHref } from "@/lib/observatory/chapters";
import { todayLine } from "@/lib/surface-copy";
import styles from "./briefing-chapter.module.css";

export type BriefingChapterProps = {
  dailyChangePct: number;
  movers: { ticker: string; dayPct: number }[];
  pricesStale: boolean;
  hhi: number;
  upcomingEarnings: { ticker: string; date: string }[];
  today: string;
};

export function BriefingChapter({
  dailyChangePct,
  movers,
  pricesStale,
  hhi,
  upcomingEarnings,
  today,
}: BriefingChapterProps) {
  const driver = briefingWhyCopy(movers);
  const attentionItems = buildAttentionItems({
    pricesStale,
    hhi,
    topMover: movers[0] ?? null,
    upcomingEarnings,
    today,
  });

  return (
    <div className={styles.chapter}>
      <p className={styles.eyebrow}>Owner briefing</p>
      <p className={styles.lead}>{todayLine({ dayReturn: dailyChangePct })}</p>
      {driver ? <p className={styles.driver}>{driver}</p> : null}

      <section className={styles.attention} aria-labelledby="briefing-attention-heading">
        <h3 id="briefing-attention-heading" className={styles.attentionHeading}>
          What deserves attention
        </h3>
        {attentionItems.length > 0 ? (
          <ul className={styles.attentionList}>
            {attentionItems.map((item) => (
              <li key={item.id} className={styles.annotation}>
                <Link href={item.href}>
                  <span className={styles.severity}>
                    {item.severity === "critical" ? "Critical: " : "Notice: "}
                  </span>
                  {item.text}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.clearState}>Nothing needs your attention right now.</p>
        )}
      </section>

      <Link className={styles.continuation} href={observatoryChapterHref("/", "forces")}>
        Open Forces
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
