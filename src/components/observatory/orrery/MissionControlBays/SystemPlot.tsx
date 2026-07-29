"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
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
          const signal = radarRingColor(holding.weeklyReturn);
          const blipDiameter = radarBlipDiameterPx(holding.weight);
          return (
            <div key={holding.ticker}>
              <button
                type="button"
                className={styles.radarRingTarget}
                data-radar-ticker={holding.ticker}
                data-radar-ellipse="true"
                data-active={selected}
                style={{
                  width: `${ringSize}%`,
                  height: `${ringSize}%`,
                  "--radar-signal": signal,
                } as React.CSSProperties}
                aria-label={`${holding.ticker} radar ring, ${(holding.weight * 100).toFixed(1)} percent weight`}
                onClick={() => onSelectTicker(holding.ticker)}
                onDoubleClick={() => onOpenTicker(holding.ticker)}
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
