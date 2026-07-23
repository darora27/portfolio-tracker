import Link from "next/link";
import type { ObservatoryChapter, ObservatoryChapterId } from "@/lib/observatory/chapters";
import { observatoryChapterHref } from "@/lib/observatory/chapters";
import styles from "./observatory.module.css";

type Props = {
  basePath: string;
  chapters: readonly ObservatoryChapter[];
  activeChapterId: ObservatoryChapterId;
};

/**
 * The orbital chapter nav (Night Orbit's borrowed "orbital chapter
 * navigation" + "selected-body inspector") and the numbered-strip /
 * static-concentric fallback are the SAME set of real anchors — CSS
 * transforms position them into an orbit on wide, motion-ok viewports and
 * collapse them into a stacked strip otherwise (see observatory.module.css).
 * There is exactly one semantic control per chapter; nothing here is a
 * duplicate focus stop. `next/link` renders a real, server-rendered
 * `<a href>` (functional with JS disabled) and additionally soft-navigates
 * client-side once hydrated, which is what lets ChapterFocusManager's
 * focus-restoration actually engage instead of every click forcing a full
 * document reload.
 */
export function ChapterOrbit({ basePath, chapters, activeChapterId }: Props) {
  const active = chapters.find((c) => c.id === activeChapterId) ?? chapters[0];

  return (
    <div className={styles.orbitWrap}>
      <nav aria-label="Observatory chapters" className={styles.orbit}>
        {chapters.map((chapter) => (
          <div key={chapter.id} className={styles.bodyItem} data-index={chapter.index}>
            <Link
              href={observatoryChapterHref(basePath, chapter.id)}
              aria-current={chapter.id === activeChapterId ? "page" : undefined}
              className={styles.body}
              scroll={false}
            >
              <span className={styles.bodyNumber} aria-hidden="true">
                {chapter.number}
              </span>
              <span>{chapter.label}</span>
            </Link>
          </div>
        ))}
        <div className={styles.inspector}>
          <p className={styles.inspectorNumber}>{active.number}</p>
          <p className={styles.inspectorLabel}>{active.label}</p>
          <p className={styles.inspectorQuestion}>{active.question}</p>
        </div>
      </nav>
    </div>
  );
}
