import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";
import { LoginForm } from "@/components/auth/LoginForm";
import { SurfaceHeader } from "@/components/surface/SurfaceHeader";
import { SurfaceActs } from "@/components/surface/SurfaceActs";
import { weeklySubline, todayLine, riskLine } from "@/lib/surface-copy";

// Same reason as the moved /dashboard page: reflects live DB state, so it
// must never be baked into a static build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Portfolio Tracker",
  robots: { index: false, follow: false },
};

export default async function Home() {
  const ownerPassword = process.env.OWNER_PASSWORD;
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = ownerPassword ? isValidSession(session, ownerPassword) : false;

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
  // donutSlices mirrors `positions`, already sorted descending by
  // weight (see dashboard-data.ts) — the first entry is the top holding.
  const topHolding = data.donutSlices[0] ?? null;

  return (
    <>
      <SurfaceHeader variant="private" />
      <SurfaceActs
        mode="private"
        ownerLabel="Devan’s portfolio"
        heroValue={data.totalValue}
        weeklySublineText={
          data.twr7d !== null && data.voo7d !== null
            ? weeklySubline({ twr7d: data.twr7d, voo7d: data.voo7d })
            : "Building this week’s picture."
        }
        chartData={data.chartData}
        positionsCount={data.positionRows.length}
        topHoldingTicker={topHolding?.ticker ?? null}
        donutSlices={data.donutSlices}
        hhi={data.hhi}
        riskLineText={riskLine(data.hhi)}
        todayLineText={todayLine({ dayReturn: data.dailyChangePct })}
        topMover={data.movers[0] ?? null}
        primaryHref="/dashboard"
        primaryLabel="Open the full dashboard"
        orreryWeights={data.donutSlices.slice(0, 5).map((s) => s.weight)}
      />
    </>
  );
}
