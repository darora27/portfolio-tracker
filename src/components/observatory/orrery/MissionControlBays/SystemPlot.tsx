"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { LIVE_QUOTE_REFRESH_INTERVAL_MS } from "@/lib/observatory/data-refresh";
import type { PublicOrreryHolding } from "@/lib/observatory/orrery";
import {
  radarBlipDiameterPx,
  radarLabelPlacement,
  radarRingColor,
} from "@/lib/observatory/scene-model";
import { dimmed, identityColor } from "@/lib/observatory/identity-palette";
import {
  UNIVERSE_PALETTE,
} from "@/lib/observatory/universe-palette";
import styles from "../orrery.module.css";

// F2 (§15 review rounds 2-3): every ring's clickable box was a rectangle,
// but its visible stroke is an ellipse inscribed in that rectangle --
// touching the rectangle's edge only at the four cardinal points. Two JS
// heuristics (z-index-by-size stacking alone, then an ellipse-containment
// walk with a fixed-px margin) each closed some angles and left others
// failing: a fixed-px margin added to every ring's ellipse in absolute
// pixels is a much bigger fraction of a SMALL ring's radius than a LARGE
// one, letting a smaller ring's padded ellipse falsely claim a point still
// meant for its larger neighbor's true curve before any walk reaches it.
//
// The fix is geometric, not a JS heuristic: clip-path the ring button
// itself to the exact same ellipse its ::before border draws
// (`ellipse(50% 50% at 50% 50%)`), so the browser's native hit-test can only
// ever resolve a click to a ring whose own true visible disc contains it.
// Combined with the existing z-index-by-size stacking (smaller ring on
// top), the resolved target for any point is always the smallest ring
// whose real disc contains it -- exactly the ring the point visually sits
// on or inside, at every angle, with no magic-number margin to get wrong.
//
// clip-path also clips a clipped element's own descendants, including ones
// positioned outside its box (the ticker label sits past the ring's own
// right edge) -- so the label can no longer live inside the clipped button
// on desktop without disappearing. It moves to an unclipped sibling
// (.radarRingLabel) that mirrors the ring's own box exactly. The <1024px
// fallback is untouched: there the label stays a child of the button (its
// position/inset/transform are already reset to normal flow by the mobile
// override, and clip-path is explicitly turned off for that path), so its
// DOM/CSS is byte-identical to before this fix.

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
          /* R7-W4(a). Two encodings, two channels, deliberately split:
           * the RING says which holding this is (identity colour, dimmed so
           * it never outshouts the blip sitting on it), and the BLIP says how
           * that holding is doing (the gain/loss ramp). Before this the ring
           * carried the return too — and since every dayReturn resolved to a
           * flat 0.0%, every ring came out the same amber. W1 fixes the
           * zeros; this makes the rings tell them apart. */
          const signal = radarRingColor(holding.dayReturn);
          const identity = identityColor(holding.ticker);
          const blipDiameter = radarBlipDiameterPx(holding.weight);
          const ringStyle = {
            width: `${ringSize}%`,
            height: `${ringSize}%`,
            "--radar-signal": signal,
            "--radar-identity": identity,
            "--radar-identity-dim": dimmed(holding.ticker),
            "--radar-ring-z": holdings.length - index,
          } as React.CSSProperties;
          // Ring radius as a fraction of the plot's own box; the label
          // placement only needs the ratio, not the resolved pixel width.
          const label = radarLabelPlacement(index, (ringSize / 100) * 240);
          // ringSize grows monotonically with index, so every ring shares the same
          // center point and nests inside every larger one. clip-path restricts
          // each ring's own hit-test region to its true visible ellipse (not its
          // bounding rectangle -- see the module-level comment above), and
          // --radar-ring-z stacks smaller rings above larger ones, so the native
          // click target is always the smallest ring whose real disc contains the
          // point: exactly the ring visually under the pointer, at every angle.
          return (
            <div key={holding.ticker}>
              <button
                type="button"
                className={styles.radarRingTarget}
                data-radar-ticker={holding.ticker}
                data-radar-ellipse="true"
                data-active={selected}
                style={ringStyle}
                aria-label={`${holding.ticker} radar ring, ${(holding.weight * 100).toFixed(1)} percent weight`}
                onClick={() => onSelectTicker(holding.ticker)}
                onDoubleClick={() => onOpenTicker(holding.ticker)}
                onKeyDown={(event) => onKeyDown(event, holding.ticker)}
              >
                {visualEnabled ? null : <span>{holding.ticker}</span>}
              </button>
              {visualEnabled ? (
                <span
                  className={styles.radarRingLabel}
                  style={{
                    ...ringStyle,
                    "--label-dx": `${label.dx}px`,
                    "--label-dy": `${label.dy}px`,
                  } as React.CSSProperties}
                  data-pushed={label.leader ? "true" : "false"}
                  aria-hidden="true"
                >
                  <span>{holding.ticker}</span>
                </span>
              ) : null}
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
