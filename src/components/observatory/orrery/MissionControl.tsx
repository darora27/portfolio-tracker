import Link from "next/link";
import type { ReactNode } from "react";
import {
  OBSERVATORY_CHAPTERS,
  observatoryChapterHref,
  type ObservatoryChapterId,
} from "@/lib/observatory/chapters";
import styles from "./orrery.module.css";

export function MissionControl({
  activeChapterId,
  content,
  closeHref,
  preservedQuery,
}: {
  activeChapterId: ObservatoryChapterId;
  content: ReactNode;
  closeHref: string;
  preservedQuery?: Record<string, string>;
}) {
  return (
    <section
      className={styles.missionControl}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-control-title"
    >
      <header>
        <div>
          <p className={styles.inspectorKicker}>Command camera / public-safe</p>
          <h2 id="mission-control-title" tabIndex={-1}>Mission Control</h2>
        </div>
        <Link href={closeHref} prefetch={false} scroll={false} className={styles.hudButton}>
          Return to universe
        </Link>
      </header>
      <nav aria-label="Mission Control sections">
        {OBSERVATORY_CHAPTERS.map((chapter) => (
          <Link
            key={chapter.id}
            href={observatoryChapterHref("/share", chapter.id, {
              focus: "portfolio",
              camera: "command",
              ...preservedQuery,
            })}
            prefetch={false}
            scroll={false}
            aria-current={chapter.id === activeChapterId ? "page" : undefined}
          >
            {chapter.number} {chapter.label}
          </Link>
        ))}
      </nav>
      <div className={styles.missionContent}>{content}</div>
    </section>
  );
}
