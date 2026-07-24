import Link from "next/link";
import { MetricExplain } from "@/components/observatory/MetricExplain";
import { formatNumber, formatPercent } from "@/lib/format";
import { observatoryChapterHref } from "@/lib/observatory/chapters";
import {
  hhiExplanation,
  type MetricExplanationId,
} from "@/lib/observatory/metric-explanations";
import {
  mostCorrelatedPair,
  structureConcentrationCopy,
} from "@/lib/observatory/structure-copy";
import styles from "./structure-chapter.module.css";

type Weight = { label: string; weight: number };

export type StructureChapterProps = {
  basePath: string;
  preservedQuery?: Record<string, string>;
  explainOpenId?: MetricExplanationId;
  pricesAsOf: string | null;
  dailyChangeAsOf: string;
  hhi: number;
  top2ConcentrationPct: number;
  positions: { ticker: string; weight: number }[];
  sectorWeights: Weight[];
  aiExposureWeights: Weight[];
  correlationTickers: string[];
  correlationCells: (number | null)[][];
};

export function StructureChapter({
  basePath,
  preservedQuery,
  explainOpenId,
  pricesAsOf,
  dailyChangeAsOf,
  hhi,
  top2ConcentrationPct,
  positions,
  sectorWeights,
  aiExposureWeights,
  correlationTickers,
  correlationCells,
}: StructureChapterProps) {
  const largestWeight = Math.max(
    ...positions.map((position) => position.weight),
    0.0001,
  );
  const correlated = mostCorrelatedPair(
    correlationTickers,
    correlationCells,
  );

  return (
    <div className={styles.chapter}>
      <p className={styles.eyebrow}>Exposure plate</p>
      <p className={styles.lead}>
        {structureConcentrationCopy(hhi, top2ConcentrationPct)}
      </p>

      <MetricExplain
        explanation={hhiExplanation({
          hhi,
          top2ConcentrationPct,
          positions,
          pricesAsOf,
          dailyChangeAsOf,
        })}
        permalink={observatoryChapterHref(basePath, "structure", {
          ...preservedQuery,
          explain: "hhi",
        })}
        initiallyOpen={explainOpenId === "hhi"}
      />

      <figure className={styles.weights}>
        <figcaption>Portfolio weight by holding, largest first</figcaption>
        {positions.length > 0 ? (
          <ol>
            {positions.map((position) => (
              <li key={position.ticker}>
                <span>{position.ticker}</span>
                <i
                  aria-hidden="true"
                  style={{
                    width: `${Math.max((position.weight / largestWeight) * 100, 1.5)}%`,
                  }}
                />
                <strong>{formatPercent(position.weight, 1)}</strong>
              </li>
            ))}
          </ol>
        ) : (
          <p className={styles.empty}>Position weights appear after the portfolio is funded.</p>
        )}
      </figure>

      <ul className={styles.facts}>
        {sectorWeights[0] ? (
          <li>
            {sectorWeights[0].label} is the largest sector at{" "}
            {formatPercent(sectorWeights[0].weight, 1)}.
          </li>
        ) : null}
        {aiExposureWeights[0] ? (
          <li>
            {aiExposureWeights[0].label} is the largest AI-exposure band at{" "}
            {formatPercent(aiExposureWeights[0].weight, 1)}.
          </li>
        ) : null}
        {correlated ? (
          <li>
            {correlated.a} and {correlated.b} are the most correlated holdings (
            {formatNumber(correlated.correlation, 2)}).
          </li>
        ) : null}
      </ul>

      {correlationTickers.length > 0 ? (
        <details className={styles.details}>
          <summary>View the correlation matrix</summary>
          <div className={styles.tableScroll}>
            <table>
              <caption>Pairwise holding correlation; unavailable cells lack enough overlapping history.</caption>
              <thead>
                <tr>
                  <th scope="col">Ticker</th>
                  {correlationTickers.map((ticker) => (
                    <th scope="col" key={ticker}>{ticker}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlationTickers.map((ticker, rowIndex) => (
                  <tr key={ticker}>
                    <th scope="row">{ticker}</th>
                    {correlationTickers.map((columnTicker, columnIndex) => {
                      const value = correlationCells[rowIndex]?.[columnIndex];
                      return (
                        <td key={columnTicker}>
                          {value === null || value === undefined
                            ? "Not enough overlap"
                            : formatNumber(value, 2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}

      <Link
        className={styles.continuation}
        href={observatoryChapterHref(basePath, "timeline", preservedQuery)}
      >
        Open Timeline
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
