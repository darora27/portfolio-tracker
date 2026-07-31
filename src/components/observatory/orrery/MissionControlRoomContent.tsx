"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import type { DashboardData } from "@/lib/dashboard-data";
import type { BenchmarkTicker } from "@/lib/portfolio/benchmark-comparison";
import { daysBetween, todayInTimeZone } from "@/lib/date";
import { formatCurrency } from "@/lib/format";
import { concentrationStatus } from "@/lib/portfolio/concentration-status";
import {
  betaExplanation,
  hhiExplanation,
  maxDrawdownExplanation,
  volatilityExplanation,
} from "@/lib/observatory/metric-explanations";
import { sparklineGeometry } from "@/lib/sparkline";
import { LazyMissionSection } from "./LazyMissionSection";
import { ReturnInstrument } from "./ReturnInstrument";
import { RoomMetricDisclosure } from "./RoomMetricDisclosure";
import styles from "./orrery.module.css";

const BENCHMARK_CHART_KEYS: Record<BenchmarkTicker, "vooIndex" | "vtiIndex" | "xlkIndex"> = {
  VOO: "vooIndex",
  VTI: "vtiIndex",
  XLK: "xlkIndex",
};

function signedPercent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const arrow = value > 0 ? "▲" : value < 0 ? "▼" : "◆";
  return `${arrow} ${Math.abs(value * 100).toFixed(digits)}%`;
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
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkTicker>("VOO");
  const [returnsMode, setReturnsMode] = useState<"book" | "stock">("book");
  const [hiddenStockTickers, setHiddenStockTickers] = useState<Set<string>>(new Set());

  const benchmarkKey = BENCHMARK_CHART_KEYS[selectedBenchmark];
  const bookPoints = data.chartData.map((point) => {
    const benchmarkIndex = point[benchmarkKey];
    return {
      date: point.date,
      index: point.portfolioIndex,
      ...(typeof benchmarkIndex === "number" ? { benchmarkIndex } : {}),
    };
  });

  const concentration = concentrationStatus(data.hhi);
  const best = data.movers.length
    ? data.movers.reduce((a, b) => (b.dayPct > a.dayPct ? b : a))
    : null;
  const worst = data.movers.length
    ? data.movers.reduce((a, b) => (b.dayPct < a.dayPct ? b : a))
    : null;

  const visibleStockTickers = [
    ...data.holdingsPerformance.tickers,
    ...(data.holdingsPerformance.hasOther ? ["Other"] : []),
  ].filter((ticker) => !hiddenStockTickers.has(ticker));

  const compositionTickers = [
    ...data.compositionHistory.tickers,
    ...(data.compositionHistory.hasOther ? ["Other"] : []),
  ];

  return (
    <>
      <LazyMissionSection id="holdings" title="HOLDINGS" minHeight={420}>
        {data.movers.length && best && worst ? (
          <p className={styles.moversLine}>
            BEST TODAY {signedPercent(best.dayPct)} {best.ticker} · WORST {signedPercent(worst.dayPct)} {worst.ticker}
          </p>
        ) : null}
        <div className={styles.holdingsTableWrap}>
          <table className={styles.holdingsTable}>
            <thead>
              <tr>
                <th>TICKER</th>
                <th>WEIGHT</th>
                <th>TODAY</th>
                <th>WEEK</th>
                <th>SINCE BUY</th>
                <th>TREND</th>
                <th>EARNINGS</th>
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
                    <td>{signedPercent(row.dayPct)}</td>
                    <td>{signedPercent(orrery?.weeklyReturn ?? null)}</td>
                    <td>{signedPercent(row.gainPct)} (SIMPLE)</td>
                    <td><Trend points={row.sparkline} /></td>
                    <td>{chip ?? ""}</td>
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
        <div className={styles.benchmarkToggleGroup} role="group" aria-label="Benchmark">
          {data.benchmarkComparisons.map((comparison) => (
            <button
              key={comparison.ticker}
              type="button"
              aria-pressed={selectedBenchmark === comparison.ticker}
              onClick={() => setSelectedBenchmark(comparison.ticker)}
            >
              {comparison.ticker}
            </button>
          ))}
        </div>
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
            <ReturnInstrument
              points={bookPoints}
              initialRange="max"
              roomScale
              sinceLabel="SINCE START"
              benchmarkLabel={selectedBenchmark}
              ariaLabel={`Portfolio return compared with ${selectedBenchmark} over the same period`}
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
          <div className={styles.stockVsStock}>
            <div className={styles.stockToggleRow} role="group" aria-label="Holdings shown">
              {data.holdingsPerformance.tickers.map((ticker) => (
                <button
                  key={ticker}
                  type="button"
                  aria-pressed={!hiddenStockTickers.has(ticker)}
                  onClick={() => setHiddenStockTickers((current) => {
                    const next = new Set(current);
                    if (next.has(ticker)) next.delete(ticker); else next.add(ticker);
                    return next;
                  })}
                >
                  {ticker}
                </button>
              ))}
              {data.holdingsPerformance.hasOther ? (
                <button
                  type="button"
                  aria-pressed={!hiddenStockTickers.has("Other")}
                  onClick={() => setHiddenStockTickers((current) => {
                    const next = new Set(current);
                    if (next.has("Other")) next.delete("Other"); else next.add("Other");
                    return next;
                  })}
                >
                  OTHER
                </button>
              ) : null}
            </div>
            {visibleStockTickers.length ? (
              <ul className={styles.stockPerformanceList}>
                {visibleStockTickers.map((ticker) => {
                  const series = data.holdingsPerformance.points
                    .filter((point) => typeof point[ticker] === "number")
                    .map((point) => point[ticker] as number);
                  const latest = series.at(-1) ?? null;
                  return (
                    <li key={ticker}>
                      <span>{ticker}</span>
                      <Trend points={series} />
                      <b>{latest === null ? "—" : signedPercent(latest / 100)}</b>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.mixEmpty}>NO HOLDINGS SELECTED</p>
            )}
          </div>
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
        <div className={styles.mixDonut} aria-label="Holdings by percentage">
          {data.donutSlices.length ? (
            [...data.donutSlices].sort((a, b) => b.weight - a.weight).map((slice) => (
              <article key={slice.ticker}>
                <span>{slice.ticker}</span>
                <strong>{plainPercent(slice.weight)}</strong>
                <i style={{ "--meter": `${Math.min(100, slice.weight * 100)}%` } as CSSProperties} />
              </article>
            ))
          ) : (
            <p className={styles.mixEmpty}>NO HOLDINGS YET</p>
          )}
        </div>
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
          <h4>COMPOSITION · SINCE START</h4>
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
