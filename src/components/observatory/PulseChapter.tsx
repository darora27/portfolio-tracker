import Link from "next/link";
import { formatDate, formatNumber } from "@/lib/format";
import { observatoryChapterHref } from "@/lib/observatory/chapters";
import { pulseDriverCopy, pulseLeadCopy, windowLabel } from "@/lib/surface-copy";
import styles from "./pulse-chapter.module.css";

type PulseChartPoint = {
  date: string;
  portfolioIndex: number;
  vooIndex?: number;
};

export type PulseChapterProps = {
  historyDays: number;
  portfolioTwrPct: number;
  benchmark: {
    available: boolean;
    twrPct: number | null;
    excessReturnPct: number | null;
  };
  chartData: PulseChartPoint[];
  positions: { ticker: string; contribution: number | null }[];
};

const CHART_WIDTH = 720;
const CHART_HEIGHT = 210;
const CHART_PADDING = 16;

function sampledChartData(data: PulseChartPoint[]): PulseChartPoint[] {
  if (data.length <= 20) return data;
  const interval = Math.ceil((data.length - 2) / 18);
  const sample = [data[0]];
  for (let index = interval; index < data.length - 1; index += interval) {
    sample.push(data[index]);
  }
  sample.push(data[data.length - 1]);
  return sample;
}

function linePath(data: PulseChartPoint[], key: "portfolioIndex" | "vooIndex"): string | null {
  const available = data.filter(
    (point): point is PulseChartPoint & Record<typeof key, number> => typeof point[key] === "number",
  );
  if (available.length === 0) return null;

  const allValues = data.flatMap((point) =>
    [point.portfolioIndex, point.vooIndex].filter((value): value is number => typeof value === "number"),
  );
  const minimum = Math.min(...allValues);
  const maximum = Math.max(...allValues);
  const range = maximum - minimum || 1;
  const xRange = CHART_WIDTH - CHART_PADDING * 2;
  const yRange = CHART_HEIGHT - CHART_PADDING * 2;

  return available
    .map((point, index) => {
      const sourceIndex = data.indexOf(point);
      const x = CHART_PADDING + (sourceIndex / Math.max(data.length - 1, 1)) * xRange;
      const y = CHART_PADDING + ((maximum - point[key]) / range) * yRange;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export function PulseChapter({
  historyDays,
  portfolioTwrPct,
  benchmark,
  chartData,
  positions,
}: PulseChapterProps) {
  const firstFundedDate = chartData[0]?.date;
  const period = firstFundedDate ? windowLabel(firstFundedDate) : "since the first funded snapshot";
  const lead = pulseLeadCopy({
    historyDays,
    portfolioTwrPct,
    benchmark,
    windowLabel: period,
  });
  const driver = pulseDriverCopy({
    historyDays,
    benchmarkAvailable: benchmark.available,
    gapPct: benchmark.excessReturnPct,
    positions,
  });
  const portfolioPath = linePath(chartData, "portfolioIndex");
  const vooPath = linePath(chartData, "vooIndex");
  const tableRows = sampledChartData(chartData);

  return (
    <div className={styles.chapter}>
      <p className={styles.eyebrow}>Market-relative observation</p>
      <p className={styles.lead}>{lead}</p>
      {driver ? <p className={styles.driver}>{driver}</p> : null}
      <p className={styles.window}>Window: {period}</p>

      <figure className={styles.trajectory} aria-labelledby="pulse-trajectory-caption">
        <figcaption id="pulse-trajectory-caption" className={styles.chartCaption}>
          Portfolio and VOO, indexed to 100 over the same funded-history window
        </figcaption>
        <div className={styles.legend} aria-hidden="true">
          <span><i className={styles.portfolioKey} />Portfolio</span>
          {vooPath ? <span><i className={styles.vooKey} />VOO</span> : null}
        </div>
        {portfolioPath ? (
          <svg
            className={styles.chart}
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
            role="img"
            aria-label="Trajectory chart. The adjacent lead sentence summarizes the result; exact sampled values follow."
          >
            <line x1="16" x2="704" y1="105" y2="105" className={styles.midline} />
            {vooPath ? <path d={vooPath} className={styles.vooLine} /> : null}
            <path d={portfolioPath} className={styles.portfolioLine} />
          </svg>
        ) : (
          <p className={styles.emptyChart}>The trajectory will appear after the first funded snapshot.</p>
        )}
      </figure>

      {tableRows.length > 0 ? (
        <details className={styles.dataDetails}>
          <summary>View trajectory data</summary>
          <div className={styles.tableScroll}>
            <table>
              <caption>Deterministic sample of the indexed trajectory, including the first and latest dates.</caption>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Portfolio</th>
                  <th scope="col">VOO</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((point) => (
                  <tr key={point.date}>
                    <th scope="row">{formatDate(point.date)}</th>
                    <td>{formatNumber(point.portfolioIndex, 2)}</td>
                    <td>{point.vooIndex === undefined ? "Unavailable" : formatNumber(point.vooIndex, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}

      <Link className={styles.continuation} href={observatoryChapterHref("/share", "forces")}>
        Open Forces
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
