"use client";

import { useEffect, useRef } from "react";
import styles from "./orrery.module.css";

const ENCODINGS = [
  ["Planet size", "Portfolio weight"],
  ["Orbit radius", "Weight rank; heaviest is innermost"],
  ["Orbit direction", "Trailing-week sign"],
  ["Orbit speed", "Trailing-week magnitude"],
  ["Axial spin", "Today’s price-move magnitude"],
  ["Trail taper", "Direction in a still frame"],
  ["Trail length", "Trailing-week magnitude"],
  ["Trail color", "Green gain, red loss, amber neutral"],
  ["Sun weather", "TWR-consistent portfolio health"],
  ["Sunspots", "Distance below all-time high"],
  ["Asteroid belt", "Holdings ranked ninth and beyond"],
] as const;

export function SystemsManual({
  open,
  onOpen,
  onClose,
  disabled = false,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  disabled?: boolean;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (event.key === "?" && !typing && !disabled && !open) {
        event.preventDefault();
        onOpen();
      } else if (event.key === "Escape" && open) {
        event.preventDefault();
        onClose();
        requestAnimationFrame(() => buttonRef.current?.focus());
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [disabled, onClose, onOpen, open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.manualButton}
        aria-label="Open systems manual"
        aria-expanded={open}
        onClick={onOpen}
      >
        ? <span>SYSTEMS MANUAL</span>
      </button>
      {open ? (
        <div
          className={styles.manualBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
              requestAnimationFrame(() => buttonRef.current?.focus());
            }
          }}
        >
          <section
            className={styles.manualPanel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="systems-manual-title"
          >
            <p className={styles.inspectorKicker}>Instrument reference / 01</p>
            <h2 id="systems-manual-title">Systems manual</h2>
            <dl>
              {ENCODINGS.map(([term, meaning]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{meaning}</dd>
                </div>
              ))}
            </dl>
            <button type="button" onClick={onClose} className={styles.hudButton}>
              Close manual
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}
