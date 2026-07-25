import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";
import { LoginForm } from "@/components/auth/LoginForm";
import { NavBar } from "@/components/layout/NavBar";
import { LiveQuotesProvider } from "@/components/dashboard/LiveQuotesProvider";
import { LiveHeadlineStats } from "@/components/dashboard/LiveHeadlineStats";
import { DashboardModeSwitcher } from "@/components/dashboard/DashboardModeSwitcher";
import { HowAmIDoingMode } from "@/components/dashboard/HowAmIDoingMode";
import { WhyMode } from "@/components/dashboard/WhyMode";
import { AttentionMode } from "@/components/dashboard/AttentionMode";
import { AllAnalyticsView } from "@/components/dashboard/AllAnalyticsView";
import { resolveDashboardView } from "@/lib/dashboard-hierarchy";
import { todayInTimeZone } from "@/lib/date";
import { resolveExplainParam } from "@/lib/observatory/metric-explanations";

// This dashboard reflects live DB state (trades can be added any time), so
// it must never be baked into a static build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — Portfolio Tracker",
  robots: { index: false, follow: false },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    mode?: string | string[];
    explain?: string | string[];
  }>;
}) {
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
        <Link href="/share" className="text-sm text-text-secondary hover:text-text-primary hover:underline">
          View public share page
        </Link>
        <h1 className="mt-3 text-xl font-semibold text-text-primary">Portfolio Tracker</h1>
        <p className="mt-1 text-sm text-text-secondary">Sign in to view the private dashboard.</p>
        <LoginForm />
      </div>
    );
  }

  const data = await getDashboardData();
  const params = await searchParams;
  const activeView = resolveDashboardView(params.mode);
  const explainOpenId = resolveExplainParam(params.explain);
  const preservedQuery = explainOpenId ? { explain: explainOpenId } : undefined;
  const today = todayInTimeZone("America/New_York");

  return (
    <>
      <NavBar variant="private" active="dashboard" />
      <LiveQuotesProvider initialPositions={data.positionRows}>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="space-y-8">
            <h1 className="text-xl font-semibold text-text-primary">Dashboard</h1>
            <LiveHeadlineStats
              totalCost={data.totalCost}
              simpleReturnPct={data.simpleReturnPct}
              dailyChangeAsOf={data.dailyChangeAsOf}
              twrPct={data.twrPct}
              xirrPct={data.xirrPct}
              historyDays={data.historyDays}
              pricesAsOf={data.pricesAsOf}
              allTimeHigh={data.allTimeHigh}
              netFlowsToday={data.netFlowsToday}
              prevSnapshotValue={data.prevSnapshotValue}
            />

            <DashboardModeSwitcher
              activeViewId={activeView.id}
              preservedQuery={preservedQuery}
            />

            {activeView.id === "how" ? <HowAmIDoingMode data={data} /> : null}
            {activeView.id === "why" ? <WhyMode data={data} /> : null}
            {activeView.id === "attention" ? (
              <AttentionMode data={data} today={today} />
            ) : null}
            {activeView.id === "analytics" ? (
              <AllAnalyticsView data={data} explainOpenId={explainOpenId} />
            ) : null}
          </div>
        </div>
      </LiveQuotesProvider>
    </>
  );
}
