import { supabase } from "@/lib/supabase/client";
import { getMarketNews, getCompanyNews, getInsiderTransactions, type NewsItem, type InsiderTransaction } from "@/lib/finnhub";
import { getRecentRedditPosts, isRedditConfigured } from "@/lib/server/reddit";
import { sentimentLean, type SentimentLean } from "@/lib/research/sentiment";
import { countTickerMentions, filterToLast24h } from "@/lib/research/reddit-mentions";
import { netInsiderCount } from "@/lib/finnhub-insider";
import { computeHoldings } from "@/lib/portfolio/holdings";

export type TickerResearchRow = {
  ticker: string;
  newsCount24h: number;
  newsLean: SentimentLean;
  /** null when Reddit isn't configured — render "pending", not a zero. */
  redditMentions24h: number | null;
  redditLean: SentimentLean | null;
  insiderNet90d: number;
  insiderTransactions: InsiderTransaction[];
  /** News lean and Reddit lean agree and are both nonzero. */
  agreementRing: boolean;
};

export type ResearchData = {
  redditConfigured: boolean;
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
  const redditConfigured = isRedditConfigured();

  const [marketNews, newsByTicker, insiderByTicker, rawRedditPosts] = await Promise.all([
    getMarketNews(12),
    // Reuses the existing Phase 8 per-ticker fetch (24h cache, ~14d/5-item
    // window) as-is per PHASE9.md §4, rather than a second fetch — the
    // 24h count below just filters its results by datetime.
    Promise.all(heldTickers.map((t) => getCompanyNews(t))),
    Promise.all(heldTickers.map((t) => getInsiderTransactions(t, 90))),
    redditConfigured ? getRecentRedditPosts() : Promise.resolve([]),
  ]);

  const recentRedditPosts = filterToLast24h(rawRedditPosts, nowSeconds);

  const rows: TickerResearchRow[] = heldTickers.map((ticker, i) => {
    const news24h = newsByTicker[i].filter((n) => n.datetime >= cutoff24h);
    const newsLean = news24h.length > 0 ? aggregateLean(news24h.map((n) => sentimentLean(n.headline).score)) : "neutral";
    const insiderTransactions = insiderByTicker[i];

    let redditMentions24h: number | null = null;
    let redditLean: SentimentLean | null = null;
    if (redditConfigured) {
      redditMentions24h = countTickerMentions(recentRedditPosts, ticker);
      const mentioningPosts = recentRedditPosts.filter((p) => countTickerMentions([p], ticker) > 0);
      redditLean =
        mentioningPosts.length > 0 ? aggregateLean(mentioningPosts.map((p) => sentimentLean(p.title).score)) : "neutral";
    }

    const agreementRing = redditLean !== null && newsLean !== "neutral" && newsLean === redditLean;

    return {
      ticker,
      newsCount24h: news24h.length,
      newsLean,
      redditMentions24h,
      redditLean,
      insiderNet90d: netInsiderCount(insiderTransactions),
      insiderTransactions,
      agreementRing,
    };
  });

  return { redditConfigured, marketNews, rows };
}
