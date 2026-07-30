"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { SIMULATIONS_BANNER } from "@/lib/compare-copy";
import {
  adjustDraftWeight,
  decodeDraftUnits,
  draftUnitsFromWeights,
  draftWeightPercent,
  encodeDraftUnits,
  setDraftWeightProRata,
  setDraftWeightSiphon,
} from "@/lib/observatory/draft-ledger";
import {
  draftConcentration,
  draftTurnover,
  mixHeldReturn,
} from "@/lib/observatory/draft-return";
import type { PublicOrreryHolding } from "@/lib/observatory/orrery";
import { planetIdentityForTicker } from "@/lib/observatory/planet-identity";
import { rampForReturn } from "@/lib/observatory/universe-palette";
import { concentrationStatus } from "@/lib/portfolio/concentration-status";
import styles from "./orrery.module.css";

type DragState = {
  index: number;
  startUnits: readonly number[];
  currentUnits: readonly number[];
  startUrl: string;
  startDistance: number;
  counterparty: number | null;
};

function signed(value: number): string {
  const arrow = value > 0 ? "▲" : value < 0 ? "▼" : "◆";
  return `${arrow} ${Math.abs(value * 100).toFixed(1)}%`;
}

function distanceFromDish(event: { clientX: number; clientY: number }, dish: HTMLElement | null): number {
  const rect = dish?.getBoundingClientRect();
  if (!rect) return 0;
  return Math.hypot(
    event.clientX - (rect.left + rect.width / 2),
    event.clientY - (rect.top + rect.height / 2),
  );
}

function urlWithDraft(units: readonly number[]): string {
  const url = new URL(window.location.href);
  url.searchParams.set("draft", encodeDraftUnits(units));
  url.searchParams.set("focus", "portfolio");
  url.searchParams.set("camera", "command");
  return url.toString();
}

export function DraftRig({
  holdings,
  encodedDraft,
  onClose,
}: {
  holdings: readonly PublicOrreryHolding[];
  encodedDraft: string | null;
  onClose: () => void;
}) {
  const roster = holdings.slice(0, 8);
  const realUnits = useMemo(
    () => draftUnitsFromWeights(roster.map(({ weight }) => weight)),
    [roster],
  );
  const [units, setUnits] = useState(
    () => decodeDraftUnits(encodedDraft) ?? realUnits,
  );
  const [ghost, setGhost] = useState(true);
  const [motion, setMotion] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [counterparty, setCounterparty] = useState<number | null>(null);
  const [resetArmed, setResetArmed] = useState(false);
  const [announcement, setAnnouncement] = useState("Draft opened as your book.");
  const [copyState, setCopyState] = useState("COPY TEST LINK");
  const dishRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const resetTimerRef = useRef<number | null>(null);

  const holdingReturns = roster.map(({ weeklyReturn }) => weeklyReturn ?? 0);
  const realWeek = mixHeldReturn(realUnits, holdingReturns);
  const draftWeek = mixHeldReturn(units, holdingReturns);
  const concentration = draftConcentration(units);
  const concentrationLabel = concentrationStatus(concentration.hhi).label.toUpperCase();
  const turnover = draftTurnover(units, realUnits);

  const announce = useCallback((next: readonly number[], index?: number) => {
    if (index === undefined) return;
    setAnnouncement(
      `${roster[index]?.ticker ?? "Holding"} ${draftWeightPercent(next[index]).toFixed(1)}%. Others adjusted.`,
    );
  }, [roster]);

  const replaceUrl = useCallback((next: readonly number[]) => {
    window.history.replaceState({ draft: encodeDraftUnits(next) }, "", urlWithDraft(next));
  }, []);

  const commit = useCallback((
    next: readonly number[],
    options?: { priorUrl?: string; index?: number },
  ) => {
    if (options?.priorUrl) {
      window.history.replaceState({}, "", options.priorUrl);
    }
    window.history.pushState({ draft: encodeDraftUnits(next) }, "", urlWithDraft(next));
    setUnits([...next]);
    announce(next, options?.index);
  }, [announce]);

  useEffect(() => {
    // FB-12 (§12a): motion defaults OFF for everyone -- the media query may
    // only ever force (and lock) it off when it matches; it must never be
    // the thing that turns motion ON for a visitor with no OS preference.
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReducedMotion(media.matches);
      if (media.matches) setMotion(false);
    };
    sync();
    media.addEventListener?.("change", sync);
    return () => media.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem("draft-coach-seen")) return;
    setShowCoach(true);
    window.sessionStorage.setItem("draft-coach-seen", "1");
  }, []);

  useEffect(() => {
    const decoded = decodeDraftUnits(new URL(window.location.href).searchParams.get("draft"));
    if (decoded) setUnits(decoded);
    else replaceUrl(units);
    const onPopState = () => {
      const restored = decodeDraftUnits(new URL(window.location.href).searchParams.get("draft"));
      if (restored) {
        setUnits(restored);
        setAnnouncement("Draft restored from browser history.");
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
    // Mount establishes URL state exactly once; subsequent edits own history.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const changeWeight = useCallback((
    index: number,
    requestedUnits: number,
    siphon = counterparty,
  ) => {
    const next = siphon !== null && siphon !== index
      ? setDraftWeightSiphon(units, index, requestedUnits, siphon)
      : setDraftWeightProRata(units, index, requestedUnits);
    commit(next, { index });
  }, [commit, counterparty, units]);

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>, index: number) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      index,
      startUnits: units,
      currentUnits: units,
      startUrl: window.location.href,
      startDistance: distanceFromDish(event, dishRef.current),
      counterparty: null,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const target = Array.from(
      document.querySelectorAll<HTMLElement>("[data-draft-index]"),
    ).find((candidate) => {
      if (candidate.dataset.draftIndex === String(drag.index)) return false;
      const rect = candidate.getBoundingClientRect();
      return (
        event.clientX >= rect.left
        && event.clientX <= rect.right
        && event.clientY >= rect.top
        && event.clientY <= rect.bottom
      );
    });
    const hovered = Number(target?.dataset.draftIndex);
    const siphon = Number.isInteger(hovered) && hovered !== drag.index ? hovered : null;
    const delta = Math.round(
      (distanceFromDish(event, dishRef.current) - drag.startDistance) / 4,
    );
    const requested = drag.startUnits[drag.index] + delta;
    const next = siphon === null
      ? setDraftWeightProRata(drag.startUnits, drag.index, requested)
      : setDraftWeightSiphon(drag.startUnits, drag.index, requested, siphon);
    dragRef.current = { ...drag, currentUnits: next, counterparty: siphon };
    setCounterparty(siphon);
    setUnits(next);
    replaceUrl(next);
    announce(next, drag.index);
  };

  const onPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
    setCounterparty(null);
    commit(drag.currentUnits, { priorUrl: drag.startUrl, index: drag.index });
  };

  const onHoldingKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "Enter") {
      event.preventDefault();
      document.getElementById(`draft-weight-${roster[index].ticker}`)?.focus();
      setAnnouncement(`${roster[index].ticker} weight input opened.`);
      return;
    }
    if (event.key === " ") {
      event.preventDefault();
      setCounterparty((current) => current === index ? null : index);
      setAnnouncement(`${roster[index].ticker} ${counterparty === index ? "released" : "latched"} as counterparty.`);
      return;
    }
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const magnitude = event.shiftKey ? 10 : 1;
    const delta = event.key === "ArrowRight" ? magnitude : -magnitude;
    const next = adjustDraftWeight(units, index, delta, counterparty);
    commit(next, { index });
  };

  const armReset = () => {
    if (resetArmed) {
      if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
      setResetArmed(false);
      commit(realUnits);
      setAnnouncement("Draft reset to your book.");
      return;
    }
    setResetArmed(true);
    resetTimerRef.current = window.setTimeout(() => setResetArmed(false), 3000);
  };

  const copyLink = async () => {
    const link = urlWithDraft(units);
    try {
      await navigator.clipboard.writeText(link);
      setCopyState("LINK COPIED");
    } catch {
      setCopyState("COPY BLOCKED");
    }
    window.setTimeout(() => setCopyState("COPY TEST LINK"), 1800);
  };

  return (
    <div className={styles.draftBackdrop} role="presentation">
      <section
        className={styles.draftRig}
        role="dialog"
        aria-modal="true"
        aria-labelledby="draft-rig-title"
        data-reduced-motion={reducedMotion ? "true" : "false"}
      >
        <header className={styles.draftLid}>
          <span>SOL-DEVAN · TEST RIG Nº 1 · CARRIED EQUIPMENT</span>
          <h2 id="draft-rig-title">DRAFT</h2>
          <button type="button" onClick={onClose} aria-label="Close DRAFT rig">LID LATCH ×</button>
        </header>

        <p className={styles.simulationTape}>{SIMULATIONS_BANNER}</p>

        <div className={styles.draftWorkbench}>
          <div className={styles.draftDishColumn}>
            <div className={styles.draftSwitches}>
              <button type="button" role="switch" aria-checked={ghost} onClick={() => setGhost((current) => !current)}>
                GHOST {ghost ? "ON" : "OFF"}
              </button>
              <button
                type="button"
                role="switch"
                aria-checked={motion}
                disabled={reducedMotion}
                onClick={() => {
                  if (reducedMotion) return;
                  setMotion((current) => !current);
                }}
              >
                MOTION {motion ? "ON" : "OFF"}
              </button>
            </div>
            <div ref={dishRef} className={styles.draftDish} data-motion={motion && !reducedMotion ? "true" : "false"}>
              <div className={styles.draftCrosshair} aria-hidden="true" />
              <div className={styles.draftOrbitTrack} aria-hidden="true" />
              {roster.map((holding, index) => {
                const identity = planetIdentityForTicker(holding.ticker);
                const diameter = 14 + 110 * Math.sqrt(units[index] / 200);
                const realDiameter = 14 + 110 * Math.sqrt(realUnits[index] / 200);
                const angle = (index / roster.length) * 360;
                // FB-12 (§12a): 9-28s -> 30-90s, matching scene orbits
                // measured in minutes rather than seconds. Same formula
                // family, constants rescaled by the same factor (60/18):
                // the floor/ceiling/range triple (9/28/18 -> 30/90/60) and
                // the |weeklyReturn| saturation point (still 10%, since
                // 180 * (60/18) = 600) are both preserved, so bigger weekly
                // moves still lap proportionally faster.
                const speed = Math.max(30, 90 - Math.min(60, Math.abs(holding.weeklyReturn ?? 0) * 600));
                const zero = units[index] === 0;
                return (
                  <div
                    key={holding.ticker}
                    className={styles.draftRunner}
                    data-zero={zero ? "true" : "false"}
                    data-direction={(holding.weeklyReturn ?? 0) < 0 ? "reverse" : "forward"}
                    style={{
                      "--draft-angle": `${angle}deg`,
                      "--draft-pit-x": `${10 + index * 11}%`,
                      "--draft-speed": `${speed}s`,
                    } as CSSProperties}
                  >
                    <i
                      className={styles.draftDirection}
                      data-draft-direction="true"
                      aria-hidden="true"
                    >
                      {(holding.weeklyReturn ?? 0) < 0 ? "‹" : "›"}
                    </i>
                    {ghost ? (
                      <i
                        className={styles.draftGhost}
                        data-draft-ghost="true"
                        aria-hidden="true"
                        style={{ width: realDiameter, height: realDiameter }}
                      />
                    ) : null}
                    <button
                      type="button"
                      className={styles.draftBody}
                      data-draft-index={index}
                      data-counterparty={counterparty === index ? "true" : undefined}
                      aria-label={`${holding.ticker}, ${draftWeightPercent(units[index]).toFixed(1)} percent. Arrow keys adjust; Shift changes five percent; Space latches counterparty.`}
                      style={{
                        width: diameter,
                        height: diameter,
                        background: identity.brandHex,
                        color: identity.labelHex,
                        borderColor: counterparty === index
                          ? "var(--universe-glass-scope-hero)"
                          : identity.labelHex,
                        "--draft-trail": rampForReturn(holding.weeklyReturn),
                      } as CSSProperties}
                      onPointerDown={(event) => onPointerDown(event, index)}
                      onPointerMove={onPointerMove}
                      onPointerUp={onPointerUp}
                      onPointerCancel={onPointerUp}
                      onKeyDown={(event) => onHoldingKey(event, index)}
                    >
                      <i aria-hidden="true" />
                      {diameter >= 34 ? <span>{holding.ticker}</span> : null}
                    </button>
                    {diameter < 34 || zero ? <b>{holding.ticker}</b> : null}
                  </div>
                );
              })}
              {counterparty !== null && dragRef.current ? (
                <p className={styles.siphonReadout}>
                  FUEL LINE ▸ {Math.abs(
                    units[dragRef.current.index] -
                    dragRef.current.startUnits[dragRef.current.index],
                  ) / 2}
                </p>
              ) : null}
              {showCoach ? (
                <p className={styles.draftCoach}>
                  PULL A CIRCLE — THE OTHERS BREATHE. DRAG INTO ANOTHER TO SIPHON.
                </p>
              ) : null}
              <p className={styles.draftTruth}>THE COMPANIES STAY REAL; ONLY YOUR OWNERSHIP IS MAKE-BELIEVE.</p>
            </div>
            <div className={styles.pitRail} aria-label="Pit rail for zero-weight holdings">
              <span>PIT RAIL</span>
              {roster.map((holding, index) => units[index] === 0
                ? <b key={holding.ticker}>{holding.ticker}</b>
                : null)}
            </div>
          </div>

          <aside className={styles.draftReadouts}>
            <section>
              <span>THE WEEK · DRAFT</span>
              <strong>DRAFT MIX {signed(draftWeek)}</strong>
              <p>YOUR MIX {signed(realWeek)} · EDGE {(draftWeek - realWeek) >= 0 ? "+" : "−"}{Math.abs((draftWeek - realWeek) * 100).toFixed(1)}</p>
            </section>
            <section>
              <span>CONCENTRATION · DRAFT</span>
              <strong>TOP-2 {concentration.topTwoPct.toFixed(1)} · HHI {concentration.hhi.toLocaleString("en-US")}</strong>
              <p>{concentrationLabel}</p>
            </section>
            <section>
              <span>DRIFT · DRAFT</span>
              <strong>MOVED {turnover.toFixed(1)} OF 100</strong>
            </section>
            <ol className={styles.tankRack} aria-label="Draft allocation rack">
              {roster.map((holding, index) => (
                <li key={holding.ticker}>
                  <label htmlFor={`draft-weight-${holding.ticker}`}>{holding.ticker}</label>
                  <input
                    id={`draft-weight-${holding.ticker}`}
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={draftWeightPercent(units[index])}
                    onChange={(event) => {
                      const requested = Math.round(Number(event.target.value) * 2);
                      if (Number.isFinite(requested)) changeWeight(index, requested);
                    }}
                  />
                  <i
                    data-real-notch="true"
                    style={{
                      "--draft-fill": `${draftWeightPercent(units[index])}%`,
                      "--real-notch": `${draftWeightPercent(realUnits[index])}%`,
                    } as CSSProperties}
                  />
                </li>
              ))}
            </ol>
          </aside>
        </div>

        <footer className={styles.draftFooter}>
          <button type="button" onClick={copyLink}>{copyState}</button>
          <button type="button" data-armed={resetArmed ? "true" : "false"} onClick={armReset}>
            {resetArmed ? "SURE? FLIP AGAIN" : "RESET TO BOOK"}
          </button>
          <span aria-live="polite">{announcement}</span>
        </footer>
      </section>
    </div>
  );
}
