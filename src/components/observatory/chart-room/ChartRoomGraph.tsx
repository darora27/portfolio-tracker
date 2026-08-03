"use client";

import { useMemo, useState } from "react";
import { sliceToRange, alignToDates, type ChartRoomRange } from "@/lib/portfolio/chart-room-window";
import styles from "./chart-room.module.css";

type Mode = "return" | "price";
/* R7-W6: "you overcomplicated the graph with buttons that don't matter like
   depth and cost." DEPTH drew a running-peak fill and COST a horizontal line
   at the purchase price — both real, neither worth a permanent control in a
   row that had NINE buttons. Nine controls above one chart is not a chart
   with options, it is a chart you have to configure before you can read it. */
type OverlayKey = "voo" | "book" | "trades";

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

function compactDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(date.valueOf())
    ? iso
    : date
        .toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
        .toUpperCase();
}

function pathFor(values: number[], x: (i: number) => number, y: (v: number) => number): string {
  return values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
}

export function ChartRoomGraph({
  priceHistory,
  vooCloseHistory,
  bookGrowthIndex,
  trades,
  firstTradeDate,
}: {
  priceHistory: { date: string; price: number }[];
  vooCloseHistory: { date: string; price: number }[];
  bookGrowthIndex: { date: string; index: number }[];
  trades: { date: string; action: string; shares: number; price: number }[];
  /* costPerShare left with the COST overlay. StockPriceChart on /stock keeps
     its own cost line — that is a different chart on a different page, and he
     objected to the CHART ROOM's button row, not to the figure existing. */
  firstTradeDate: string | null;
}) {
  const [range, setRange] = useState<ChartRoomRange>("30d");
  const [mode, setMode] = useState<Mode>("return");
  const [overlays, setOverlays] = useState<Record<OverlayKey, boolean>>({
    voo: true,
    book: false,
    trades: false,
  });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

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

  const allValues = [...series];
  if (vooSeries) allValues.push(...vooSeries);
  if (bookSeries) allValues.push(...bookSeries);
  if (isReturn) allValues.push(100);

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
        <button type="button" aria-pressed={overlays.trades} onClick={() => toggleOverlay("trades")}>
          TRADES
        </button>
      </div>

      {series.length < 2 ? (
        <p className={styles.empty}>Not enough history yet for this window.</p>
      ) : (
        <svg
          viewBox="0 0 1320 430"
          role="img"
          aria-label={`${range} indexed return`}
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            if (rect.width === 0 || series.length < 2) return;
            const viewX = ((event.clientX - rect.left) / rect.width) * 1320;
            const ratio = (viewX - L) / (R - L);
            setHoverIndex(
              Math.max(0, Math.min(series.length - 1, Math.round(ratio * (series.length - 1)))),
            );
          }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* R7-W6: five gridlines instead of three, and in RETURN mode they
              read as percent growth rather than an index near 100 — the same
              correction the Mission Control chart needed. "104" makes a reader
              do arithmetic; "+4%" is the answer. */}
          {Array.from({ length: 5 }, (_, step) => lo + ((hi - lo) * step) / 4).map((v, i) => (
            <g key={i}>
              <line className={styles.hair} x1={L} x2={R} y1={y(v)} y2={y(v)} />
              <text x={4} y={y(v) + 4}>
                {isReturn
                  ? `${v - 100 > 0 ? "+" : v - 100 < 0 ? "−" : ""}${Math.abs(v - 100).toFixed(1)}%`
                  : `$${v.toFixed(0)}`}
              </text>
            </g>
          ))}
          {isReturn && <line className={styles.base} x1={L} x2={R} y1={y(100)} y2={y(100)} />}

          {/* Dates along the bottom. The axis had none — every point was
              unplaceable in time, which is most of "hard to read" for a chart
              whose whole subject is change over time. */}
          {(() => {
            const count = Math.max(2, Math.min(8, dates.length));
            return Array.from({ length: count }, (_, step) =>
              Math.round((step / (count - 1)) * (dates.length - 1)),
            ).map((index) => (
              <text
                key={index}
                className={styles.dateTick}
                x={x(index)}
                y={B + 26}
                textAnchor="end"
                transform={`rotate(-45 ${x(index)} ${B + 26})`}
              >
                {compactDate(dates[index] ?? "")}
              </text>
            ));
          })()}


          {vooSeries && <path className={styles.bmk} d={pathFor(vooSeries, x, y)} />}
          {bookSeries && <path className={styles.book} d={pathFor(bookSeries, x, y)} />}


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

          {/* Hover readout. The chart could be looked at but not interrogated —
              no way to ask what a given day actually was. */}
          {hoverIndex !== null && series[hoverIndex] !== undefined ? (
            <g className={styles.crosshair}>
              <line x1={x(hoverIndex)} x2={x(hoverIndex)} y1={T} y2={B} />
              <circle cx={x(hoverIndex)} cy={y(series[hoverIndex])} r={4} />
              <g transform={`translate(${Math.max(L, Math.min(R - 190, x(hoverIndex) - 95))} ${T})`}>
                <rect width="190" height={vooSeries ? 54 : 38} rx="2" />
                <text x="10" y="16">{compactDate(dates[hoverIndex] ?? "")}</text>
                <text x="180" y="16" textAnchor="end">
                  {isReturn
                    ? signedPercentLabel(series[hoverIndex] / 100 - 1)
                    : `$${series[hoverIndex].toFixed(2)}`}
                </text>
                {vooSeries && vooSeries[hoverIndex] !== undefined ? (
                  <>
                    <text x="10" y="34">VOO</text>
                    <text x="180" y="34" textAnchor="end">
                      {signedPercentLabel(vooSeries[hoverIndex] / 100 - 1)}
                    </text>
                  </>
                ) : null}
              </g>
            </g>
          ) : null}
        </svg>
      )}
    </section>
  );
}
