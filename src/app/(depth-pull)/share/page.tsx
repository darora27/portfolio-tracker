import type { Metadata } from "next";
import { getDashboardData } from "@/lib/dashboard-data";
import { formatDate } from "@/lib/format";
import { ObservatoryShell } from "@/components/observatory/ObservatoryShell";
import { PulseChapter } from "@/components/observatory/PulseChapter";
import { resolveObservatoryChapter } from "@/lib/observatory/chapters";

// Public, read-only, no login — same staleness posture as /share/full.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Portfolio — Share View",
  description: "A read-only look at portfolio performance.",
  robots: { index: false, follow: false },
};

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ chapter?: string | string[] }>;
}) {
  const data = await getDashboardData();
  const params = await searchParams;
  const active = resolveObservatoryChapter(params.chapter);
  const voo = data.benchmarkComparisons.find((comparison) => comparison.ticker === "VOO") ?? {
    available: false,
    twrPct: null,
    excessReturnPct: null,
  };

  return (
    <ObservatoryShell
      mode="public"
      basePath="/share"
      activeChapterId={active.id}
      title="Portfolio Observatory"
      freshness={{
        label: "Prices as of",
        value: formatDate(data.dailyChangeAsOf),
        stale: data.pricesAsOf === null,
      }}
      chapterContent={{
        pulse: (
          <PulseChapter
            historyDays={data.historyDays}
            portfolioTwrPct={data.twrPct}
            benchmark={{
              available: voo.available,
              twrPct: voo.twrPct,
              excessReturnPct: voo.excessReturnPct,
            }}
            chartData={data.chartData.map(({ date, portfolioIndex, vooIndex }) => ({
              date,
              portfolioIndex,
              vooIndex,
            }))}
            positions={data.positionRows.map(({ ticker, contribution }) => ({ ticker, contribution }))}
          />
        ),
      }}
    />
  );
}
