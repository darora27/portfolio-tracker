import { supabase } from "@/lib/supabase/client";
import { getCompanyMetric, getRecommendationTrend, getCompanyNews } from "@/lib/finnhub";
import type { CompanyMetric } from "@/lib/finnhub-metric";
import type { RecommendationTrend } from "@/lib/finnhub-recommendation";
import type { NewsItem } from "@/lib/finnhub-news";
import { getDashboardData } from "@/lib/dashboard-data";
import aiExposureByTicker from "../../data/ai-exposure.json";

export type StockDetailData = {
  ticker: string;
  shares: number;
  price: number | null;
  priceAsOf: string | null;
  value: number;
  weight: number;
  costBasis: number;
  costPerShare: number;
  gain: number | null;
  gainPct: number | null;
  day: number | null;
  dayPct: number | null;
  contribution: number | null;
  sector: string | null;
  aiExposure: string | null;
  priceHistory: { date: string; price: number }[];
  metric: CompanyMetric | null;
  recommendation: RecommendationTrend[] | null;
  news: NewsItem[];
  correlationRow: { ticker: string; value: number | null }[];
};

/**
 * Everything the /stock/[ticker] detail page needs. Reuses the same
 * portfolio-wide computation as the dashboard (positions, correlation)
 * rather than re-deriving weight/contribution/day-change independently —
 * one source of truth for those numbers, at the cost of recomputing the
 * whole dashboard for a single-ticker page. Fine at this app's scale
 * (single owner, family-sized traffic).
 *
 * Returns null for a ticker that isn't currently held (never traded, or
 * fully sold out) — the caller renders a 404 rather than crashing on
 * missing position data.
 */
export async function getStockDetailData(ticker: string): Promise<StockDetailData | null> {
  const dashboard = await getDashboardData();
  const position = dashboard.positionRows.find((p) => p.ticker === ticker);
  if (!position) return null;

  const [{ data: sectorRow }, { data: snapshots }, { data: snapshotPositions }, metric, recommendation, news] =
    await Promise.all([
      supabase.from("ticker_sector").select("sector").eq("ticker", ticker).maybeSingle(),
      supabase.from("snapshots").select("id, date").order("date", { ascending: true }),
      supabase.from("snapshot_positions").select("snapshot_id, close_price").eq("ticker", ticker),
      getCompanyMetric(ticker),
      getRecommendationTrend(ticker),
      getCompanyNews(ticker),
    ]);

  const snapshotDateById = new Map((snapshots ?? []).map((s) => [s.id, s.date]));
  const priceHistory = (snapshotPositions ?? [])
    .map((row) => {
      const date = snapshotDateById.get(row.snapshot_id);
      return date ? { date, price: row.close_price } : null;
    })
    .filter((row): row is { date: string; price: number } => row !== null)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const aiExposureMap = new Map(Object.entries(aiExposureByTicker));

  const rowIndex = dashboard.correlationTickers.indexOf(ticker);
  const correlationRow =
    rowIndex >= 0
      ? dashboard.correlationTickers
          .map((t, i) => ({ ticker: t, value: dashboard.correlationCells[rowIndex][i] }))
          .filter((c) => c.ticker !== ticker)
      : [];

  return {
    ticker: position.ticker,
    shares: position.shares,
    price: position.price,
    priceAsOf: position.priceAsOf,
    value: position.value,
    weight: position.weight,
    costBasis: position.costBasis,
    costPerShare: position.shares !== 0 ? position.costBasis / position.shares : 0,
    gain: position.gain,
    gainPct: position.gainPct,
    day: position.day,
    dayPct: position.dayPct,
    contribution: position.contribution,
    sector: sectorRow?.sector ?? null,
    aiExposure: aiExposureMap.get(ticker) ?? null,
    priceHistory,
    metric,
    recommendation,
    news,
    correlationRow,
  };
}
