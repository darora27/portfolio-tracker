import type { CompanyMetric } from "@/lib/finnhub-metric";
import type { RecommendationTrend } from "@/lib/finnhub-recommendation";
import type { NewsItem } from "@/lib/finnhub-news";
import { formatDate, formatMarketCap, formatNumber, formatPercent } from "@/lib/format";
import styles from "./chart-room.module.css";

const CONSENSUS_SEGMENTS: { key: keyof Omit<RecommendationTrend, "period">; label: string; color: string }[] = [
  { key: "strongBuy", label: "SB", color: "#2BFF8C" },
  { key: "buy", label: "B", color: "#a9ffcf" },
  { key: "hold", label: "H", color: "var(--flat)" },
  { key: "sell", label: "S", color: "#ff9d97" },
  { key: "strongSell", label: "SS", color: "var(--loss)" },
];

/**
 * THE COMPANY — "public facts, one glance." Every value is the existing
 * metric/recommendation/news fields FundamentalsRow/AnalystConsensus/
 * StockNews already render -- new presentation, same data and the same
 * "no data -> designed empty copy, not an empty box" conditionals those
 * components already use.
 */
export function CompanyBench({
  metric,
  price,
  recommendation,
  news,
}: {
  metric: CompanyMetric | null;
  price: number | null;
  recommendation: RecommendationTrend | null;
  news: NewsItem[];
}) {
  const hasRange = metric?.week52Low !== null && metric?.week52High !== null && metric !== null;
  const total = recommendation
    ? recommendation.strongBuy + recommendation.buy + recommendation.hold + recommendation.sell + recommendation.strongSell
    : 0;

  return (
    <section className={styles.inst} aria-label="Company plate">
      <div className={styles.instHead}>
        <h2>THE COMPANY</h2>
        <span className={styles.q}>public facts, one glance</span>
      </div>

      {hasRange && metric && price !== null ? (
        <Range52 low={metric.week52Low!} high={metric.week52High!} price={price} />
      ) : (
        <p className={styles.empty}>No 52-week range available.</p>
      )}

      <div className={styles.facts}>
        <div className={styles.tile}>
          <span>P/E · TTM</span>
          <b>{metric?.peTTM !== null && metric?.peTTM !== undefined ? formatNumber(metric.peTTM, 1) : "—"}</b>
        </div>
        <div className={styles.tile}>
          <span>MKT CAP</span>
          <b>
            {metric?.marketCapMillions !== null && metric?.marketCapMillions !== undefined
              ? formatMarketCap(metric.marketCapMillions)
              : "—"}
          </b>
        </div>
        <div className={styles.tile}>
          <span>DIV YIELD</span>
          <b>
            {metric?.dividendYieldPct !== null && metric?.dividendYieldPct !== undefined
              ? formatPercent(metric.dividendYieldPct / 100, 2)
              : "—"}
          </b>
        </div>
      </div>

      {recommendation && total > 0 ? (
        <svg viewBox="0 0 620 54" role="img" aria-label="Analyst consensus">
          <text x={6} y={26}>ANALYSTS</text>
          <ConsensusBars trend={recommendation} total={total} />
        </svg>
      ) : (
        <p className={styles.empty}>No analyst coverage this month.</p>
      )}

      {news.length > 0 ? (
        <ol className={styles.newslist}>
          {news.slice(0, 3).map((item, i) => (
            <li key={`${item.url}-${i}`}>
              <time>{formatDate(new Date(item.datetime * 1000).toISOString().slice(0, 10))}</time>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.headline}
              </a>
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.empty}>No recent news.</p>
      )}
    </section>
  );
}

function Range52({ low, high, price }: { low: number; high: number; price: number }) {
  const L = 90;
  const R = 560;
  const x = (v: number) => L + ((v - low) / (high - low || 1)) * (R - L);
  return (
    <svg viewBox="0 0 620 56" role="img" aria-label="52-week range">
      <text x={6} y={26}>52W RANGE</text>
      <line x1={L} x2={R} y1={22} y2={22} stroke="rgba(213,186,140,.35)" strokeWidth={3} />
      <circle cx={x(price)} cy={22} r={5} fill="var(--baseline)" />
      <text x={L - 4} y={44}>{`$${low.toFixed(0)}`}</text>
      <text x={R - 24} y={44}>{`$${high.toFixed(0)}`}</text>
      <text x={x(price) - 24} y={10} fill="var(--cream)">{`$${price.toFixed(0)}`}</text>
    </svg>
  );
}

function ConsensusBars({ trend, total }: { trend: RecommendationTrend; total: number }) {
  let x = 90;
  return (
    <>
      {CONSENSUS_SEGMENTS.map(({ key, label, color }) => {
        const n = trend[key];
        const w = (n / total) * 470;
        const rect = n > 0 && (
          <g key={key}>
            <rect x={x} y={12} width={Math.max(w - 2, 1)} height={16} fill={color} opacity={0.85} />
            <text x={x + 2} y={44}>{`${label} ${n}`}</text>
          </g>
        );
        x += w;
        return rect;
      })}
    </>
  );
}
