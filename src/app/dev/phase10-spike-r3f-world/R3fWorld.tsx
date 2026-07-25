"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { OBSERVATORY_CHAPTERS, type ObservatoryChapterId } from "@/lib/observatory/chapters";
import { R3fSceneLoader } from "./R3fSceneLoader";
import worldStyles from "../phase10-spike-css-world/world.module.css";
import styles from "./r3f-world.module.css";

export function r3fChapterHref(chapterId: ObservatoryChapterId, forceWebglFailure = false) {
  return `/dev/phase10-spike-r3f-world?chapter=${chapterId}${
    forceWebglFailure ? "&forceFail=1" : ""
  }`;
}

export function R3fWorld({
  activeChapterId,
  forceWebglFailure = false,
}: {
  activeChapterId: ObservatoryChapterId;
  forceWebglFailure?: boolean;
}) {
  const router = useRouter();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousChapterRef = useRef(activeChapterId);
  const worldRef = useRef<HTMLElement>(null);
  const [hoveredChapterId, setHoveredChapterId] = useState<ObservatoryChapterId | null>(null);
  const active =
    OBSERVATORY_CHAPTERS.find((chapter) => chapter.id === activeChapterId) ??
    OBSERVATORY_CHAPTERS[0];

  const navigateToChapter = useCallback(
    (chapterId: ObservatoryChapterId) => {
      router.push(r3fChapterHref(chapterId, forceWebglFailure));
    },
    [forceWebglFailure, router],
  );

  useEffect(() => {
    if (previousChapterRef.current !== activeChapterId) {
      headingRef.current?.focus({ preventScroll: true });
      previousChapterRef.current = activeChapterId;
    }
  }, [activeChapterId]);

  useEffect(() => {
    const world = worldRef.current;
    if (!world || typeof window.matchMedia !== "function") return;
    const finePointer = window.matchMedia("(pointer: fine)");
    const desktop = window.matchMedia("(min-width: 1024px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || !desktop.matches || reducedMotion.matches || forceWebglFailure) {
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      world.style.setProperty("--world-pointer-x", x.toFixed(4));
      world.style.setProperty("--world-pointer-y", y.toFixed(4));
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [forceWebglFailure]);

  return (
    <main
      ref={worldRef}
      className={`${worldStyles.world} ${styles.world}`}
      data-active-chapter={active.id}
      data-force-no-3d={forceWebglFailure ? "true" : "false"}
      data-testid="r3f-world"
    >
      <div className={worldStyles.atmosphere} aria-hidden="true">
        <span className={worldStyles.horizon} />
        <span className={worldStyles.nearField} />
        <span className={worldStyles.farField} />
      </div>

      <header className={worldStyles.header}>
        <p className={worldStyles.eyebrow}>Spatial runtime study / bounded R3F</p>
        <h1>Enter the Portfolio Observatory</h1>
        <p>Five questions share one navigable field. Synthetic evidence only.</p>
      </header>

      <section className={`${worldStyles.stage} ${styles.stage}`} aria-label="Spatial chapter field">
        <div className={styles.canvasStage} aria-hidden="true">
          <R3fSceneLoader
            activeChapterId={active.id}
            hoveredChapterId={hoveredChapterId}
            forceWebglFailure={forceWebglFailure}
            onHoverChapter={setHoveredChapterId}
            onNavigateChapter={navigateToChapter}
          />
        </div>

        <div className={`${worldStyles.camera} ${styles.semanticCamera}`}>
          <nav className={worldStyles.orbit} aria-label="Observatory chapters">
            {OBSERVATORY_CHAPTERS.map((chapter) => (
              <a
                key={chapter.id}
                href={r3fChapterHref(chapter.id, forceWebglFailure)}
                className={worldStyles.body}
                data-index={chapter.index}
                data-mesh-hovered={hoveredChapterId === chapter.id ? "true" : "false"}
                aria-current={chapter.id === active.id ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  navigateToChapter(chapter.id);
                }}
                onMouseEnter={() => setHoveredChapterId(chapter.id)}
                onMouseLeave={() => setHoveredChapterId(null)}
                onFocus={() => setHoveredChapterId(chapter.id)}
                onBlur={() => setHoveredChapterId(null)}
              >
                <span className={worldStyles.bodyNumber} aria-hidden="true">
                  {chapter.number}
                </span>
                <span className={worldStyles.bodyLabel}>{chapter.label}</span>
                <span className={worldStyles.discovery} aria-hidden="true">
                  {chapter.question}
                </span>
              </a>
            ))}
          </nav>
        </div>

        <article className={`${worldStyles.plate} ${styles.plate}`} aria-labelledby="r3f-world-heading">
          <p className={worldStyles.plateIndex}>{active.number} / selected observation</p>
          <h2 ref={headingRef} id="r3f-world-heading" tabIndex={-1}>
            {active.label}
          </h2>
          <p className={worldStyles.question}>{active.question}</p>
          <p className={worldStyles.finding}>
            Synthetic finding: the semantic plate stays readable while the spatial field carries
            the arrival and chapter-travel story.
          </p>
          <p className={worldStyles.freshness}>Synthetic evidence · no network data · owner-gated</p>
        </article>
      </section>

      <div className={`${worldStyles.entrance} ${styles.entrance}`} aria-hidden="true">
        <span />
      </div>
    </main>
  );
}
