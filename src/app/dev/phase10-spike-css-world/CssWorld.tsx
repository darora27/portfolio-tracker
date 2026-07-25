"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { OBSERVATORY_CHAPTERS, type ObservatoryChapterId } from "@/lib/observatory/chapters";
import styles from "./world.module.css";

export function CssWorld({
  activeChapterId,
  forceNo3d = false,
}: {
  activeChapterId: ObservatoryChapterId;
  forceNo3d?: boolean;
}) {
  const router = useRouter();
  const stageRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousChapterRef = useRef(activeChapterId);
  const active =
    OBSERVATORY_CHAPTERS.find((chapter) => chapter.id === activeChapterId) ??
    OBSERVATORY_CHAPTERS[0];

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || forceNo3d || typeof window.matchMedia !== "function") return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!desktop.matches || !finePointer.matches || reducedMotion.matches) return;

    const onPointerMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      stage.style.setProperty("--world-pointer-x", x.toFixed(3));
      stage.style.setProperty("--world-pointer-y", y.toFixed(3));
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [forceNo3d]);

  useEffect(() => {
    if (previousChapterRef.current !== activeChapterId) {
      headingRef.current?.focus({ preventScroll: true });
      previousChapterRef.current = activeChapterId;
    }
  }, [activeChapterId]);

  const suffix = forceNo3d ? "&no3d=1" : "";

  return (
    <main
      ref={stageRef}
      className={styles.world}
      data-active-chapter={active.id}
      data-force-no-3d={forceNo3d ? "true" : "false"}
      data-testid="css-world"
    >
      <div className={styles.atmosphere} aria-hidden="true">
        <span className={styles.horizon} />
        <span className={styles.nearField} />
        <span className={styles.farField} />
      </div>

      <header className={styles.header}>
        <p className={styles.eyebrow}>Spatial runtime study / CSS ceiling</p>
        <h1>Enter the Portfolio Observatory</h1>
        <p>Five questions share one navigable field. Synthetic evidence only.</p>
      </header>

      <section className={styles.stage} aria-label="Spatial chapter field">
        <div className={styles.camera} data-testid="css-camera">
          <nav className={styles.orbit} aria-label="Observatory chapters">
            {OBSERVATORY_CHAPTERS.map((chapter) => (
              <a
                key={chapter.id}
                href={`/dev/phase10-spike-css-world?chapter=${chapter.id}${suffix}`}
                className={styles.body}
                data-index={chapter.index}
                aria-current={chapter.id === active.id ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  router.push(`/dev/phase10-spike-css-world?chapter=${chapter.id}${suffix}`);
                }}
              >
                <span className={styles.bodyNumber} aria-hidden="true">
                  {chapter.number}
                </span>
                <span className={styles.bodyLabel}>{chapter.label}</span>
                <span className={styles.discovery} aria-hidden="true">
                  {chapter.question}
                </span>
              </a>
            ))}
          </nav>
        </div>

        <article className={styles.plate} aria-labelledby="css-world-heading">
          <p className={styles.plateIndex}>{active.number} / selected observation</p>
          <h2 ref={headingRef} id="css-world-heading" tabIndex={-1}>
            {active.label}
          </h2>
          <p className={styles.question}>{active.question}</p>
          <p className={styles.finding}>
            Synthetic finding: this plate holds the chapter&rsquo;s primary evidence while the
            field keeps every destination in view.
          </p>
          <p className={styles.freshness}>Synthetic evidence · no network data · owner-gated</p>
        </article>
      </section>

      <div className={styles.entrance} aria-hidden="true" data-testid="css-entrance">
        <span />
      </div>
    </main>
  );
}
