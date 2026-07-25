import { Card } from "@/components/ui/Card";
import { ConcentrationMeter } from "@/components/dashboard/ConcentrationMeter";
import { MetricDisclosure } from "@/components/dashboard/MetricDisclosure";
import { formatDate, formatNumber, formatPercent, formatSignedPercent } from "@/lib/format";
import { dashboardViewHref } from "@/lib/dashboard-hierarchy";
import type { DatedReturn, Streak } from "@/lib/math/daily-stats";
import {
  betaExplanation,
  maxDrawdownExplanation,
  sharpeExplanation,
  sortinoExplanation,
  volatilityExplanation,
  type MetricExplanationId,
} from "@/lib/observatory/metric-explanations";

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{label}</div>
      <div className="mt-1 font-mono text-xl font-bold text-text-primary">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-text-secondary">{sub}</div>}
    </Card>
  );
}

export function RiskPanel({
  volatilityPct,
  maxDrawdownPct,
  sharpe,
  betaVsVoo,
  top2ConcentrationPct,
  hhi,
  sortinoRatio,
  bestDay,
  worstDay,
  winRatePct,
  currentStreak,
  historyDays,
  dailyChangeAsOf,
  pricesAsOf,
  explainOpenId,
}: {
  volatilityPct: number | null;
  maxDrawdownPct: number;
  sharpe: number | null;
  betaVsVoo: number | null;
  top2ConcentrationPct: number;
  hhi: number;
  sortinoRatio: number | null;
  bestDay: DatedReturn | null;
  worstDay: DatedReturn | null;
  winRatePct: number;
  currentStreak: Streak | null;
  /**
   * Dashboard-only explanation inputs. They remain optional so the accepted
   * /share/full compatibility route keeps its existing compact RiskPanel
   * exactly as required by §6's explicit out-of-scope boundary.
   */
  historyDays?: number;
  dailyChangeAsOf?: string;
  pricesAsOf?: string | null;
  explainOpenId?: MetricExplanationId;
}) {
  const explanationsEnabled =
    historyDays !== undefined && dailyChangeAsOf !== undefined;

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Risk</h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {explanationsEnabled ? (
          <>
            <MetricDisclosure
              explanation={volatilityExplanation({
                volatilityPct,
                historyDays,
                dailyChangeAsOf,
                pricesAsOf: pricesAsOf ?? null,
              })}
              permalink={`${dashboardViewHref("analytics", { explain: "volatility" })}#risk`}
              initiallyOpen={explainOpenId === "volatility"}
            />
            <MetricDisclosure
              explanation={maxDrawdownExplanation({
                maxDrawdown: maxDrawdownPct,
                historyDays,
                dailyChangeAsOf,
                pricesAsOf: pricesAsOf ?? null,
              })}
              permalink={`${dashboardViewHref("analytics", { explain: "max-drawdown" })}#risk`}
              initiallyOpen={explainOpenId === "max-drawdown"}
            />
            <MetricDisclosure
              explanation={sharpeExplanation({
                sharpe,
                historyDays,
                dailyChangeAsOf,
                pricesAsOf: pricesAsOf ?? null,
              })}
              permalink={`${dashboardViewHref("analytics", { explain: "sharpe" })}#risk`}
              initiallyOpen={explainOpenId === "sharpe"}
            />
            <MetricDisclosure
              explanation={betaExplanation({
                betaVsVoo,
                historyDays,
                dailyChangeAsOf,
                pricesAsOf: pricesAsOf ?? null,
              })}
              permalink={`${dashboardViewHref("analytics", { explain: "beta" })}#risk`}
              initiallyOpen={explainOpenId === "beta"}
            />
          </>
        ) : (
          <>
            <Metric
              label="Volatility (ann.)"
              value={volatilityPct !== null ? formatPercent(volatilityPct, 1) : "—"}
              sub={volatilityPct === null ? "Needs at least 2 daily returns" : undefined}
            />
            <Metric label="Max drawdown" value={formatSignedPercent(maxDrawdownPct, 1)} />
            <Metric
              label="Sharpe"
              value={sharpe !== null ? formatNumber(sharpe) : "—"}
              sub={sharpe === null ? "Needs at least 2 daily returns" : undefined}
            />
            <Metric
              label="Beta vs VOO"
              value={betaVsVoo !== null ? formatNumber(betaVsVoo) : "—"}
              sub={betaVsVoo === null ? "Needs a full-history VOO benchmark match" : undefined}
            />
          </>
        )}
        <Metric label="Top-2 concentration" value={formatPercent(top2ConcentrationPct, 1)} />
        <ConcentrationMeter hhi={hhi} />
        {explanationsEnabled ? (
          <MetricDisclosure
            explanation={sortinoExplanation({
              sortinoRatio,
              historyDays,
              dailyChangeAsOf,
              pricesAsOf: pricesAsOf ?? null,
            })}
            permalink={`${dashboardViewHref("analytics", { explain: "sortino" })}#risk`}
            initiallyOpen={explainOpenId === "sortino"}
          />
        ) : (
          <Metric label="Sortino" value={sortinoRatio !== null ? formatNumber(sortinoRatio) : "—"} />
        )}
        <Metric
          label="Best day"
          value={bestDay !== null ? formatSignedPercent(bestDay.r, 2) : "—"}
          sub={bestDay !== null ? formatDate(bestDay.date) : undefined}
        />
        <Metric
          label="Worst day"
          value={worstDay !== null ? formatSignedPercent(worstDay.r, 2) : "—"}
          sub={worstDay !== null ? formatDate(worstDay.date) : undefined}
        />
        <Metric label="Win rate" value={formatPercent(winRatePct, 1)} />
        <Metric
          label="Current streak"
          value={currentStreak !== null ? `${currentStreak.n} ${currentStreak.dir}` : "—"}
          sub={currentStreak !== null ? `${currentStreak.n === 1 ? "day" : "days"} in a row` : undefined}
        />
      </div>
    </section>
  );
}
