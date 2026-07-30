"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./orrery.module.css";

export const UNIVERSE_LEGEND_STORAGE_KEY = "stock-market-universe-legend-seen";
export const UNIVERSE_LEGEND_EVENT = "stock-market-universe:legend";

const LEGEND_TEXT =
  "SUN = WHOLE PORTFOLIO · PLANET = ONE HOLDING · CLICK EITHER TO OPEN";

export function Legend({ disabled = false }: { disabled?: boolean }) {
  const [visible, setVisible] = useState(false);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(UNIVERSE_LEGEND_STORAGE_KEY, "true");
    } catch {
      // Storage denial never blocks dismissal.
    }
    setVisible(false);
  }, []);

  useEffect(() => {
    if (disabled) return;
    try {
      if (window.localStorage.getItem(UNIVERSE_LEGEND_STORAGE_KEY)) return;
    } catch {
      // A blocked storage API shows the legend once this render.
    }
    setVisible(true);
  }, [disabled]);

  useEffect(() => {
    const summon = () => setVisible(true);
    window.addEventListener(UNIVERSE_LEGEND_EVENT, summon);
    return () => window.removeEventListener(UNIVERSE_LEGEND_EVENT, summon);
  }, []);

  useEffect(() => {
    if (!visible) return;
    window.addEventListener("pointerdown", dismiss, { once: true });
    window.addEventListener("keydown", dismiss, { once: true });
    return () => {
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("keydown", dismiss);
    };
  }, [visible, dismiss]);

  return visible ? (
    <p className={styles.orientationLine} role="status">
      {LEGEND_TEXT}
    </p>
  ) : null;
}
