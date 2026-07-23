import type { RecommendationTrend } from "@/lib/finnhub-recommendation";
import { Card } from "@/components/ui/Card";
import { formatMonthYear } from "@/lib/format";

const SEGMENTS: { key: keyof Omit<RecommendationTrend, "period">; color: string; opacity?: number }[] = [
  { key: "strongBuy", color: "var(--gain)" },
  { key: "buy", color: "var(--gain)", opacity: 0.6 },
  { key: "hold", color: "var(--text-muted)" },
  { key: "sell", color: "var(--loss)", opacity: 0.6 },
  { key: "strongSell", color: "var(--loss)" },
];

/** Latest month's analyst consensus as a single stacked bar. Omitted entirely (by the caller) when there's no data. */
export function AnalystConsensus({ trend }: { trend: RecommendationTrend }) {
  const total = trend.strongBuy + trend.buy + trend.hold + trend.sell + trend.strongSell;
  const buyTotal = trend.strongBuy + trend.buy;
  const sellTotal = trend.sell + trend.strongSell;

  return (
    <Card>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
        Analyst consensus
      </h3>
      {total === 0 ? (
        <p className="mt-2 text-sm text-text-muted">No analyst coverage this month.</p>
      ) : (
        <>
          <div className="mt-3 flex h-3 overflow-hidden rounded-full">
            {SEGMENTS.map(({ key, color, opacity }) =>
              trend[key] > 0 ? (
                <div
                  key={key}
                  style={{ width: `${(trend[key] / total) * 100}%`, backgroundColor: color, opacity }}
                />
              ) : null,
            )}
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            {buyTotal} Buy &middot; {trend.hold} Hold &middot; {sellTotal} Sell ({formatMonthYear(trend.period)})
          </p>
        </>
      )}
    </Card>
  );
}
