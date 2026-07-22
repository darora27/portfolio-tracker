// One-time (re-runnable) backfill: fetches sector/industry for every ticker
// currently in `trades` and caches it in `ticker_sector`. Run once after
// applying the ticker_sector migration (supabase/schema.sql) — ongoing
// refreshes for newly-traded tickers happen automatically via
// ensureSectorCached() at trade entry, never on page load.
// Usage: npm run backfill-sectors
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/lib/supabase/types";
import { parseProfileResponse } from "../src/lib/finnhub-sector";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apiKey = process.env.FINNHUB_API_KEY;
if (!url || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
}
if (!apiKey) {
  throw new Error("Missing FINNHUB_API_KEY in .env.local");
}
const supabase = createClient<Database>(url, serviceRoleKey, { auth: { persistSession: false } });

async function fetchSector(ticker: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`,
    );
    if (!res.ok) return null;
    return parseProfileResponse(await res.json())?.sector ?? null;
  } catch {
    return null;
  }
}

async function main() {
  const { data: trades, error } = await supabase.from("trades").select("ticker");
  if (error) throw error;

  const tickers = [...new Set((trades ?? []).map((t) => t.ticker))].sort();
  const { data: cached, error: cachedError } = await supabase
    .from("ticker_sector")
    .select("ticker");
  if (cachedError) throw cachedError;
  const alreadyCached = new Set((cached ?? []).map((c) => c.ticker));

  let fetched = 0;
  let skipped = 0;
  for (const ticker of tickers) {
    if (alreadyCached.has(ticker)) {
      skipped++;
      continue;
    }
    const sector = await fetchSector(ticker);
    if (!sector) {
      console.warn(`No sector found for ${ticker} — will show "Unclassified" until retried.`);
      continue;
    }
    const { error: upsertError } = await supabase
      .from("ticker_sector")
      .upsert({ ticker, sector, fetched_at: new Date().toISOString() });
    if (upsertError) throw upsertError;
    fetched++;
    console.log(`${ticker} -> ${sector}`);
  }
  console.log(`Backfilled ${fetched} tickers, skipped ${skipped} already cached.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
