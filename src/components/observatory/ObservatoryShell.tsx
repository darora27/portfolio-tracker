import {
  OBSERVATORY_CHAPTERS,
  type ObservatoryChapterId,
} from "@/lib/observatory/chapters";
import { ChapterOrbit } from "./ChapterOrbit";
import { ChapterFocusManager } from "./ChapterFocusManager";
import styles from "./observatory.module.css";

export type ObservatoryFreshness = {
  label: string;
  value: string;
  stale?: boolean;
};

export type ObservatoryChapterContent = Partial<Record<ObservatoryChapterId, React.ReactNode>>;

type Props = {
  /** Public views never receive or render owner data/controls; private views may. */
  mode: "public" | "private";
  /** Route this shell is mounted at, e.g. "/share" or "/" — drives chapter link hrefs. */
  basePath: string;
  activeChapterId: ObservatoryChapterId;
  /** Route-relevant query state (e.g. mode, no3d) preserved on every chapter link. */
  preservedQuery?: Record<string, string>;
  /** Product/route name for the route's one h1 (accessibility contract). */
  title: string;
  freshness: ObservatoryFreshness | null;
  /** Only rendered when mode === "private", regardless of whether it's passed. */
  ownerSlot?: React.ReactNode;
  /** Per-chapter body content; §1 ships the shell only, so callers may pass placeholders. */
  chapterContent: ObservatoryChapterContent;
  /** Testing/evidence hook: forces the static concentric fallback regardless of viewport/motion. */
  forceNo3d?: boolean;
};

/**
 * Phase 10 production Observatory shell: five-chapter navigation (URL
 * state via `?chapter=`), focus restoration, a freshness slot, and a
 * complete 2D/no-3D fallback — see docs/phase10-spike-section-1/DECISION.md
 * for why this uses CSS 3D rather than React Three Fiber. This is the
 * shell only: chapter content is supplied by the caller (§2/§3 wire real
 * `/share` and `/` content into it). The shell itself holds no portfolio
 * data.
 */
export function ObservatoryShell({
  mode,
  basePath,
  activeChapterId,
  preservedQuery,
  title,
  freshness,
  ownerSlot,
  chapterContent,
  forceNo3d = false,
}: Props) {
  const active = OBSERVATORY_CHAPTERS.find((c) => c.id === activeChapterId) ?? OBSERVATORY_CHAPTERS[0];
  const headingId = "observatory-chapter-heading";
  const content = chapterContent[active.id] ?? (
    <p className={styles.plateBody}>This chapter&apos;s content ships in a later Phase 10 section.</p>
  );

  return (
    <div className={styles.shell} data-mode={mode} data-force-no-3d={forceNo3d ? "true" : "false"}>
      <h1 className={styles.h1}>{title}</h1>

      <div className={styles.metaRow}>
        {freshness && (
          <p className={freshness.stale ? `${styles.freshness} ${styles.freshnessStale}` : styles.freshness}>
            <span className={styles.freshnessLabel}>{freshness.label}</span>
            <span>{freshness.value}</span>
          </p>
        )}
        {mode === "public" && <span className={styles.readOnlyBadge}>Read-only</span>}
      </div>

      <ChapterOrbit
        basePath={basePath}
        chapters={OBSERVATORY_CHAPTERS}
        activeChapterId={active.id}
        preservedQuery={preservedQuery}
      />

      <div className={styles.plateWrap}>
        <div className={styles.plateEdge} aria-hidden="true" />
        <div className={styles.plateEdge} aria-hidden="true" />
        <article className={styles.plate} aria-labelledby={headingId}>
          <h2 id={headingId} tabIndex={-1} className={styles.plateHeading}>
            {active.number} — {active.label}
          </h2>
          <div className={styles.plateBody}>{content}</div>
        </article>
      </div>

      {mode === "private" && ownerSlot ? <div className={styles.ownerSlot}>{ownerSlot}</div> : null}

      <ChapterFocusManager activeChapterId={active.id} headingId={headingId} />
    </div>
  );
}
