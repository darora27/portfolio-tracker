import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";
import { LoginForm } from "@/components/auth/LoginForm";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { HeadlineStats } from "@/components/dashboard/HeadlineStats";
import { PositionsTable } from "@/components/dashboard/PositionsTable";
import { WinnersLosers } from "@/components/dashboard/WinnersLosers";
import { ValueChart } from "@/components/dashboard/ValueChart";
import { RiskPanel } from "@/components/dashboard/RiskPanel";
import { EarningsCalendar } from "@/components/dashboard/EarningsCalendar";

// This dashboard reflects live DB state (trades can be added any time), so
// it must never be baked into a static build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — Portfolio Tracker",
  robots: { index: false, follow: false },
};

export default async function Home() {
  const ownerPassword = process.env.OWNER_PASSWORD;
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = ownerPassword ? isValidSession(session, ownerPassword) : false;

  // This is the owner's full-detail private view (always shows dollar
  // amounts) — the public link to hand out is /share, which respects the
  // hide-dollars setting. Unauthenticated visitors get bounced here, not
  // shown the real numbers.
  if (!authenticated) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <Link href="/share" className="text-sm text-zinc-500 hover:underline">
          View public share page
        </Link>
        <h1 className="mt-3 text-xl font-semibold">Portfolio Tracker</h1>
        <p className="mt-1 text-sm text-zinc-500">Sign in to view the private dashboard.</p>
        <LoginForm />
      </div>
    );
  }

  const data = await getDashboardData();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Portfolio Tracker</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/share"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Share view
          </Link>
          <Link
            href="/trades"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Trade log
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="mt-8 space-y-10">
        <HeadlineStats
          totalValue={data.totalValue}
          totalCost={data.totalCost}
          simpleReturnPct={data.simpleReturnPct}
          dailyChange={data.dailyChange}
          dailyChangePct={data.dailyChangePct}
          dailyChangeAsOf={data.dailyChangeAsOf}
          twrPct={data.twrPct}
          xirrPct={data.xirrPct}
          historyDays={data.historyDays}
          pricesAsOf={data.pricesAsOf}
        />

        <ValueChart data={data.chartData} />

        <PositionsTable positions={data.positionRows} />

        <WinnersLosers winners={data.winners} losers={data.losers} />

        <EarningsCalendar events={data.upcomingEarnings} />

        <RiskPanel
          volatilityPct={data.volatilityPct}
          maxDrawdownPct={data.maxDrawdown}
          sharpe={data.sharpe}
          betaVsVoo={data.betaVsVoo}
          top2ConcentrationPct={data.top2ConcentrationPct}
          hhi={data.hhi}
        />
      </div>
    </div>
  );
}
