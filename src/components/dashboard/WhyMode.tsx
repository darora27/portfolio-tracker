import Link from "next/link";
import { ContributionChart } from "@/components/dashboard/ContributionChart";
import type { DashboardData } from "@/lib/dashboard-data";
import { dashboardViewHref } from "@/lib/dashboard-hierarchy";
import { formatSignedCurrency, formatSignedPercent } from "@/lib/format";
import { pulseDriverCopy } from "@/lib/surface-copy";

export type WhyModeProps = { data: DashboardData };

export function WhyMode({ data }: WhyModeProps) {
  const vooComparison = data.benchmarkComparisons.find(
    (comparison) => comparison.ticker === "VOO",
  ) ?? {
    available: false,
    twrPct: null,
    excessReturnPct: null,
  };
  const driver = pulseDriverCopy({
    historyDays: data.historyDays,
    benchmarkAvailable: vooComparison.available,
    gapPct: vooComparison.excessReturnPct,
    positions: data.positionRows.map((position) => ({
      ticker: position.ticker,
      contribution: position.contribution,
    })),
  });
  const contributionEntries = data.positionRows
    .filter((position) => position.contribution !== null)
    .map((position) => ({
      ticker: position.ticker,
      contribution: position.contribution!,
    }));

  return (
    <section className="space-y-6" aria-labelledby="dashboard-why-heading">
      <div className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-text-secondary">
          Drivers
        </p>
        <h2 id="dashboard-why-heading" className="mt-2 text-2xl font-semibold text-text-primary">
          Why?
        </h2>
        {driver ? <p className="mt-3 text-lg leading-relaxed text-text-primary">{driver}</p> : null}
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Top winner
          </dt>
          <dd className="mt-1 font-mono text-lg font-bold text-text-primary">
            {data.winners[0]
              ? `${data.winners[0].ticker} ${formatSignedPercent(data.winners[0].gainPct, 1)}`
              : "No winners yet"}
          </dd>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Top loser
          </dt>
          <dd className="mt-1 font-mono text-lg font-bold text-text-primary">
            {data.losers[0]
              ? `${data.losers[0].ticker} ${formatSignedPercent(data.losers[0].gainPct, 1)}`
              : "No losers yet"}
          </dd>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Today&apos;s net flow
          </dt>
          <dd className="mt-1 font-mono text-lg font-bold text-text-primary">
            {data.netFlowsToday === 0
              ? "No new capital added today."
              : `${formatSignedCurrency(data.netFlowsToday)} net today.`}
          </dd>
        </div>
      </dl>

      <ContributionChart entries={contributionEntries} />

      <Link
        href={`${dashboardViewHref("analytics")}#holdings`}
        className="inline-flex min-h-[44px] items-center text-sm font-medium text-text-primary underline decoration-border-strong underline-offset-4 hover:decoration-accent"
      >
        Open Holdings analytics →
      </Link>
    </section>
  );
}
