"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import styles from "./orrery.module.css";

export const UNIVERSE_ORIENTATION_STORAGE_KEY =
  "stock-market-universe-orientation-seen";
export const UNIVERSE_ORIENTATION_EVENT = "stock-market-universe:orientation";

const BEATS = [
  "This is a portfolio.",
  "Planets are its holdings — orbit is their week, spin is their day.",
  "Tap anything.",
] as const;

export function FirstVisitOrientation({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const [beat, setBeat] = useState<number | null>(null);

  const finish = useCallback(() => {
    try {
      window.localStorage.setItem(UNIVERSE_ORIENTATION_STORAGE_KEY, "true");
    } catch {
      // Storage denial never blocks the universe.
    }
    setBeat(null);
  }, []);

  useEffect(() => {
    if (
      disabled ||
      typeof window.matchMedia !== "function" ||
      !window.matchMedia("(min-width: 1024px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    try {
      if (window.localStorage.getItem(UNIVERSE_ORIENTATION_STORAGE_KEY)) return;
    } catch {
      // A blocked storage API allows the orientation once this render.
    }
    const frame = window.requestAnimationFrame(() => setBeat(0));
    return () => window.cancelAnimationFrame(frame);
  }, [disabled]);

  useEffect(() => {
    const summon = () => setBeat(0);
    window.addEventListener(UNIVERSE_ORIENTATION_EVENT, summon);
    return () => window.removeEventListener(UNIVERSE_ORIENTATION_EVENT, summon);
  }, []);

  useLayoutEffect(() => {
    if (beat === null) return;
    const timer = window.setTimeout(
      () => (beat === BEATS.length - 1 ? finish() : setBeat(beat + 1)),
      beat === 1 ? 3400 : 2200,
    );
    const skip = () => finish();
    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [beat, finish]);

  return beat === null ? null : (
    <div className={styles.orientation} role="status" aria-live="polite">
      <span>TRANSMISSION {beat + 1}/3</span>
      <p>{BEATS[beat]}</p>
      <button type="button" onClick={finish}>Skip orientation</button>
    </div>
  );
}
