import { StatCard } from "@/components/ui/StatCard";
import { formatSignedCurrency, formatSignedPercent } from "@/lib/format";

export function RealizedUnrealized({
  realizedGain,
  unrealizedGain,
  totalCost,
  hideDollars = false,
}: {
  realizedGain: number;
  unrealizedGain: number;
  totalCost: number;
  hideDollars?: boolean;
}) {
  const combined = realizedGain + unrealizedGain;
  const realizedPct = totalCost !== 0 ? realizedGain / totalCost : 0;
  const unrealizedPct = totalCost !== 0 ? unrealizedGain / totalCost : 0;
  const combinedPct = totalCost !== 0 ? combined / totalCost : 0;

  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
        Realized / unrealized
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Realized"
          value={hideDollars ? realizedPct : realizedGain}
          format={hideDollars ? "signedPct" : "signedUsd"}
        />
        <StatCard
          label="Unrealized"
          value={hideDollars ? unrealizedPct : unrealizedGain}
          format={hideDollars ? "signedPct" : "signedUsd"}
        />
      </div>
      <p className="mt-2 text-xs text-text-secondary">
        Combined: {hideDollars ? formatSignedPercent(combinedPct) : formatSignedCurrency(combined)}
      </p>
    </section>
  );
}
