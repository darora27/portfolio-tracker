"use client";

import { useEffect, useRef } from "react";
import { PLANET_IDENTITIES } from "@/lib/observatory/planet-identity";
import styles from "./orrery.module.css";

const ENCODINGS = [
  ["Planet size", "Portfolio weight"],
  ["Orbit radius", "Weight rank; heaviest is innermost"],
  ["Orbit direction", "Trailing-week sign"],
  ["Orbit speed", "Trailing-week magnitude"],
  ["Trail taper", "Direction in a still frame"],
  ["Trail length", "Trailing-week magnitude"],
  ["Trail lightness", "Trailing-week magnitude within gain or loss hue"],
  ["Trail color", "Green gain, red loss, amber near-flat or unavailable"],
  ["Trail head", "Fixed white-hot calibration reference"],
  ["Ring falloff", "Nearest arc 50%; far arc 10%; decorative visibility only"],
  ["Radar rings", "Trailing-week magnitude within gain or loss hue"],
  ["Radar blips", "Portfolio weight"],
  ["Radar sweep", "One revolution per 60-second live-quote refresh"],
  ["Aurora band", "Absolute weekly portfolio-index return series; percent only"],
  ["Sun weather", "TWR-consistent portfolio health"],
  ["Sunspots", "Distance below all-time high"],
  ["Asteroid belt", "Holdings ranked ninth and beyond"],
  ["Moon size", "Trailing-seven-day headline volume bucket"],
  ["Moon ring", "Earnings scheduled within seven days"],
  ["DRIFT", "Same-period TWR excess return versus VOO"],
  ["HAZARD blink", "Annualized volatility bucket"],
  ["SUPPLY", "Next held-ticker earnings countdown"],
  ["Nebula hue", "Portfolio health scalar sign"],
  ["Trade comet", "Trade action and realized-gain sign only"],
  ["% of book", "Trade total divided by post-trade portfolio cost basis"],
  ["Vs. portfolio", "Holding trailing week minus portfolio trailing week"],
  ["Unavailable", "Missing source history or unmatched same-period data"],
  ["Observed core", "Weight-only system; no trade history and no TWR"],
  ["Rocket cursor", "Decorative prism length follows pointer speed; no data"],
  ["Weather wisps", "Polar magenta means positive health; indigo means negative"],
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
            <dl>
              {PLANET_IDENTITIES.map((identity) => (
                <div key={identity.ticker}>
                  <dt>{identity.ticker}</dt>
                  <dd>{identity.macroFeature} · {identity.emissiveSignature}</dd>
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
