import Link from "next/link";
import type { DashboardData } from "@/lib/dashboard-data";
import { dashboardViewHref } from "@/lib/dashboard-hierarchy";
import { buildAttentionItems } from "@/lib/observatory/briefing-copy";
import { todayLine } from "@/lib/surface-copy";

export type AttentionModeProps = {
  data: DashboardData;
  today: string;
};

export function AttentionMode({ data, today }: AttentionModeProps) {
  const items = buildAttentionItems({
    pricesStale: data.pricesAsOf === null,
    hhi: data.hhi,
    topMover: data.movers[0]
      ? { ticker: data.movers[0].ticker, dayPct: data.movers[0].dayPct }
      : null,
    upcomingEarnings: data.upcomingEarnings.map((event) => ({
      ticker: event.ticker,
      date: event.date,
    })),
    today,
  });
  const visibleItems = items.slice(0, 3);
  const remaining = items.length - visibleItems.length;
  const analyticsHref = `${dashboardViewHref("analytics")}#risk`;

  return (
    <section className="space-y-6" aria-labelledby="dashboard-attention-heading">
      <div className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-text-secondary">
          Review queue
        </p>
        <h2
          id="dashboard-attention-heading"
          className="mt-2 text-2xl font-semibold text-text-primary"
        >
          What deserves attention?
        </h2>
        <p className="mt-3 text-lg leading-relaxed text-text-primary">
          {todayLine({ dayReturn: data.dailyChangePct })}
        </p>
      </div>

      {visibleItems.length > 0 ? (
        <ul className="grid gap-3">
          {visibleItems.map((item) => (
            <li key={item.id} className="rounded-xl border border-border bg-surface">
              <Link
                href={item.href}
                className="flex min-h-[64px] items-center px-4 py-3 text-sm leading-relaxed text-text-primary hover:bg-surface-hover"
              >
                <strong className="mr-1">
                  {item.severity === "critical" ? "Critical: " : "Notice: "}
                </strong>
                {item.text}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-border bg-surface p-4 text-text-secondary">
          Nothing needs your attention right now.
        </p>
      )}

      {remaining > 0 ? (
        <Link
          href={analyticsHref}
          className="inline-flex min-h-[44px] items-center text-sm text-text-secondary underline decoration-border-strong underline-offset-4 hover:text-text-primary"
        >
          +{remaining} more in Risk &amp; Events analytics
        </Link>
      ) : null}

      <div>
        <Link
          href={analyticsHref}
          className="inline-flex min-h-[44px] items-center text-sm font-medium text-text-primary underline decoration-border-strong underline-offset-4 hover:decoration-accent"
        >
          Open Risk &amp; Events analytics →
        </Link>
      </div>
    </section>
  );
}
