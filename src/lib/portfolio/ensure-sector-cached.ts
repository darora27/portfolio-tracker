import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSector } from "@/lib/finnhub";

/**
 * Caches sector classification for a ticker the first time it's traded —
 * called from trade entry, never from a page load, so the dashboard read
 * path is always a plain cached-table read with zero Finnhub calls. No-op
 * if already cached. Best-effort: a Finnhub failure here must never break
 * trade entry, so this never throws.
 */
export async function ensureSectorCached(ticker: string): Promise<void> {
  try {
    const { data: existing } = await supabaseAdmin
      .from("ticker_sector")
      .select("ticker")
      .eq("ticker", ticker)
      .maybeSingle();
    if (existing) return;

    const sector = await getSector(ticker);
    if (!sector) return;

    await supabaseAdmin
      .from("ticker_sector")
      .upsert({ ticker, sector, fetched_at: new Date().toISOString() });
  } catch {
    // Best-effort cache — swallow so a Finnhub/DB hiccup never fails trade entry.
  }
}
