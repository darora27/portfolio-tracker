import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { getQuotes } from "@/lib/finnhub";
import { computeHoldings } from "@/lib/portfolio/holdings";
import { isTradingDay } from "@/lib/market-calendar";
import { todayInTimeZone } from "@/lib/date";

/**
 * Public-safe live quotes: prices for currently-held tickers only, no
 * positions/shares/dollar amounts. Used by the private dashboard's
 * client-side polling — goes through the same §8 Finnhub cache as
 * everything else, so this doesn't add a new budget cost beyond what a
 * page load already spends on quotes.
 */
export async function GET() {
  const { data: trades, error } = await supabase.from("trades").select("date, ticker, action, shares, price");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const heldTickers = computeHoldings(trades ?? [], new Map()).map((p) => p.ticker);
  const quoteMap = await getQuotes(heldTickers);
  const quotes: Record<string, number> = {};
  for (const [ticker, quote] of quoteMap) quotes[ticker] = quote.price;

  const today = todayInTimeZone("America/New_York");
  return NextResponse.json({ quotes, marketOpen: isTradingDay(today) });
}
