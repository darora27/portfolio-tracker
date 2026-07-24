import Link from "next/link";
import type { ObservatoryChapter, ObservatoryChapterId } from "@/lib/observatory/chapters";
import { observatoryChapterHref } from "@/lib/observatory/chapters";
import styles from "./observatory.module.css";

type Props = {
  basePath: string;
  chapters: readonly ObservatoryChapter[];
  activeChapterId: ObservatoryChapterId;
  /** Route-relevant query state (e.g. mode, no3d) to keep on every chapter link. */
  preservedQuery?: Record<string, string>;
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
export function ChapterOrbit({ basePath, chapters, activeChapterId, preservedQuery }: Props) {
  const active = chapters.find((c) => c.id === activeChapterId) ?? chapters[0];

  return (
    <div className={styles.orbitWrap}>
      {/*
        Static concentric map (Night Orbit's borrowed "static concentric
        fallback"): a decorative, aria-hidden ring-per-chapter diagram shown
        only in the fallback layout (narrow viewport / reduced motion /
        forced no-3D — see the matching selectors in observatory.module.css).
        It is purely additive: the five real links below remain the only
        chapter controls, so this never introduces a duplicate focus stop or
        changes reading order for assistive tech.
      */}
      <div className={styles.concentricMap} aria-hidden="true">
        {chapters.map((chapter) => (
          <span
            key={chapter.id}
            className={styles.concentricRing}
            data-ring={chapter.index}
            data-active={chapter.id === activeChapterId ? "true" : undefined}
          />
        ))}
        <span className={styles.concentricCenter} />
      </div>
      <nav aria-label="Observatory chapters" className={styles.orbit}>
        {chapters.map((chapter) => (
          <div key={chapter.id} className={styles.bodyItem} data-index={chapter.index}>
            <Link
              href={observatoryChapterHref(basePath, chapter.id, preservedQuery)}
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
