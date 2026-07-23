import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getStockDetailData } from "@/lib/stock-data";
import { LoginForm } from "@/components/auth/LoginForm";
import { NavBar } from "@/components/layout/NavBar";
import { StockHeader } from "@/components/stock/StockHeader";
import { StockPriceChart } from "@/components/stock/StockPriceChart";
import { FundamentalsRow } from "@/components/stock/FundamentalsRow";
import { AnalystConsensus } from "@/components/stock/AnalystConsensus";
import { StockNews } from "@/components/stock/StockNews";
import { CorrelationRow } from "@/components/stock/CorrelationRow";
import { StatCard } from "@/components/ui/StatCard";
import { formatCurrency, formatSignedPercent } from "@/lib/format";

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

  const hasRecommendation = data.recommendation !== null && data.recommendation.length > 0;

  return (
    <>
      <NavBar variant="private" />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="space-y-8">
          <StockHeader
            ticker={data.ticker}
            sector={data.sector}
            aiExposure={data.aiExposure}
            value={data.value}
            shares={data.shares}
            weight={data.weight}
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Since purchase"
              value={data.gain !== null ? data.gain : "—"}
              format={data.gain !== null ? "signedUsd" : undefined}
              sublabel={data.gainPct !== null ? formatSignedPercent(data.gainPct, 1) : undefined}
            />
            <StatCard
              label="Day"
              value={data.day !== null ? data.day : "—"}
              format={data.day !== null ? "signedUsd" : undefined}
              sublabel={data.dayPct !== null ? formatSignedPercent(data.dayPct, 2) : undefined}
            />
            <StatCard
              label="Cost basis"
              value={data.costBasis}
              format="usd"
              sublabel={`${formatCurrency(data.costPerShare)}/share`}
            />
            <StatCard
              label="Contribution"
              value={data.contribution !== null ? data.contribution : "—"}
              format={data.contribution !== null ? "signedPct" : undefined}
            />
          </div>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Price since purchase
            </h2>
            <StockPriceChart data={data.priceHistory} costPerShare={data.costPerShare} />
          </section>

          <FundamentalsRow metric={data.metric} price={data.price} positionValue={data.value} />

          {hasRecommendation && <AnalystConsensus trend={data.recommendation![0]} />}

          {data.news.length > 0 && <StockNews items={data.news} />}

          <CorrelationRow cells={data.correlationRow} />
        </div>
      </div>
    </>
  );
}
