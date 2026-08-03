"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import type { DashboardData } from "@/lib/dashboard-data";
import type { BenchmarkTicker } from "@/lib/portfolio/benchmark-comparison";
import type { DailyDirection } from "@/lib/portfolio/holdings";
import { formatCurrency, formatSignedCurrency } from "@/lib/format";
import { concentrationStatus } from "@/lib/portfolio/concentration-status";
import {
  betaExplanation,
  hhiExplanation,
  maxDrawdownExplanation,
  volatilityExplanation,
} from "@/lib/observatory/metric-explanations";
import { LazyMissionSection } from "./LazyMissionSection";
import { MultiReturnPlot, type ReturnSeries } from "./ReturnInstrument";
import { identityColor } from "@/lib/observatory/identity-palette";
import { earningsForNextTwoMonths } from "@/lib/observatory/earnings-window";
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
 * gold — near enough to read as the same line. It now takes the cream the
 * room already uses for primary ink rather than competing for a hue.
 * Measured, not eyeballed.
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

  const CX = 300;
  const CY = 215;
  const R = 150;
  const START = -Math.PI / 2;
  const LABEL_X_LEFT = 20;
  const LABEL_X_RIGHT = 580;
  const ROW = 26;

  const point = (radius: number, at: number) => ({
    x: CX + Math.cos(at) * radius,
    y: CY + Math.sin(at) * radius,
  });

  const wedges = slices.map((slice, index) => {
    const before = slices
      .slice(0, index)
      .reduce((sum, earlier) => sum + earlier.weight, 0);
    const from = START + (before / total) * Math.PI * 2;
    const sweep = (slice.weight / total) * Math.PI * 2;
    const to = from + sweep;
    const mid = from + sweep / 2;
    const outer = point(R, from);
    const outerEnd = point(R, to);
    const large = sweep > Math.PI ? 1 : 0;
    return {
      ticker: slice.ticker,
      weight: slice.weight,
      mid,
      // Right half of the circle sends its label right, left half left.
      side: Math.cos(mid) >= 0 ? ("right" as const) : ("left" as const),
      anchor: point(R + 12, mid),
      d: [
        `M${CX} ${CY}`,
        `L${outer.x.toFixed(2)} ${outer.y.toFixed(2)}`,
        `A${R} ${R} 0 ${large} 1 ${outerEnd.x.toFixed(2)} ${outerEnd.y.toFixed(2)}`,
        "Z",
      ].join(" "),
    };
  });

  /* Labels are stacked down each side in the order their wedges appear, then
   * pushed apart so none overlap — the leader line keeps each attached to its
   * own wedge, which is what lets the key go away. */
  const place = (side: "left" | "right") => {
    const rows = wedges.filter((wedge) => wedge.side === side);
    const sorted = [...rows].sort((a, b) => a.anchor.y - b.anchor.y);
    return sorted.map((wedge, index) => {
      const ideal = wedge.anchor.y;
      const floor = 24 + index * ROW;
      return { wedge, y: Math.max(ideal, floor) };
    });
  };

  const labels = [...place("left"), ...place("right")];

  return (
    <div className={styles.compositionPie}>
      <svg
        viewBox="0 0 600 430"
        role="img"
        aria-label={`Portfolio allocation by stock: ${slices
          .map((slice) => `${slice.ticker} ${(slice.weight * 100).toFixed(1)} percent`)
          .join(", ")}`}
      >
        {wedges.map((wedge) => (
          <path
            key={wedge.ticker}
            d={wedge.d}
            fill={identityColor(wedge.ticker)}
            stroke="#050B0A"
            strokeWidth={1.5}
          />
        ))}
        {labels.map(({ wedge, y }) => {
          const elbowX = wedge.side === "right" ? LABEL_X_RIGHT - 46 : LABEL_X_LEFT + 46;
          const textX = wedge.side === "right" ? LABEL_X_RIGHT : LABEL_X_LEFT;
          return (
            <g key={`label-${wedge.ticker}`}>
              <polyline
                className={styles.pieLeader}
                points={`${wedge.anchor.x.toFixed(1)},${wedge.anchor.y.toFixed(1)} ${elbowX},${y} ${textX + (wedge.side === "right" ? -4 : 4)},${y}`}
              />
              <text
                x={textX}
                y={y - 3}
                textAnchor={wedge.side === "right" ? "end" : "start"}
                className={styles.pieLabelTicker}
              >
                {wedge.ticker}
              </text>
              <text
                x={textX}
                y={y + 11}
                textAnchor={wedge.side === "right" ? "end" : "start"}
                className={styles.pieLabelPercent}
              >
                {plainPercent(wedge.weight)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * R7 feedback, Jul 31: "all the risk data is not displayed correctly."
 *
 * It was. Three separate faults:
 *
 * 1. The meters scaled by bare multipliers — vol × 220, beta × 50, off-high
 *    × 300 — with no scale stated anywhere. Beta 2.44 × 50 clamps to a full
 *    bar, off-high 12.3% × 300 likewise, so two of the three read "maximum"
 *    regardless of the value. A bar with no top is not a measurement.
 * 2. Drawdown was drawn with the row sparkline, which has no zero line. A
 *    drawdown series is defined by its distance below zero; without that
 *    baseline the shape is unreadable.
 * 3. "Daily returns" was a LINE. Daily returns are discrete signed events —
 *    bars — and the sparkline coloured the whole series by comparing its
 *    last point to its first, which means nothing for a return series.
 */
function RiskMeter({
  label,
  value,
  display,
  max,
  maxLabel,
  children,
}: {
  label: string;
  value: number | null;
  display: string;
  /** Top of the scale. Stated, and shown, so the bar means something. */
  max: number;
  maxLabel: string;
  children?: React.ReactNode;
}) {
  const filled =
    value === null || !Number.isFinite(value)
      ? 0
      : Math.min(100, Math.max(0, (Math.abs(value) / max) * 100));
  return (
    <article>
      <span>{label}</span>
      <strong>{display}</strong>
      <i style={{ "--meter": `${filled}%` } as CSSProperties} />
      <em className={styles.meterScale}>0 — {maxLabel}</em>
      {children}
    </article>
  );
}

/**
 * R7 Jul 31 (H2). Earnings gave up their column in HOLDINGS to GAIN / LOSS,
 * and land here as a two-month forecast rather than a per-row chip — which is
 * how a calendar is actually read: by month, not by scanning a table for
 * T−nD values and doing the arithmetic yourself.
 */
function EarningsForecast({
  events,
}: {
  events: readonly { ticker: string; date: string }[];
}) {
  const months = earningsForNextTwoMonths(events);
  const total = months.reduce((sum, month) => sum + month.events.length, 0);
  return (
    <div className={styles.earningsForecast}>
      {months.map((month) => (
        <section key={month.key}>
          <h4>{month.label}</h4>
          {month.events.length ? (
            <ol>
              {month.events.map((event) => (
                <li key={`${event.ticker}-${event.date}`}>
                  <i style={{ background: identityColor(event.ticker) }} aria-hidden="true" />
                  <span>{event.ticker}</span>
                  <time>{compactDay(event.date)}</time>
                </li>
              ))}
            </ol>
          ) : (
            <p className={styles.mixEmpty}>NOTHING SCHEDULED</p>
          )}
        </section>
      ))}
      {total === 0 ? (
        <p className={styles.sectionHint}>
          no earnings dates for your holdings in the next two months
        </p>
      ) : null}
    </div>
  );
}

function compactDay(iso: string): string {
  const date = new Date(`${iso}T12:00:00Z`);
  return Number.isNaN(date.valueOf())
    ? iso
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).toUpperCase();
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
                {/* R7 Jul 31 (H1): the earnings chip gave up this column to
                    the number he actually reads down. Earnings move to their
                    own two-month forecast — see H2. */}
                {mode === "private" ? <th>GAIN / LOSS</th> : null}
                {mode === "private" ? <th>DAY $</th> : null}
                {mode === "private" ? <th>VALUE</th> : null}
              </tr>
            </thead>
            <tbody>
              {data.positionRows.map((row) => {
                const orrery = publicOrreryByTicker.get(row.ticker);
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
                    {mode === "private" ? (
                      <td data-signal={signOf(row.gain)}>
                        {row.gain === null ? "—" : formatSignedCurrency(row.gain)}
                      </td>
                    ) : null}
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
      </LazyMissionSection>

      <LazyMissionSection id="risk" title="RISK" minHeight={440}>
        <div className={styles.riskInstruments}>
          <RiskMeter
            label="VOL · SINCE START"
            value={data.volatilityPct}
            display={plainPercent(data.volatilityPct)}
            /* 60% annualised is roughly a very volatile single tech name;
               a whole book at the top of this scale is genuinely extreme. */
            max={0.6}
            maxLabel="60%"
          >
            <RoomMetricDisclosure
              explanation={volatilityExplanation({
                volatilityPct: data.volatilityPct,
                historyDays: data.historyDays,
                dailyChangeAsOf: data.dailyChangeAsOf,
                pricesAsOf: data.pricesAsOf,
              })}
            />
          </RiskMeter>
          <RiskMeter
            label="BETA · SAME PERIOD VOO"
            value={data.betaVsVoo}
            display={data.betaVsVoo?.toFixed(2) ?? "—"}
            /* 1.0 is the market itself; 3.0 tops the scale so a beta above
               the index still has somewhere to go. The old ×50 pinned
               anything past 2.0 at full. */
            max={3}
            maxLabel="3.0"
          >
            <RoomMetricDisclosure
              explanation={betaExplanation({
                betaVsVoo: data.betaVsVoo,
                historyDays: data.historyDays,
                dailyChangeAsOf: data.dailyChangeAsOf,
                pricesAsOf: data.pricesAsOf,
              })}
            />
          </RiskMeter>
          <RiskMeter
            label={`OFF HIGH · SINCE ${data.allTimeHigh?.peakDate.slice(5).replace("-", "·") ?? "—"}`}
            value={data.allTimeHigh?.pct ?? null}
            display={signedPercent(data.allTimeHigh?.pct)}
            /* A 40% fall from the high is a bear market for a whole book. */
            max={0.4}
            maxLabel="40%"
          >
            <RoomMetricDisclosure
              explanation={maxDrawdownExplanation({
                maxDrawdown: data.maxDrawdown,
                historyDays: data.historyDays,
                dailyChangeAsOf: data.dailyChangeAsOf,
                pricesAsOf: data.pricesAsOf,
              })}
            />
          </RiskMeter>
        </div>
        {/* R7 Aug: "the graphs that are in Risk are already in the history so
            just get rid of them from the risk category."

            He is right, and it was a duplication I introduced by improving
            them here rather than noticing they already existed. /history
            renders DrawdownChart, DailyReturnsChart and
            CompositionOverTimeChart from the same getHistoryData() series.
            Two copies of one chart is two places to disagree.

            RISK keeps what only RISK has: the three meters, and BY HOLDING.
            The MetricDisclosure explaining max drawdown moves onto the OFF
            HIGH meter, which is the drawdown figure that remains here — the
            explanation was worth keeping even though its chart was not. */}
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

      {/* R7 Jul 31 (S1): "takes up too much space and has useless
          information". Twelve rows down to five, and minHeight follows.
          (S2): "i do not know what effect on porfolio actually means" — and
          it did not mean what it said. The number is trade total ÷ portfolio
          cost basis: how BIG the trade was relative to the book, not what it
          did to performance. "EFFECT ON PORTFOLIO" promised the second. This
          is the column's SECOND failed name after "BOOK"; naming it for what
          it measures should end that. */}
      <LazyMissionSection id="earnings" title="EARNINGS · NEXT TWO MONTHS" minHeight={200}>
        <EarningsForecast events={data.upcomingEarnings} />
      </LazyMissionSection>

      <LazyMissionSection id="trades" title="ACTIVITY" minHeight={150} className={styles.roomTrades}>
        <ol>
          {(data.publicTradeLog ?? []).slice(0, 5).map((entry, index) => (
            <li key={`${entry.date}-${entry.ticker}-${index}`}>
              <time>{entry.date}</time>
              <strong>{entry.action.toUpperCase()}</strong>
              <span>{entry.ticker}</span>
              <b>{plainPercent(Math.abs(entry.impactPct))} OF BOOK</b>
            </li>
          ))}
        </ol>
        {mode === "private" ? <Link href="/trades">OPEN TRADE DESK ▸</Link> : null}
      </LazyMissionSection>
    </>
  );
}
