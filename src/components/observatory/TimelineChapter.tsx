import Link from "next/link";
import { formatDate, formatPercent, formatSignedPercent } from "@/lib/format";
import { observatoryChapterHref } from "@/lib/observatory/chapters";
import type {
  FlowMarker,
  TradeMarker,
} from "@/lib/observatory/timeline-data";
import type { CompositionHistorySeries } from "@/lib/portfolio/composition-history";
import styles from "./timeline-chapter.module.css";

type TimelinePoint = {
  date: string;
  index: number;
};

type RibbonMarker =
  | (FlowMarker & { kind: "flow" })
  | (TradeMarker & { kind: "trade" });

export type TimelineChapterProps = {
  chartData: TimelinePoint[];
  allTimeHigh: { pct: number; peakDate: string } | null;
  bestDay: { date: string; r: number } | null;
  worstDay: { date: string; r: number } | null;
  flowMarkers: FlowMarker[];
  tradeMarkers: TradeMarker[];
  compositionHistory: CompositionHistorySeries;
};

const CHART_WIDTH = 720;
const CHART_HEIGHT = 185;
const CHART_PADDING = 16;
const MAX_RIBBON_MARKERS = 24;
const MIN_LABEL_SPACING_PERCENT = 12;

function timelinePaths(data: TimelinePoint[]): {
  portfolio: string | null;
  peak: string | null;
} {
  if (data.length === 0) return { portfolio: null, peak: null };

  let runningPeak = Number.NEGATIVE_INFINITY;
  const peaks = data.map((point) => {
    runningPeak = Math.max(runningPeak, point.index);
    return runningPeak;
  });
  const values = [...data.map((point) => point.index), ...peaks];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const range = maximum - minimum || 1;
  const xRange = CHART_WIDTH - CHART_PADDING * 2;
  const yRange = CHART_HEIGHT - CHART_PADDING * 2;
  const pathFor = (series: number[]) =>
    series.map((value, index) => {
      const x = CHART_PADDING +
        (index / Math.max(series.length - 1, 1)) * xRange;
      const y = CHART_PADDING + ((maximum - value) / range) * yRange;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");

  return { portfolio: pathFor(data.map((point) => point.index)), peak: pathFor(peaks) };
}

function sampleMarkers(markers: RibbonMarker[]): RibbonMarker[] {
  if (markers.length <= MAX_RIBBON_MARKERS) return markers;
  const selected = Array.from(
    { length: MAX_RIBBON_MARKERS },
    (_, index) => Math.round(
      index * (markers.length - 1) / (MAX_RIBBON_MARKERS - 1),
    ),
  );
  return selected.map((index) => markers[index]);
}

function markerText(marker: RibbonMarker): string {
  if (marker.kind === "flow") {
    return marker.direction === "in" ? "Capital added" : "Capital withdrawn";
  }
  return marker.action === "buy"
    ? `Bought ${marker.ticker}`
    : `Sold ${marker.ticker}`;
}

function markerGlyph(marker: RibbonMarker): string {
  if (marker.kind === "flow") return marker.direction === "in" ? "+" : "−";
  return marker.action === "buy" ? "▲" : "▼";
}

export function TimelineChapter({
  chartData,
  allTimeHigh,
  bestDay,
  worstDay,
  flowMarkers,
  tradeMarkers,
  compositionHistory,
}: TimelineChapterProps) {
  const paths = timelinePaths(chartData);
  const allMarkers: RibbonMarker[] = [
    ...flowMarkers.map((marker) => ({ ...marker, kind: "flow" as const })),
    ...tradeMarkers.map((marker) => ({ ...marker, kind: "trade" as const })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  const ribbonMarkers = sampleMarkers(allMarkers);
  const firstDate = chartData[0]?.date ?? allMarkers[0]?.date;
  const lastDate = chartData.at(-1)?.date ?? allMarkers.at(-1)?.date;
  const firstTime = firstDate ? Date.parse(`${firstDate}T00:00:00Z`) : 0;
  const lastTime = lastDate ? Date.parse(`${lastDate}T00:00:00Z`) : firstTime;
  const dateRange = Math.max(lastTime - firstTime, 1);
  let lastVisibleLabelPosition = Number.NEGATIVE_INFINITY;
  const positionedMarkers = ribbonMarkers.map((marker) => {
    const markerTime = Date.parse(`${marker.date}T00:00:00Z`);
    const left = Math.min(
      Math.max(((markerTime - firstTime) / dateRange) * 100, 0),
      100,
    );
    const showLabel =
      left - lastVisibleLabelPosition >= MIN_LABEL_SPACING_PERCENT;
    if (showLabel) lastVisibleLabelPosition = left;
    return { marker, left, showLabel };
  });
  const compositionLabels = [
    ...compositionHistory.tickers,
    ...(compositionHistory.hasOther ? ["Other"] : []),
  ];

  return (
    <div className={styles.chapter}>
      <p className={styles.eyebrow}>Annotated divergence ribbon</p>
      <p className={styles.lead}>
        How the portfolio&apos;s shape and result changed over time.
      </p>

      <figure className={styles.timeline}>
        <figcaption>
          Portfolio growth index and its running peak, with public event markers aligned below
        </figcaption>
        {paths.portfolio ? (
          <>
            <svg
              className={styles.chart}
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              role="img"
              aria-label="Portfolio growth index. The lighter reference line is the running peak; the gap between the lines shows drawdown."
            >
              <path d={paths.peak ?? ""} className={styles.peakLine} />
              <path d={paths.portfolio} className={styles.portfolioLine} />
            </svg>
            <div className={styles.ribbon} aria-label="Sampled public timeline markers">
              {positionedMarkers.map(({ marker, left, showLabel }, index) => {
                const text = markerText(marker);
                return (
                  <span
                    key={`${marker.kind}-${marker.date}-${index}`}
                    className={`${styles.marker} ${
                      marker.kind === "flow" ? styles.flowMarker : styles.tradeMarker
                    }`}
                    style={{ left: `${left}%` }}
                    aria-label={`${formatDate(marker.date)} — ${text}`}
                    title={`${formatDate(marker.date)} — ${text}`}
                  >
                    <b aria-hidden="true">{markerGlyph(marker)}</b>
                    {showLabel ? (
                      <span className={styles.markerLabel} aria-hidden="true">
                        {text}
                      </span>
                    ) : null}
                  </span>
                );
              })}
            </div>
          </>
        ) : (
          <p className={styles.empty}>The timeline appears after the first funded snapshot.</p>
        )}
      </figure>

      <ul className={styles.facts}>
        {allTimeHigh ? (
          <li>
            {allTimeHigh.pct === 0
              ? "At its all-time high."
              : `${formatPercent(Math.abs(allTimeHigh.pct), 1)} below its peak, reached ${formatDate(allTimeHigh.peakDate)}.`}
          </li>
        ) : null}
        {bestDay ? (
          <li>Best day: {formatSignedPercent(bestDay.r, 1)} on {formatDate(bestDay.date)}.</li>
        ) : null}
        {worstDay ? (
          <li>Worst day: {formatSignedPercent(worstDay.r, 1)} on {formatDate(worstDay.date)}.</li>
        ) : null}
      </ul>

      {allMarkers.length > 0 ? (
        <details className={styles.details}>
          <summary>View all public timeline events</summary>
          <div className={styles.tableScroll}>
            <table>
              <caption>Complete dollar-safe flow and trade marker record.</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Event</th>
                </tr>
              </thead>
              <tbody>
                {allMarkers.map((marker, index) => (
                  <tr key={`${marker.kind}-${marker.date}-${index}`}>
                    <th scope="row">{formatDate(marker.date)}</th>
                    <td>{markerText(marker)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}

      {compositionHistory.points.length > 0 && compositionLabels.length > 0 ? (
        <details className={styles.details}>
          <summary>View composition over time</summary>
          <div className={styles.composition}>
            <p>Weight by ticker on each retained snapshot date.</p>
            <ul className={styles.compositionLegend}>
              {compositionLabels.map((ticker) => <li key={ticker}>{ticker}</li>)}
            </ul>
            <ol>
              {compositionHistory.points.map((point) => (
                <li key={String(point.date)}>
                  <time>{formatDate(String(point.date))}</time>
                  <span className={styles.stack} aria-hidden="true">
                    {compositionLabels.map((ticker, index) => (
                      <i
                        key={ticker}
                        style={{
                          width: `${Number(point[ticker] ?? 0)}%`,
                          "--composition-index": index,
                        } as React.CSSProperties}
                      />
                    ))}
                  </span>
                  <span className={styles.srOnly}>
                    {compositionLabels.map((ticker) =>
                      `${ticker} ${Number(point[ticker] ?? 0).toFixed(1)}%`,
                    ).join(", ")}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </details>
      ) : null}

      <Link
        className={styles.continuation}
        href={observatoryChapterHref("/share", "lab")}
      >
        Open Lab
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
