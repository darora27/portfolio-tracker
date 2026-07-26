"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";
import styles from "./observatory-entrance.module.css";

export const OBSERVATORY_ENTRANCE_DURATION_MS = 1800;

export function ObservatoryEntrance({
  mode,
  children,
  disabled = false,
}: {
  mode: "public" | "private";
  children: ReactNode;
  disabled?: boolean;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);
  const endingRef = useRef(false);
  const storageKey = `observatory-entrance-seen-${mode}`;

  const endEntrance = useCallback(() => {
    if (endingRef.current) return;
    endingRef.current = true;
    try {
      window.sessionStorage.setItem(storageKey, "true");
    } catch {
      // Storage denial must never hold the content behind the visual arrival.
    }
    setVisible(false);
    window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>("[data-portfolio-sun]")
        ?.focus({ preventScroll: true });
    });
  }, [storageKey]);

  useEffect(() => {
    if (disabled || reducedMotion) {
      setVisible(false);
      return;
    }
    if (
      typeof window.matchMedia !== "function" ||
      !window.matchMedia("(min-width: 1024px)").matches
    ) {
      setVisible(false);
      return;
    }
    try {
      if (window.sessionStorage.getItem(storageKey)) return;
    } catch {
      // A blocked storage API does not block the one-time visual treatment.
    }
    endingRef.current = false;
    setVisible(true);
  }, [disabled, reducedMotion, storageKey]);

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(endEntrance, OBSERVATORY_ENTRANCE_DURATION_MS);
    const endOnPointer = () => endEntrance();
    const endOnKey = () => endEntrance();
    window.addEventListener("pointerdown", endOnPointer, { once: true });
    window.addEventListener("keydown", endOnKey, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", endOnPointer);
      window.removeEventListener("keydown", endOnKey);
    };
  }, [endEntrance, visible]);

  return (
    <>
      {children}
      {visible ? (
        <div className={styles.entranceRoot}>
          <div className={styles.arrival} aria-hidden="true">
            <span className={styles.reticle} />
            <span className={styles.horizon} />
            <span className={styles.signal}>ACQUIRING PORTFOLIO SYSTEM</span>
          </div>
          <button className={styles.skip} type="button" onClick={endEntrance}>
            Skip intro
          </button>
        </div>
      ) : null}
    </>
  );
}
