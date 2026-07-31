"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import type { DashboardData } from "@/lib/dashboard-data";
import type { BenchmarkTicker } from "@/lib/portfolio/benchmark-comparison";
import type { DailyDirection } from "@/lib/portfolio/holdings";
import { daysBetween, todayInTimeZone } from "@/lib/date";
import { formatCurrency, formatSignedCurrency } from "@/lib/format";
import { concentrationStatus } from "@/lib/portfolio/concentration-status";
import {
  betaExplanation,
  hhiExplanation,
  maxDrawdownExplanation,
  volatilityExplanation,
} from "@/lib/observatory/metric-explanations";
import { sparklineGeometry } from "@/lib/sparkline";
import { LazyMissionSection } from "./LazyMissionSection";
import { MultiReturnPlot, type ReturnSeries } from "./ReturnInstrument";
import { identityColor } from "@/lib/observatory/identity-palette";
import { RoomMetricDisclosure } from "./RoomMetricDisclosure";
import styles from "./orrery.module.css";

const BENCHMARK_CHART_KEYS: Record<BenchmarkTicker, "vooIndex" | "vtiIndex" | "xlkIndex"> = {
  VOO: "vooIndex",
  VTI: "vtiIndex",
  XLK: "xlkIndex",
};

/**
 * The book is the subject of the chart, not one series among equals, and it
 * is not a holding, so it takes no identity colour. "Other" is neutral for
 * the same reason: it is an aggregate, not a company.
 *
 * Jul 31: the book's old amber measured 4.8 degrees from VOO's generated
 * gold — near enough
 * to read as the same line. The book is the subject of the chart, so it takes
 * the cream the room already uses for primary ink rather than competing for a
 * hue. Measured, not eyeballed.
 */
const BOOK_LINE_COLOR = "#F4F0DF";
const OTHER_LINE_COLOR = "#8A8880";

function signedPercent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const arrow = value > 0 ? "▲" : value < 0 ? "▼" : "◆";
  return `${arrow} ${Math.abs(value * 100).toFixed(digits)}%`;
}

/**
 * R7-W1/W9. A daily figure rendered from its own resolved direction rather
 * than from the sign of the number.
 *
 * signedPercent() below infers an arrow from `value > 0`, which quietly turns
 * a rounding artefact into a rise. resolveDailyChange has already decided
 * whether the move counts as up, down or flat, and null direction means the
 * figure is missing — which must render as an em dash, never as an arrow.
 */
function dailyGlyphPercent(
  value: number | null,
  direction: DailyDirection | null,
  digits = 1,
): string {
  // `== null` catches undefined too: a fixture or caller that forgets to
  // supply a direction should render an em dash, not a plausible-looking
  // flat glyph on a figure that actually moved.
  if (value == null || direction == null || !Number.isFinite(value)) return "—";
  const glyph = direction === "up" ? "▲" : direction === "down" ? "▼" : "◆";
  return `${glyph} ${Math.abs(value * 100).toFixed(digits)}%`;
}

/**
 * R7 feedback, Jul 31: "any number in the table that is positive needs to be
 * green and any number that is negative needs to be red."
 *
 * This is exactly what the Fraunhofer reservation exists for — green 125-165
 * and red 345-20 are held back from every other use precisely so they can
 * mean gain and loss here. Identity colour never enters those hues (W2), so
 * the two systems coexist rather than compete.
 *
 * `sign` is derived once and rendered as data, so the colour decision lives
 * in CSS with the rest of the signal palette rather than inline.
 */
function signOf(value: number | null | undefined): "up" | "down" | "flat" | "none" {
  if (value === null || value === undefined || !Number.isFinite(value)) return "none";
  if (Math.abs(value) < 0.00005) return "flat";
  return value > 0 ? "up" : "down";
}

function plainPercent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${Math.abs(value * 100).toFixed(digits)}%`;
}

/** §15 §6: per-row earnings chip, same daysBetween pattern the room's own
 * (now-removed) EARNINGS section used — derived fresh per ticker, not
 * reused from the 7-day-capped orrery field. Absent when none scheduled. */
function earningsChipFor(
  ticker: string,
  upcomingEarnings: DashboardData["upcomingEarnings"],
  today: string,
): string | null {
  const next = upcomingEarnings
    .filter((event) => event.ticker === ticker)
    .sort((left, right) => left.date.localeCompare(right.date))[0];
  return next ? `T−${Math.max(0, daysBetween(today, next.date))}D` : null;
}

/**
 * R7 feedback, Jul 31: "I want a pie chart rather than mix."
 *
 * The bar cards showed each weight against a 100% track, which answers "how
 * big is ASML" but not "how is the book divided" — the question a pie is for,
 * and the one the old composition donut he liked was answering. Slices take
 * identity colour, so a holding is the same colour here, in RETURNS, and on
 * its orbit.
 *
 * Drawn as arcs rather than a stroked circle so the slices meet cleanly and
 * a tiny holding still renders a visible sliver.
 */
function CompositionPie({
  slices,
}: {
  slices: readonly { ticker: string; weight: number }[];
}) {
  const total = slices.reduce((sum, slice) => sum + slice.weight, 0);
  if (total <= 0) return null;
  const RADIUS = 82;
  const INNER = 48;
  let angle = -Math.PI / 2; // start at twelve o'clock

  const arcs = slices.map((slice) => {
    const sweep = (slice.weight / total) * Math.PI * 2;
    const from = angle;
    const to = angle + sweep;
    angle = to;
    const point = (radius: number, at: number) =>
      `${(100 + Math.cos(at) * radius).toFixed(2)} ${(100 + Math.sin(at) * radius).toFixed(2)}`;
    const large = sweep > Math.PI ? 1 : 0;
    return {
      ticker: slice.ticker,
      weight: slice.weight,
      d: [
        `M${point(RADIUS, from)}`,
        `A${RADIUS} ${RADIUS} 0 ${large} 1 ${point(RADIUS, to)}`,
        `L${point(INNER, to)}`,
        `A${INNER} ${INNER} 0 ${large} 0 ${point(INNER, from)}`,
        "Z",
      ].join(" "),
    };
  });

  return (
    <div className={styles.compositionPie}>
      <svg viewBox="0 0 200 200" role="img" aria-label="Holdings by percentage of the book">
        {arcs.map((arc) => (
          <path
            key={arc.ticker}
            d={arc.d}
            fill={identityColor(arc.ticker)}
            stroke="#050B0A"
            strokeWidth={1.5}
          />
        ))}
        <text x="100" y="96" textAnchor="middle" className={styles.pieCount}>
          {slices.length}
        </text>
        <text x="100" y="112" textAnchor="middle" className={styles.pieCountLabel}>
          POSITIONS
        </text>
      </svg>
      <ul className={styles.pieLegend}>
        {arcs.map((arc) => (
          <li key={arc.ticker}>
            <i style={{ background: identityColor(arc.ticker) }} aria-hidden="true" />
            <span>{arc.ticker}</span>
            <b>{plainPercent(arc.weight)}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Trend({
  points,
  width = 64,
  height = 20,
}: {
  points: number[];
  width?: number;
  height?: number;
}) {
  if (points.length < 2) return null;
  const { coords } = sparklineGeometry(points, width, height);
  const signal = points.at(-1)! >= points[0] ? "positive" : "negative";
  return (
    <svg width={width} height={height} aria-hidden="true" data-signal={signal} className={styles.roomSpark}>
      <polyline points={coords} fill="none" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}

export function MissionControlRoomContent({
  data,
  basePath,
  mode,
}: {
  data: DashboardData;
  basePath: string;
  mode: "public" | "private";
}) {
  const today = todayInTimeZone("America/New_York");
  const publicOrreryByTicker = new Map(data.publicOrreryHoldings.map((h) => [h.ticker, h]));
  const [returnsMode, setReturnsMode] = useState<"book" | "stock">("book");

  /* R7-W3(a). BOOK VS MARKET as several lines at once rather than one
   * benchmark at a time. The old dashboard let him hold VOO, VTI and XLK on
   * screen together and toggle each; picking one from a radio group answered
   * a narrower question than he was asking. Benchmarks render dashed so the
   * book's own line stays the solid one. */
  const bookDates = data.chartData.map((point) => point.date);
  const bookSeries: ReturnSeries[] = [
    {
      id: "BOOK",
      label: "BOOK",
      color: BOOK_LINE_COLOR,
      values: data.chartData.map((point) => point.portfolioIndex),
    },
    ...(["VOO", "VTI", "XLK"] as const).map((ticker) => ({
      id: ticker,
      label: ticker,
      color: identityColor(ticker),
      dashed: true,
      values: data.chartData.map(
        (point) => point[BENCHMARK_CHART_KEYS[ticker]] ?? null,
      ),
    })),
  ];

  /* STOCK VS STOCK: all thirteen available, the top four by weight on by
   * default. Thirteen lines at once is unreadable; four is a comparison. */
  const stockTickers = [
    ...data.holdingsPerformance.tickers,
    ...(data.holdingsPerformance.hasOther ? ["Other"] : []),
  ];
  const stockDates = data.holdingsPerformance.points.map((point) => point.date);
  const stockSeries: ReturnSeries[] = stockTickers.map((ticker) => ({
    id: ticker,
    label: ticker,
    color: ticker === "Other" ? OTHER_LINE_COLOR : identityColor(ticker),
    values: data.holdingsPerformance.points.map((point) => {
      // Ticker keys sit directly on the point and carry PERCENT (12.3 for
      // +12.3%), so indexing to 100 is an addition, not a multiplication.
      const value = point[ticker];
      return typeof value === "number" ? 100 + value : null;
    }),
  }));
  const stockInitiallyHidden = stockTickers.slice(4);

  /* R7-W1/W3(b). Every row's daily figure carries the same window, so the
   * column can name it once. Rows agree because they all come from the one
   * selector; if they ever disagreed, TODAY would be the honest fallback. */
  const dailyColumnLabel = data.positionRows[0]?.dayLabel ?? "TODAY";

  const concentration = concentrationStatus(data.hhi);
  const best = data.movers.length
    ? data.movers.reduce((a, b) => (b.dayPct > a.dayPct ? b : a))
    : null;
  const worst = data.movers.length
    ? data.movers.reduce((a, b) => (b.dayPct < a.dayPct ? b : a))
    : null;

  const compositionTickers = [
    ...data.compositionHistory.tickers,
    ...(data.compositionHistory.hasOther ? ["Other"] : []),
  ];

  return (
    <>
      <LazyMissionSection id="holdings" title="HOLDINGS" minHeight={420}>
        {data.movers.length && best && worst ? (
          <p className={styles.moversLine}>
            BEST {dailyColumnLabel}{" "}
            <span data-signal={signOf(best.dayPct)}>
              {signedPercent(best.dayPct)} {best.ticker}
            </span>{" "}
            · WORST{" "}
            <span data-signal={signOf(worst.dayPct)}>
              {signedPercent(worst.dayPct)} {worst.ticker}
            </span>
          </p>
        ) : null}
        <div className={styles.holdingsTableWrap}>
          <table className={styles.holdingsTable}>
            <thead>
              <tr>
                <th>TICKER</th>
                <th>WEIGHT</th>
                {/* R7-W3(b). The column header carries the window, so a
                    carried figure is never read as today's. */}
                <th>{dailyColumnLabel}</th>
                <th>WEEK</th>
                <th>SINCE BUY</th>
                <th>EARNINGS</th>
                {mode === "private" ? <th>DAY $</th> : null}
                {mode === "private" ? <th>VALUE</th> : null}
              </tr>
            </thead>
            <tbody>
              {data.positionRows.map((row) => {
                const orrery = publicOrreryByTicker.get(row.ticker);
                const chip = earningsChipFor(row.ticker, data.upcomingEarnings, today);
                const href = mode === "private"
                  ? `/stock/${encodeURIComponent(row.ticker)}`
                  : `${basePath}?holding=${encodeURIComponent(row.ticker)}&camera=approach`;
                return (
                  <tr key={row.ticker}>
                    <th>
                      <Link href={href}>{row.ticker}</Link>
                    </th>
                    <td>{plainPercent(row.weight)}</td>
                    <td data-signal={row.dayDirection ?? "none"}>
                      {dailyGlyphPercent(row.dayPct, row.dayDirection)}
                    </td>
                    <td data-signal={signOf(orrery?.weeklyReturn)}>
                      {signedPercent(orrery?.weeklyReturn ?? null)}
                    </td>
                    <td data-signal={signOf(row.gainPct)}>
                      {signedPercent(row.gainPct)} (SIMPLE)
                    </td>
                    <td>{chip ?? ""}</td>
                    {mode === "private" ? (
                      <td data-signal={signOf(row.day)}>
                        {row.day === null ? "—" : formatSignedCurrency(row.day)}
                      </td>
                    ) : null}
                    {mode === "private" ? <td>{formatCurrency(row.value)}</td> : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className={styles.holdingsSummaryLine}>
          TOP-2 {plainPercent(data.top2ConcentrationPct)} · {concentration.label.toUpperCase()}
          {mode === "private"
            ? ` · REALIZED ${formatCurrency(data.realizedGain)} · UNREALIZED ${formatCurrency(data.unrealizedGain)}`
            : ""}{" "}
          <RoomMetricDisclosure
            explanation={hhiExplanation({
              hhi: data.hhi,
              top2ConcentrationPct: data.top2ConcentrationPct,
              positions: data.positionRows.map((row) => ({ ticker: row.ticker, weight: row.weight })),
              dailyChangeAsOf: data.dailyChangeAsOf,
              pricesAsOf: data.pricesAsOf,
            })}
          />
        </p>
      </LazyMissionSection>

      <LazyMissionSection id="returns" title="RETURNS" minHeight={460}>
        <div className={styles.modeSwitch} role="group" aria-label="Returns mode">
          <button type="button" aria-pressed={returnsMode === "book"} onClick={() => setReturnsMode("book")}>
            BOOK VS MARKET
          </button>
          <button type="button" aria-pressed={returnsMode === "stock"} onClick={() => setReturnsMode("stock")}>
            STOCK VS STOCK
          </button>
        </div>
        {returnsMode === "book" ? (
          <>
            <MultiReturnPlot
              dates={bookDates}
              series={bookSeries}
              ariaLabel="Portfolio return against VOO, VTI and XLK over the same period, all indexed to 100 at the start"
            />
            <ul className={styles.excessReturnsList}>
              {data.benchmarkComparisons.map((comparison) => (
                <li key={comparison.ticker}>
                  VS {comparison.ticker} · SAME PERIOD{" "}
                  {comparison.available ? signedPercent(comparison.excessReturnPct) : "—"}
                </li>
              ))}
            </ul>
          </>
        ) : (
          /* R7-W3(a). This was a list of sparklines, not a chart. He asked
           * for "the graph with all the individual stock performance… and I
           * liked how I could toggle what stocks I wanted to see and compare
           * them to each other" — comparing lines to each other needs them on
           * one pair of axes, which a column of separate sparklines cannot do. */
          <MultiReturnPlot
            dates={stockDates}
            series={stockSeries}
            initiallyHidden={stockInitiallyHidden}
            ariaLabel="Each holding's return since its own purchase date, indexed to 100"
          />
        )}
        {mode === "private" ? (
          <p className={styles.xirrReadout}>
            {data.historyDays < 90
              ? "XIRR — (needs 90d)"
              : `XIRR · SINCE START ${signedPercent(data.xirrPct)}`}
          </p>
        ) : null}
      </LazyMissionSection>

      <LazyMissionSection id="mix" title="MIX" minHeight={380}>
        {data.donutSlices.length ? (
          <CompositionPie
            slices={[...data.donutSlices].sort((a, b) => b.weight - a.weight)}
          />
        ) : (
          <p className={styles.mixEmpty}>NO HOLDINGS YET</p>
        )}
        <div className={styles.mixClassifications}>
          <div>
            <h4>SECTOR</h4>
            {data.sectorWeights.length ? (
              data.sectorWeights.map((weight) => (
                <p key={weight.label}>
                  {weight.label.toUpperCase()} <b>{plainPercent(weight.weight)}</b>
                </p>
              ))
            ) : (
              <p className={styles.mixEmpty}>NO SECTOR DATA</p>
            )}
          </div>
          <div>
            <h4>AI EXPOSURE</h4>
            {data.aiExposureWeights.length ? (
              data.aiExposureWeights.map((weight) => (
                <p key={weight.label}>
                  {weight.label.toUpperCase()} <b>{plainPercent(weight.weight)}</b>
                </p>
              ))
            ) : (
              <p className={styles.mixEmpty}>NO CLASSIFICATION DATA</p>
            )}
          </div>
        </div>
        <div>
          <h4>SHARE OF THE BOOK · OVER TIME</h4>
          <p className={styles.sectionHint}>
            how much of the portfolio each holding has been, week by week
          </p>
          {data.compositionHistory.points.length >= 2 ? (
            <div className={styles.compositionHistoryList}>
              {compositionTickers.map((ticker) => {
                const series = data.compositionHistory.points.map(
                  (point) => (typeof point[ticker] === "number" ? (point[ticker] as number) : 0),
                );
                return (
                  <div key={ticker} className={styles.compositionHistoryRow}>
                    <span>{ticker}</span>
                    <Trend points={series} width={96} height={24} />
                    <b>{series.at(-1)?.toFixed(1) ?? "0.0"}%</b>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={styles.mixEmpty}>NOT ENOUGH HISTORY YET</p>
          )}
        </div>
      </LazyMissionSection>

      <LazyMissionSection id="risk" title="RISK" minHeight={440}>
        <div className={styles.riskInstruments}>
          <article>
            <span>VOL · SINCE START</span>
            <strong>{plainPercent(data.volatilityPct)}</strong>
            <i style={{ "--meter": `${Math.min(100, Math.max(0, (data.volatilityPct ?? 0) * 220))}%` } as CSSProperties} />
            <RoomMetricDisclosure
              explanation={volatilityExplanation({
                volatilityPct: data.volatilityPct,
                historyDays: data.historyDays,
                dailyChangeAsOf: data.dailyChangeAsOf,
                pricesAsOf: data.pricesAsOf,
              })}
            />
          </article>
          <article>
            <span>BETA · SAME PERIOD VOO</span>
            <strong>{data.betaVsVoo?.toFixed(2) ?? "—"}</strong>
            <i style={{ "--meter": `${Math.min(100, Math.max(0, (data.betaVsVoo ?? 0) * 50))}%` } as CSSProperties} />
            <RoomMetricDisclosure
              explanation={betaExplanation({
                betaVsVoo: data.betaVsVoo,
                historyDays: data.historyDays,
                dailyChangeAsOf: data.dailyChangeAsOf,
                pricesAsOf: data.pricesAsOf,
              })}
            />
          </article>
          <article>
            <span>OFF HIGH · SINCE {data.allTimeHigh?.peakDate.slice(5).replace("-", "·") ?? "—"}</span>
            <strong>{signedPercent(data.allTimeHigh?.pct)}</strong>
            <i style={{ "--meter": `${Math.min(100, Math.abs(data.allTimeHigh?.pct ?? 0) * 300)}%` } as CSSProperties} />
          </article>
        </div>
        <div className={styles.riskHistoryCharts}>
          <div>
            <h4>
              DRAWDOWN · SINCE START{" "}
              <RoomMetricDisclosure
                explanation={maxDrawdownExplanation({
                  maxDrawdown: data.maxDrawdown,
                  historyDays: data.historyDays,
                  dailyChangeAsOf: data.dailyChangeAsOf,
                  pricesAsOf: data.pricesAsOf,
                })}
              />
            </h4>
            {data.drawdownSeries.length >= 2 ? (
              <Trend points={data.drawdownSeries.map((point) => point.drawdown)} width={280} height={48} />
            ) : (
              <p className={styles.mixEmpty}>NOT ENOUGH HISTORY YET</p>
            )}
          </div>
          <div>
            <h4>DAILY RETURNS · SINCE START</h4>
            {data.dailyReturnBars.length >= 2 ? (
              <Trend points={data.dailyReturnBars.map((point) => point.return)} width={280} height={48} />
            ) : (
              <p className={styles.mixEmpty}>NOT ENOUGH HISTORY YET</p>
            )}
          </div>
        </div>
        <details className={styles.byHoldingDisclosure}>
          <summary>BY HOLDING ▸</summary>
          <ul>
            {data.holdingRisks.map((risk) => (
              <li key={risk.ticker}>
                <span>{risk.ticker}</span>
                <span>VOL {plainPercent(risk.volatilityPct)}</span>
                <span>BETA {risk.betaVsVoo?.toFixed(2) ?? "—"}</span>
              </li>
            ))}
          </ul>
        </details>
      </LazyMissionSection>

      <LazyMissionSection id="trades" title="ACTIVITY" minHeight={260} className={styles.roomTrades}>
        <ol>
          {(data.publicTradeLog ?? []).slice(0, 12).map((entry, index) => (
            <li key={`${entry.date}-${entry.ticker}-${index}`}>
              <time>{entry.date}</time>
              <strong>{entry.action.toUpperCase()}</strong>
              <span>{entry.ticker}</span>
              <b>EFFECT ON PORTFOLIO {signedPercent(entry.impactPct)}</b>
            </li>
          ))}
        </ol>
        {mode === "private" ? <Link href="/trades">OPEN TRADE DESK ▸</Link> : null}
      </LazyMissionSection>
    </>
  );
}
