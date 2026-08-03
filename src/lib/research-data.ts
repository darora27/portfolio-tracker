import { supabase } from "@/lib/supabase/client";
import { getMarketNews, getCompanyNews, getInsiderTransactions, type NewsItem, type InsiderTransaction } from "@/lib/finnhub";
import { sentimentLean, type SentimentLean } from "@/lib/research/sentiment";
import { netInsiderCount } from "@/lib/finnhub-insider";
import { computeHoldings } from "@/lib/portfolio/holdings";

export type TickerResearchRow = {
  ticker: string;
  newsCount24h: number;
  newsLean: SentimentLean;
  insiderNet90d: number;
  insiderTransactions: InsiderTransaction[];
  /* R7 Aug: `agreementRing` is gone with Reddit. It marked a row where NEWS
     lean and REDDIT lean agreed — a cross-source signal needs two sources,
     and there is only one now. Kept as a comment rather than silently
     dropped, because a reader finding "cross-source" in the copy should be
     able to see where it went. */
};

export type ResearchData = {
  marketNews: NewsItem[];
  rows: TickerResearchRow[];
};

function aggregateLean(scores: number[]): SentimentLean {
  const total = scores.reduce((a, b) => a + b, 0);
  return total > 0 ? "positive" : total < 0 ? "negative" : "neutral";
}

/** All computed /research data — owner-gated, never linked from any share surface. */
export async function getResearchData(): Promise<ResearchData> {
  const { data: trades, error } = await supabase.from("trades").select("*");
  if (error) throw error;
  const heldTickers = computeHoldings(trades ?? [], new Map()).map((p) => p.ticker);

  const nowSeconds = Math.floor(Date.now() / 1000);
  const cutoff24h = nowSeconds - 24 * 60 * 60;

  const [marketNews, newsByTicker, insiderByTicker] = await Promise.all([
    getMarketNews(12),
    // Reuses the existing Phase 8 per-ticker fetch (24h cache, ~14d/5-item
    // window) as-is per PHASE9.md §4, rather than a second fetch — the
    // 24h count below just filters its results by datetime.
    Promise.all(heldTickers.map((t) => getCompanyNews(t))),
    Promise.all(heldTickers.map((t) => getInsiderTransactions(t, 90))),
  ]);

  const rows: TickerResearchRow[] = heldTickers.map((ticker, i) => {
    const news24h = newsByTicker[i].filter((n) => n.datetime >= cutoff24h);
    const newsLean = news24h.length > 0 ? aggregateLean(news24h.map((n) => sentimentLean(n.headline).score)) : "neutral";
    const insiderTransactions = insiderByTicker[i];

    return {
      ticker,
      newsCount24h: news24h.length,
      newsLean,
      insiderNet90d: netInsiderCount(insiderTransactions),
      insiderTransactions,
    };
  });

  return { marketNews, rows };
}
