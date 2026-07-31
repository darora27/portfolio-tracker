"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { LIVE_QUOTE_REFRESH_INTERVAL_MS } from "@/lib/observatory/data-refresh";
import type { PublicOrreryHolding } from "@/lib/observatory/orrery";
import {
  radarBlipDiameterPx,
  radarRingColor,
} from "@/lib/observatory/scene-model";
import {
  UNIVERSE_PALETTE,
} from "@/lib/observatory/universe-palette";
import styles from "../orrery.module.css";

// F2 (§15 review round 2): every ring's clickable box is a rectangle, but its
// visible stroke is an ellipse inscribed in that rectangle -- touching the
// rectangle's edge only at the four cardinal points. At a diagonal angle a
// smaller (higher z-index, per --radar-ring-z) neighbor's rectangle corner
// can still reach out far enough to cover a point that sits on a LARGER
// ring's own visible curve, so the native DOM hit-test resolves to the wrong
// ticker there. Rather than clip-path (which would also clip the ticker
// <span> label -- it renders outside its ring's own box, and clip-path
// clips overflowing descendants along with the element it's applied to),
// resolve the correct ring in JS: the ring whose native handler fired is
// always the smallest-index ring whose RECTANGLE contains the click (thanks
// to the existing z-index-by-size stacking), and since every ring's ellipse
// is a subset of its own rectangle, the true target ring's index can only be
// the same or larger. Walk upward from the ring that received the event
// until the first ring whose own ellipse actually contains the point.
//
// RING_HIT_MARGIN_PX pads that ellipse outward by a few CSS px: a 1px-wide
// stroke is not a realistic click target on its own (MouseEvent.clientX/Y
// are integer-rounded, so a point meant to land exactly on the boundary can
// round to just outside it), and this matches every other interactive
// element on this surface having real click tolerance. It stays far below
// the gap between adjacent rings (with 8 holdings at 1440px this measured
// ~72px; it shrinks toward 1/holdings.length of the plot radius as holdings
// grow, but stays well clear of a low-single-digit px margin for any
// realistic portfolio size), so it cannot resurrect the F1/F2 cross-ring
// ambiguity this whole mechanism exists to prevent.
const RING_HIT_MARGIN_PX = 6;

function pointInRingEllipse(rect: DOMRect, clientX: number, clientY: number) {
  const rx = rect.width / 2 + RING_HIT_MARGIN_PX;
  const ry = rect.height / 2 + RING_HIT_MARGIN_PX;
  if (rx <= 0 || ry <= 0) return false;
  const nx = (clientX - (rect.left + rect.width / 2)) / rx;
  const ny = (clientY - (rect.top + rect.height / 2)) / ry;
  return nx * nx + ny * ny <= 1;
}

export function SystemPlot({
  holdings,
  activeTicker,
  health,
  onSelectTicker,
  onOpenTicker,
  signalPair = null,
}: {
  holdings: readonly PublicOrreryHolding[];
  activeTicker: string | null;
  health: number;
  onSelectTicker: (ticker: string) => void;
  onOpenTicker: (ticker: string) => void;
  signalPair?: string | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const ringRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visualEnabled, setVisualEnabled] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisualEnabled(window.matchMedia("(min-width: 1024px)").matches);
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? false),
      { threshold: 0.01 },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visualEnabled || !visible) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (
      !canvas ||
      !context ||
      typeof context.setTransform !== "function" ||
      typeof context.clearRect !== "function"
    ) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(reduced);
    let animation = 0;
    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
        canvas.width = width * ratio;
        canvas.height = height * ratio;
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const maximum = Math.min(width, height) * 0.43;
      const pairTickers = signalPair?.split("-").slice(0, 2) ?? [];
      const pairPoints: Array<{ x: number; y: number }> = [];
      context.strokeStyle = health < 0 ? "rgba(231,112,67,.6)" : "rgba(228,178,78,.62)";
      context.fillStyle = UNIVERSE_PALETTE.signal.flat;
      context.lineWidth = 1;
      context.beginPath();
      context.arc(cx, cy, 7, 0, Math.PI * 2);
      context.fill();
      if (!reduced) {
        const sweep =
          ((performance.now() % LIVE_QUOTE_REFRESH_INTERVAL_MS) /
            LIVE_QUOTE_REFRESH_INTERVAL_MS) *
            Math.PI *
            2 -
          Math.PI / 2;
        const sweepX = cx + Math.cos(sweep) * maximum;
        const sweepY = cy + Math.sin(sweep) * maximum;
        context.strokeStyle = "rgba(244,240,223,.42)";
        context.beginPath();
        context.moveTo(cx, cy);
        context.lineTo(sweepX, sweepY);
        context.stroke();
      }
      holdings.forEach((holding, index) => {
        const radius = maximum * ((index + 1) / Math.max(holdings.length, 1));
        const angle = index * 0.89;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        if (pairTickers.includes(holding.ticker)) pairPoints.push({ x, y });
      });
      if (pairPoints.length === 2) {
        context.strokeStyle = UNIVERSE_PALETTE.glass.cyan;
        context.lineWidth = 2;
        context.setLineDash?.([4, 4]);
        context.beginPath();
        context.moveTo(pairPoints[0].x, pairPoints[0].y);
        context.lineTo(pairPoints[1].x, pairPoints[1].y);
        context.stroke();
        context.setLineDash?.([]);
      }
      if (!reduced) animation = window.requestAnimationFrame(draw);
    };
    draw();
    return () => window.cancelAnimationFrame(animation);
  }, [health, holdings, signalPair, visible, visualEnabled]);

  const onKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    ticker: string,
  ) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    onOpenTicker(ticker);
  };

  // Resolves a ring click to the ticker whose own visible ellipse actually
  // contains the point, starting from the ring index whose rectangle
  // native hit-testing picked (see pointInRingEllipse's comment above).
  const resolveRingTicker = (
    event: MouseEvent<HTMLButtonElement>,
    startIndex: number,
  ) => {
    for (let index = startIndex; index < holdings.length; index++) {
      const rect = ringRefs.current[index]?.getBoundingClientRect();
      if (rect && pointInRingEllipse(rect, event.clientX, event.clientY)) {
        return holdings[index].ticker;
      }
    }
    return holdings[startIndex].ticker;
  };

  return (
    <div
      ref={frameRef}
      className={styles.systemPlotFrame}
      data-refresh-interval-ms={LIVE_QUOTE_REFRESH_INTERVAL_MS}
      data-animation-state={visible ? "running" : "paused"}
    >
      {visualEnabled ? (
        <canvas
          ref={canvasRef}
          className={styles.systemPlot}
          aria-hidden="true"
          data-health={health < 0 ? "negative" : "positive"}
        />
      ) : null}
      <div className={styles.radarTargets} aria-label="Portfolio radar targets">
        {holdings.map((holding, index) => {
          const ringSize = ((index + 1) / Math.max(holdings.length, 1)) * 86;
          const angle = index * 0.89;
          const radial = ringSize / 2;
          const blipX = 50 + Math.cos(angle) * radial;
          const blipY = 50 + Math.sin(angle) * radial;
          const selected = activeTicker === holding.ticker;
          const signal = radarRingColor(holding.dayReturn);
          const blipDiameter = radarBlipDiameterPx(holding.weight);
          // ringSize grows monotonically with index, so every ring shares the same
          // center point and nests inside every larger one; --radar-ring-z stacks
          // smaller rings above larger ones so a click near a ring's own stroke
          // hits that ring's rectangle rather than whichever ring paints last in
          // DOM order. resolveRingTicker then narrows that rectangle-level pick
          // down to whichever ring's own ellipse the click point truly falls in
          // (see pointInRingEllipse's comment above SystemPlot).
          return (
            <div key={holding.ticker}>
              <button
                ref={(el) => {
                  ringRefs.current[index] = el;
                }}
                type="button"
                className={styles.radarRingTarget}
                data-radar-ticker={holding.ticker}
                data-radar-ellipse="true"
                data-active={selected}
                style={{
                  width: `${ringSize}%`,
                  height: `${ringSize}%`,
                  "--radar-signal": signal,
                  "--radar-ring-z": holdings.length - index,
                } as React.CSSProperties}
                aria-label={`${holding.ticker} radar ring, ${(holding.weight * 100).toFixed(1)} percent weight`}
                onClick={(event) => onSelectTicker(resolveRingTicker(event, index))}
                onDoubleClick={(event) => onOpenTicker(resolveRingTicker(event, index))}
                onKeyDown={(event) => onKeyDown(event, holding.ticker)}
              >
                <span>{holding.ticker}</span>
              </button>
              <button
                type="button"
                className={styles.radarBlipTarget}
                data-radar-ticker={holding.ticker}
                data-active={selected}
                style={{
                  left: `${blipX}%`,
                  top: `${blipY}%`,
                  width: `${blipDiameter}px`,
                  height: `${blipDiameter}px`,
                  "--radar-signal": signal,
                } as React.CSSProperties}
                aria-label={`${holding.ticker} radar blip`}
                onClick={() => onSelectTicker(holding.ticker)}
                onDoubleClick={() => onOpenTicker(holding.ticker)}
                onKeyDown={(event) => onKeyDown(event, holding.ticker)}
              />
            </div>
          );
        })}
      </div>
      {reducedMotion ? (
        <time className={styles.radarTimestamp} dateTime={new Date().toISOString()}>
          SWEEP HELD · 60S REFRESH
        </time>
      ) : null}
      {signalPair ? (
        <p className={styles.radarPairLine} data-signal-pair={signalPair}>
          {signalPair} PAIR LINE
        </p>
      ) : null}
    </div>
  );
}
