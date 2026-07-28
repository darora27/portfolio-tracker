"use client";

import { useEffect, useRef } from "react";
import type { PublicOrreryHolding } from "@/lib/observatory/orrery";
import styles from "../orrery.module.css";

export function SystemPlot({
  holdings,
  activeTicker,
  health,
}: {
  holdings: readonly PublicOrreryHolding[];
  activeTicker: string | null;
  health: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (
      !canvas ||
      !context ||
      typeof context.setTransform !== "function" ||
      typeof context.clearRect !== "function"
    ) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
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
      context.strokeStyle = health < 0 ? "rgba(231,112,67,.6)" : "rgba(228,178,78,.62)";
      context.fillStyle = "#e3b65c";
      context.lineWidth = 1;
      context.beginPath();
      context.arc(cx, cy, 7, 0, Math.PI * 2);
      context.fill();
      holdings.forEach((holding, index) => {
        const radius = maximum * ((index + 1) / Math.max(holdings.length, 1));
        context.beginPath();
        context.arc(cx, cy, radius, 0, Math.PI * 2);
        context.stroke();
        const angle = index * 0.89 + (reduced ? 0 : frame * (0.0012 + index * 0.0001));
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        const active = activeTicker === holding.ticker;
        context.fillStyle = active ? "#fff4d7" : "#cf7b46";
        context.beginPath();
        context.arc(x, y, active ? 6 : 3, 0, Math.PI * 2);
        context.fill();
      });
      frame += 1;
      if (!reduced) animation = window.requestAnimationFrame(draw);
    };
    draw();
    return () => window.cancelAnimationFrame(animation);
  }, [activeTicker, health, holdings]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.systemPlot}
      aria-hidden="true"
      data-health={health < 0 ? "negative" : "positive"}
    />
  );
}
