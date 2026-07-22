import "server-only";
import { parseQuoteResponse, type Quote } from "./finnhub-quote";
import { parseEarningsCalendarResponse, type EarningsEvent } from "./finnhub-earnings";
import { parseProfileResponse } from "./finnhub-sector";
import { addDays, todayInTimeZone } from "./date";

export type { Quote, EarningsEvent };

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

/** A single live quote, or null on any failure (down, rate-limited, bad symbol) — never throws. */
export async function getQuote(symbol: string): Promise<Quote | null> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return null;
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
      try {
        const res = await fetch(
          `${FINNHUB_BASE_URL}/calendar/earnings?from=${from}&to=${to}&symbol=${encodeURIComponent(ticker)}&token=${apiKey}`,
          { cache: "no-store" },
        );
        if (!res.ok) return [];
        return parseEarningsCalendarResponse(await res.json());
      } catch {
        return [];
      }
    }),
  );

  return results.flat().sort((a, b) => (a.date < b.date ? -1 : 1));
}
