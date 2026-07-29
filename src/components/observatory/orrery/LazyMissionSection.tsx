"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import styles from "./orrery.module.css";

export function LazyMissionSection({
  id,
  title,
  className,
  minHeight,
  children,
}: {
  id: string;
  title: string;
  className?: string;
  minHeight: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      const idle = window.requestIdleCallback?.(() => setMounted(true), { timeout: 1000 });
      const timeout = idle === undefined
        ? window.setTimeout(() => setMounted(true), 350)
        : undefined;
      return () => {
        if (idle !== undefined) window.cancelIdleCallback?.(idle);
        if (timeout !== undefined) window.clearTimeout(timeout);
      };
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setMounted(true);
        observer.disconnect();
      },
      { rootMargin: "480px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [mounted]);

  return (
    <section
      ref={ref}
      id={id}
      className={`${styles.missionDescentSection} ${className ?? ""}`}
      style={{ minHeight }}
      data-lazy-mounted={mounted ? "true" : "false"}
      aria-labelledby={`${id}-title`}
    >
      <header className={styles.missionSectionHeading}>
        <h3 id={`${id}-title`}>{title}</h3>
      </header>
      {mounted ? children : <div className={styles.missionSectionStandby}>INSTRUMENT STANDBY</div>}
    </section>
  );
}
