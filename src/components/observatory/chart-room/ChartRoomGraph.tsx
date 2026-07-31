"use client";

import { useMemo, useState } from "react";
import { sliceToRange, alignToDates, type ChartRoomRange } from "@/lib/portfolio/chart-room-window";
import styles from "./chart-room.module.css";

type Mode = "return" | "price";
type OverlayKey = "voo" | "book" | "depth" | "trades" | "cost";

const RANGE_LABELS: Record<ChartRoomRange, string> = {
  "7d": "7 DAYS",
  "30d": "30 DAYS",
  sinceBuy: "SINCE BUY",
  max: "MAX",
};

function signGlyph(value: number): string {
  return value > 0 ? "▲" : value < 0 ? "▼" : "◆";
}

function signedPercentLabel(value: number, digits = 1): string {
  return `${signGlyph(value)} ${Math.abs(value * 100).toFixed(digits)}%`;
}

function pathFor(values: number[], x: (i: number) => number, y: (v: number) => number): string {
  return values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
}

export function ChartRoomGraph({
  priceHistory,
  vooCloseHistory,
  bookGrowthIndex,
  trades,
  costPerShare,
  firstTradeDate,
}: {
  priceHistory: { date: string; price: number }[];
  vooCloseHistory: { date: string; price: number }[];
  bookGrowthIndex: { date: string; index: number }[];
  trades: { date: string; action: string; shares: number; price: number }[];
  costPerShare: number;
  firstTradeDate: string | null;
}) {
  const [range, setRange] = useState<ChartRoomRange>("30d");
  const [mode, setMode] = useState<Mode>("return");
  const [overlays, setOverlays] = useState<Record<OverlayKey, boolean>>({
    voo: true,
    book: false,
    depth: false,
    trades: false,
    cost: false,
  });

  const toggleOverlay = (key: OverlayKey) => setOverlays((prev) => ({ ...prev, [key]: !prev[key] }));

  const sliced = useMemo(
    () => sliceToRange(priceHistory, range, firstTradeDate),
    [priceHistory, range, firstTradeDate],
  );

  const isReturn = mode === "return";
  const dates = sliced.map((p) => p.date);
  const series = isReturn
    ? sliced.map((p) => (100 * p.price) / (sliced[0]?.price || 1))
    : sliced.map((p) => p.price);

  const vooOverlay =
    isReturn && overlays.voo && sliced.length > 0
      ? alignToDates(
          vooCloseHistory.map((p) => ({ date: p.date, value: p.price })),
          dates,
        )
      : null;
  const vooSeries =
    vooOverlay?.available && vooOverlay.values.length > 0
      ? vooOverlay.values.map((v) => (100 * v) / vooOverlay.values[0])
      : null;

  const bookOverlay =
    isReturn && overlays.book && sliced.length > 0
      ? alignToDates(
          bookGrowthIndex.map((p) => ({ date: p.date, value: p.index })),
          dates,
        )
      : null;
  const bookSeries =
    bookOverlay?.available && bookOverlay.values.length > 0
      ? bookOverlay.values.map((v) => (100 * v) / bookOverlay.values[0])
      : null;

  const rtn = series.length > 0 ? series[series.length - 1] / series[0] - 1 : 0;

  const L = 54;
  const R = 1308;
  const T = 22;
  const B = 396;

  let peak = series[0] ?? 0;
  const peakSeries = series.map((v) => (peak = Math.max(peak, v)));

  const allValues = [...series];
  if (overlays.depth) allValues.push(...peakSeries);
  if (vooSeries) allValues.push(...vooSeries);
  if (bookSeries) allValues.push(...bookSeries);
  if (isReturn) allValues.push(100);
  if (!isReturn && overlays.cost) allValues.push(costPerShare);

  let lo = allValues.length > 0 ? Math.min(...allValues) : 0;
  let hi = allValues.length > 0 ? Math.max(...allValues) : 1;
  const pad = (hi - lo) * 0.08 || 1;
  lo -= pad;
  hi += pad;

  const x = (i: number) => L + (i / Math.max(1, series.length - 1)) * (R - L);
  const y = (v: number) => T + ((hi - v) / (hi - lo)) * (B - T);

  const dateByIndex = new Map(dates.map((d, i) => [d, i]));
  const visibleTrades = overlays.trades
    ? trades.filter((t) => dateByIndex.has(t.date)).map((t) => ({ ...t, index: dateByIndex.get(t.date)! }))
    : [];

  return (
    <section className={styles.inst} aria-label="Full-scale graph">
      <div className={styles.instHead}>
        <h2>
          {RANGE_LABELS[range]} · <i data-neg={rtn < 0 || undefined}>{signedPercentLabel(rtn)}</i>
          {!isReturn && " · PRICE"}
        </h2>
        <span className={styles.q}>the full-scale graph — window in the title, answer beside it</span>
      </div>

      <div className={styles.controls}>
        {(["7d", "30d", "sinceBuy", "max"] as const).map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={range === r}
            onClick={() => setRange(r)}
          >
            {r === "7d" ? "7D" : r === "30d" ? "30D" : r === "sinceBuy" ? "SINCE BUY" : "MAX"}
          </button>
        ))}
        <span className={styles.sep}>·</span>
        <button type="button" aria-pressed={mode === "return"} onClick={() => setMode("return")}>
          RETURN
        </button>
        <button type="button" aria-pressed={mode === "price"} onClick={() => setMode("price")}>
          PRICE
        </button>
        <span className={styles.sep}>·</span>
        <button type="button" aria-pressed={overlays.voo} onClick={() => toggleOverlay("voo")}>
          VOO · SAME PERIOD
        </button>
        <button type="button" aria-pressed={overlays.book} onClick={() => toggleOverlay("book")}>
          BOOK · SAME PERIOD
        </button>
        <button type="button" aria-pressed={overlays.depth} onClick={() => toggleOverlay("depth")}>
          DEPTH
        </button>
        <button type="button" aria-pressed={overlays.trades} onClick={() => toggleOverlay("trades")}>
          TRADES
        </button>
        <button type="button" className={styles.owner} aria-pressed={overlays.cost} onClick={() => toggleOverlay("cost")}>
          COST <span className={styles.ownertag}>OWNER</span>
        </button>
      </div>

      {series.length < 2 ? (
        <p className={styles.empty}>Not enough history yet for this window.</p>
      ) : (
        <svg viewBox="0 0 1320 430" role="img" aria-label={`${range} indexed return`}>
          {[lo, (lo + hi) / 2, hi].map((v, i) => (
            <g key={i}>
              <line className={styles.hair} x1={L} x2={R} y1={y(v)} y2={y(v)} />
              <text x={4} y={y(v) + 4}>
                {isReturn ? v.toFixed(0) : `$${v.toFixed(0)}`}
              </text>
            </g>
          ))}
          {isReturn && <line className={styles.base} x1={L} x2={R} y1={y(100)} y2={y(100)} />}

          {overlays.depth && (
            <>
              <path
                className={styles.depthfill}
                d={`${pathFor(peakSeries, x, y)} ${series
                  .map((v, i) => `L${x(series.length - 1 - i).toFixed(1)} ${y(series[series.length - 1 - i]).toFixed(1)}`)
                  .join(" ")}Z`}
              />
              <path className={styles.peak} d={pathFor(peakSeries, x, y)} />
            </>
          )}

          {vooSeries && <path className={styles.bmk} d={pathFor(vooSeries, x, y)} />}
          {bookSeries && <path className={styles.book} d={pathFor(bookSeries, x, y)} />}

          {!isReturn && overlays.cost && (
            <>
              <line
                x1={L}
                x2={R}
                y1={y(costPerShare)}
                y2={y(costPerShare)}
                stroke="var(--amber)"
                strokeWidth={1}
                strokeDasharray="6 4"
              />
              <text x={R - 140} y={y(costPerShare) - 6}>
                COST ${costPerShare.toFixed(2)} · OWNER
              </text>
            </>
          )}

          <path className={styles.trace} d={pathFor(series, x, y)} />

          {visibleTrades.map((t, i) => (
            <g key={i}>
              <path
                d={`M${x(t.index).toFixed(1)} ${(y(series[t.index]) + (t.action === "buy" ? 14 : -14)).toFixed(1)} l6 ${
                  t.action === "buy" ? -10 : 10
                } l-12 0 Z`}
                className={t.action === "buy" ? styles.gainFill : styles.lossFill}
              />
              <text x={x(t.index) - 12} y={y(series[t.index]) + (t.action === "buy" ? 30 : -22)}>
                {t.action.toUpperCase()}
              </text>
            </g>
          ))}

          <circle cx={x(series.length - 1)} cy={y(series[series.length - 1])} r={4} fill="var(--baseline)" />
        </svg>
      )}
    </section>
  );
}
