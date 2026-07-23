import "server-only";
import { parseQuoteResponse, type Quote } from "./finnhub-quote";
import { parseEarningsCalendarResponse, type EarningsEvent } from "./finnhub-earnings";
import { parseProfileResponse } from "./finnhub-sector";
import { parseMetricResponse, type CompanyMetric } from "./finnhub-metric";
import { parseRecommendationResponse, type RecommendationTrend } from "./finnhub-recommendation";
import { parseNewsResponse, type NewsItem } from "./finnhub-news";
import { addDays, todayInTimeZone } from "./date";
import { getOrFetch, FINNHUB_TTL } from "./server/finnhub-cache";

export type { Quote, EarningsEvent, CompanyMetric, RecommendationTrend, NewsItem };

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

/** A single live quote, or null on any failure (down, rate-limited, bad symbol) — never throws. */
export async function getQuote(symbol: string): Promise<Quote | null> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return null;
  return getOrFetch(`quote:${symbol}`, FINNHUB_TTL.quote, async () => {
    try {
      const res = await fetch(
        `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`,
        { cache: "no-store" },
      );
      if (!res.ok) return null;
      return parseQuoteResponse(await res.json());
    } catch {
      return null;
    }
  });
}

/** Live quotes for multiple symbols. Symbols that fail are simply absent from the map. */
export async function getQuotes(symbols: string[]): Promise<Map<string, Quote>> {
  const results = await Promise.all(
    symbols.map(async (symbol) => [symbol, await getQuote(symbol)] as const),
  );
  const quotes = new Map<string, Quote>();
  for (const [symbol, quote] of results) {
    if (quote) quotes.set(symbol, quote);
  }
  return quotes;
}

/** Sector/industry for one ticker, or null on any failure — never throws. */
export async function getSector(ticker: string): Promise<string | null> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return parseProfileResponse(await res.json())?.sector ?? null;
  } catch {
    return null;
  }
}

/**
 * Upcoming earnings for the given tickers over the next `daysAhead` days,
 * sorted by date. Queried per-ticker (not a single unfiltered calendar
 * fetch self-filtered by symbol) because Finnhub resolves dual-class
 * tickers correctly this way — e.g. `symbol=GOOG` returns Alphabet's
 * earnings even though the unfiltered calendar only ever lists it under
 * "GOOGL". A ticker that fails or has nothing scheduled just contributes
 * no events, same never-throws contract as getQuote.
 */
export async function getUpcomingEarnings(
  tickers: string[],
  daysAhead = 90,
): Promise<EarningsEvent[]> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return [];
  const from = todayInTimeZone("America/New_York");
  const to = addDays(from, daysAhead);

  const results = await Promise.all(
    tickers.map(async (ticker) => {
      const events = await getOrFetch(`earnings:${ticker}:${from}:${to}`, FINNHUB_TTL.earnings, async () => {
        try {
          const res = await fetch(
            `${FINNHUB_BASE_URL}/calendar/earnings?from=${from}&to=${to}&symbol=${encodeURIComponent(ticker)}&token=${apiKey}`,
            { cache: "no-store" },
          );
          if (!res.ok) return null;
          return parseEarningsCalendarResponse(await res.json(), ticker);
        } catch {
          return null;
        }
      });
      return events ?? [];
    }),
  );

  return results.flat().sort((a, b) => (a.date < b.date ? -1 : 1));
}

/** Fundamentals (P/E, market cap, dividend yield, 52-week range) for one ticker, or null on any failure. */
export async function getCompanyMetric(ticker: string): Promise<CompanyMetric | null> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return null;
  return getOrFetch(`metric:${ticker}`, FINNHUB_TTL.metric, async () => {
    try {
      const res = await fetch(
        `${FINNHUB_BASE_URL}/stock/metric?symbol=${encodeURIComponent(ticker)}&metric=all&token=${apiKey}`,
        { cache: "no-store" },
      );
      if (!res.ok) return null;
      return parseMetricResponse(await res.json());
    } catch {
      return null;
    }
  });
}

/** Monthly analyst-consensus trend for one ticker, newest first, or null on any failure. */
export async function getRecommendationTrend(ticker: string): Promise<RecommendationTrend[] | null> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return null;
  return getOrFetch(`recommendation:${ticker}`, FINNHUB_TTL.recommendation, async () => {
    try {
      const res = await fetch(
        `${FINNHUB_BASE_URL}/stock/recommendation?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`,
        { cache: "no-store" },
      );
      if (!res.ok) return null;
      return parseRecommendationResponse(await res.json());
    } catch {
      return null;
    }
  });
}

/** Recent news for one ticker (last `daysBack` days, capped at 5), tagged with its ticker. Never throws — empty array on any failure. */
export async function getCompanyNews(ticker: string, daysBack = 14): Promise<NewsItem[]> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return [];
  const to = todayInTimeZone("America/New_York");
  const from = addDays(to, -daysBack);
  const items = await getOrFetch(`news:${ticker}:${from}:${to}`, FINNHUB_TTL.news, async () => {
    try {
      const res = await fetch(
        `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(ticker)}&from=${from}&to=${to}&token=${apiKey}`,
        { cache: "no-store" },
      );
      if (!res.ok) return null;
      return parseNewsResponse(await res.json());
    } catch {
      return null;
    }
  });
  return (items ?? []).map((item) => ({ ...item, ticker }));
}
