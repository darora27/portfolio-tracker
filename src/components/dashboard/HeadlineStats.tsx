import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { formatDate, formatSignedPercent } from "@/lib/format";
import type { AllTimeHighInfo } from "@/lib/math/all-time-high";

export function HeadlineStats({
  totalValue,
  totalCost,
  simpleReturnPct,
  dailyChange,
  dailyChangePct,
  dailyChangeAsOf,
  twrPct,
  xirrPct,
  historyDays,
  pricesAsOf,
  allTimeHigh,
  hideDollars = false,
}: {
  totalValue: number;
  totalCost: number;
  simpleReturnPct: number;
  dailyChange: number;
  dailyChangePct: number;
  dailyChangeAsOf: string;
  twrPct: number;
  xirrPct: number;
  historyDays: number;
  pricesAsOf: string | null;
  allTimeHigh: AllTimeHighInfo | null;
  hideDollars?: boolean;
}) {
  const gain = totalValue - totalCost;
  const deemphasizeXirr = historyDays < 90;
  const atHigh = allTimeHigh !== null && allTimeHigh.pct === 0;

  return (
    <section>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {!hideDollars && (
          <>
            <StatCard
              label="Total value"
              value={totalValue}
              format="usd"
              sublabel={pricesAsOf ? `Prices as of ${formatDate(pricesAsOf)}` : "Prices unavailable"}
            />
            <StatCard label="Invested" value={totalCost} format="usd" />
          </>
        )}
        <StatCard
          label={hideDollars ? "Simple return" : "Gain / loss"}
          value={hideDollars ? simpleReturnPct : gain}
          format={hideDollars ? "signedPct" : "signedUsd"}
          sublabel={hideDollars ? undefined : `Simple return: ${formatSignedPercent(simpleReturnPct)}`}
        />
        <StatCard
          label="Daily change"
          value={hideDollars ? dailyChangePct : dailyChange}
          format={hideDollars ? "signedPct" : "signedUsd"}
          sublabel={
            hideDollars
              ? `As of ${formatDate(dailyChangeAsOf)}`
              : `${formatSignedPercent(dailyChangePct)} — as of ${formatDate(dailyChangeAsOf)}`
          }
        />
        <StatCard label="TWR (time-weighted)" value={twrPct} format="signedPct" />
        <StatCard
          label="XIRR (annualized)"
          value={xirrPct}
          format="signedPct"
          sublabel={deemphasizeXirr ? `Only ${historyDays}d of history — noisy` : undefined}
          muted={deemphasizeXirr}
        />
        {allTimeHigh && (
          <Card>
            <div className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              From all-time high
            </div>
            <div className={`mt-1 font-mono text-2xl font-bold ${atHigh ? "text-gain" : "text-loss"}`}>
              {atHigh ? "At all-time high" : formatSignedPercent(allTimeHigh.pct, 1)}
            </div>
            {!atHigh && (
              <div className="mt-1.5 text-xs text-text-secondary">{formatDate(allTimeHigh.peakDate)} peak</div>
            )}
          </Card>
        )}
      </div>
    </section>
  );
}
