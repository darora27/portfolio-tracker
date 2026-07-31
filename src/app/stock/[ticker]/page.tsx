import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getStockDetailData } from "@/lib/stock-data";
import { LoginForm } from "@/components/auth/LoginForm";
import { NavBar } from "@/components/layout/NavBar";
import { ChartRoomHeader } from "@/components/observatory/chart-room/ChartRoomHeader";
import { ChartRoomGraph } from "@/components/observatory/chart-room/ChartRoomGraph";
import { DistributionBench } from "@/components/observatory/chart-room/DistributionBench";
import { VsMarketBench } from "@/components/observatory/chart-room/VsMarketBench";
import { DepthBench } from "@/components/observatory/chart-room/DepthBench";
import { MovesWithBench } from "@/components/observatory/chart-room/MovesWithBench";
import { ContributionBench } from "@/components/observatory/chart-room/ContributionBench";
import { CompanyBench } from "@/components/observatory/chart-room/CompanyBench";
import chartRoomStyles from "@/components/observatory/chart-room/chart-room.module.css";
import { companyNameForTicker } from "@/lib/observatory/orrery";
import { priceReturns } from "@/lib/math/returns";
import { trailingReturn } from "@/lib/portfolio/trailing-return";
import { daysBetween, todayInTimeZone } from "@/lib/date";

// Reflects live DB + Finnhub state, never static. Owner-gated — never
// part of the public /share surface.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticker: string }>;
}): Promise<Metadata> {
  const { ticker } = await params;
  return {
    title: `${ticker.toUpperCase()} — Portfolio Tracker`,
    robots: { index: false, follow: false },
  };
}

export default async function StockDetailPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker: rawTicker } = await params;
  const ticker = rawTicker.toUpperCase();

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
        <p className="mt-1 text-sm text-text-secondary">Sign in to view this position.</p>
        <LoginForm />
      </div>
    );
  }

  const data = await getStockDetailData(ticker);
  if (!data) notFound();

  const priceIndexHistory = data.priceHistory.map((p) => ({ date: p.date, index: p.price }));
  const weeklyReturn = trailingReturn(priceIndexHistory, 7);
  const monthlyReturn = trailingReturn(priceIndexHistory, 30);
  const today = todayInTimeZone("America/New_York");
  const earningsInDays = data.nextEarnings ? daysBetween(today, data.nextEarnings.date) : null;

  const firstTradeDate = data.firstTradeDate;
  const sinceBuyReturns = firstTradeDate
    ? data.dailyReturns.filter((r) => r.date >= firstTradeDate)
    : data.dailyReturns;
  const vooDailyReturns = priceReturns(data.vooCloseHistory);

  return (
    <>
      <NavBar variant="private" />
      <div className={chartRoomStyles.chartRoom}>
        <ChartRoomHeader
          ticker={data.ticker}
          companyName={companyNameForTicker(data.ticker)}
          dayPct={data.dayPct}
          weight={data.weight}
          weeklyReturn={weeklyReturn}
          monthlyReturn={monthlyReturn}
          sinceBuyPct={data.gainPct}
          earningsInDays={earningsInDays}
          sessionCount={data.priceHistory.length}
        />

        <main className={chartRoomStyles.main}>
          <ChartRoomGraph
            priceHistory={data.priceHistory}
            vooCloseHistory={data.vooCloseHistory}
            bookGrowthIndex={data.bookGrowthIndex}
            trades={data.trades}
            costPerShare={data.costPerShare}
            firstTradeDate={data.firstTradeDate}
          />

          <div className={chartRoomStyles.bench}>
            <DistributionBench dailyReturns={sinceBuyReturns} volatilityPct={data.volatilityPct} />
            <VsMarketBench
              dailyReturns={sinceBuyReturns}
              vooDailyReturns={vooDailyReturns}
              betaVsVoo={data.betaVsVoo}
              correlationWithVoo={data.correlationWithVoo}
            />
            <DepthBench dailyReturns={sinceBuyReturns} />
            <MovesWithBench ticker={data.ticker} correlationRow={data.correlationRow} />
          </div>

          <div className={chartRoomStyles.plates}>
            <ContributionBench
              ticker={data.ticker}
              contributionRanking={data.contributionRanking}
              value={data.value}
              costBasis={data.costBasis}
              day={data.day}
              gain={data.gain}
            />
            <CompanyBench
              metric={data.metric}
              price={data.price}
              recommendation={data.recommendation?.[0] ?? null}
              news={data.news}
            />
          </div>
        </main>
      </div>
    </>
  );
}
