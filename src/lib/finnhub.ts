import "server-only";
import { parseQuoteResponse, type Quote } from "./finnhub-quote";

export type { Quote };

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
