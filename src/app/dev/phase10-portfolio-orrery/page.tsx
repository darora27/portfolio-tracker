import { cookies } from "next/headers";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";
import { OrreryWorld } from "./OrreryWorld";

export const metadata: Metadata = {
  title: "Phase 10 §7 — Portfolio Orrery",
  robots: { index: false, follow: false },
};

export default async function PortfolioOrreryPage({
  searchParams,
}: {
  searchParams: Promise<{
    holding?: string | string[];
    focus?: string | string[];
    no3d?: string | string[];
  }>;
}) {
  const ownerPassword = process.env.OWNER_PASSWORD;
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = ownerPassword ? isValidSession(session, ownerPassword) : false;

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="mt-3 text-xl font-semibold text-text-primary">
          Phase 10 §7 — Portfolio Orrery
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Sign in to view.</p>
        <LoginForm />
      </div>
    );
  }

  const [data, params] = await Promise.all([getDashboardData(), searchParams]);
  const holdingParam = Array.isArray(params.holding) ? params.holding[0] : params.holding;
  const selectedTicker = data.publicOrreryHoldings.some(
    (holding) => holding.ticker === holdingParam,
  )
    ? holdingParam ?? null
    : null;
  const focusParam = Array.isArray(params.focus) ? params.focus[0] : params.focus;
  const no3dParam = Array.isArray(params.no3d) ? params.no3d[0] : params.no3d;
  const voo = data.benchmarkComparisons.find((comparison) => comparison.ticker === "VOO");

  return (
    <OrreryWorld
      holdings={data.publicOrreryHoldings}
      selectedTicker={selectedTicker}
      portfolioSelected={focusParam === "portfolio"}
      forceNo3d={no3dParam === "1"}
      portfolioSummary={{
        returnPct: data.twrPct,
        marketRelativePct: voo?.excessReturnPct ?? null,
        topTwoWeight: data.top2ConcentrationPct,
      }}
    />
  );
}
