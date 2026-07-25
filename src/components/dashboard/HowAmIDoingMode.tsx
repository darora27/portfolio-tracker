import Link from "next/link";
import { ValueChart } from "@/components/dashboard/ValueChart";
import type { DashboardData } from "@/lib/dashboard-data";
import { dashboardViewHref } from "@/lib/dashboard-hierarchy";
import { formatSignedPercent } from "@/lib/format";
import { pulseLeadCopy, windowLabel } from "@/lib/surface-copy";

export type HowAmIDoingModeProps = { data: DashboardData };

export function HowAmIDoingMode({ data }: HowAmIDoingModeProps) {
  const vooComparison = data.benchmarkComparisons.find(
    (comparison) => comparison.ticker === "VOO",
  ) ?? {
    available: false,
    twrPct: null,
    excessReturnPct: null,
  };
  const period = data.chartData[0]?.date
    ? windowLabel(data.chartData[0].date)
    : "since the first funded snapshot";
  const lead = pulseLeadCopy({
    historyDays: data.historyDays,
    portfolioTwrPct: data.twrPct,
    benchmark: vooComparison,
    windowLabel: period,
  });

  return (
    <section className="space-y-6" aria-labelledby="dashboard-how-heading">
      <div className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-text-secondary">
          Performance
        </p>
        <h2 id="dashboard-how-heading" className="mt-2 text-2xl font-semibold text-text-primary">
          How am I doing?
        </h2>
        <p className="mt-3 text-lg leading-relaxed text-text-primary">{lead}</p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-wider text-text-secondary">TWR</dt>
          <dd className="mt-1 font-mono text-lg font-bold text-text-primary">
            {formatSignedPercent(data.twrPct, 2)}
          </dd>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Market gap
          </dt>
          <dd className="mt-1 font-mono text-lg font-bold text-text-primary">
            {vooComparison.excessReturnPct !== null
              ? `${formatSignedPercent(vooComparison.excessReturnPct, 2)} vs. VOO`
              : "VOO comparison unavailable"}
          </dd>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <dt className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Max drawdown
          </dt>
          <dd className="mt-1 font-mono text-lg font-bold text-text-primary">
            {formatSignedPercent(data.maxDrawdown, 1)}
          </dd>
        </div>
      </dl>

      <ValueChart data={data.chartData} />

      <Link
        href={`${dashboardViewHref("analytics")}#performance`}
        className="inline-flex min-h-[44px] items-center text-sm font-medium text-text-primary underline decoration-border-strong underline-offset-4 hover:decoration-accent"
      >
        Open Performance analytics →
      </Link>
    </section>
  );
}
