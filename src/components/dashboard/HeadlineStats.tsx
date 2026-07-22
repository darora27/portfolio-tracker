import { StatCard } from "@/components/ui/StatCard";
import { formatDate, formatSignedPercent } from "@/lib/format";

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
  hideDollars?: boolean;
}) {
  const gain = totalValue - totalCost;
  const deemphasizeXirr = historyDays < 90;

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
      </div>
    </section>
  );
}
