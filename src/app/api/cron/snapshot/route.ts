import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getQuotes } from "@/lib/finnhub";
import { isTradingDay } from "@/lib/market-calendar";
import { todayInTimeZone } from "@/lib/date";
import { computeHoldings, latestKnownPrices, mergePrices } from "@/lib/portfolio/holdings";
import { timingSafeStringEqual } from "@/lib/auth";

const BENCHMARK_TICKERS = ["VOO", "VTI", "XLK"] as const;

/**
 * Daily EOD snapshot job, triggered by Vercel Cron after market close.
 * Skips non-trading days, skips if today's snapshot already exists, and
 * degrades gracefully per ticker (live quote -> last known price -> skip)
 * rather than failing the whole run if Finnhub is down for one symbol.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !timingSafeStringEqual(authHeader, `Bearer ${cronSecret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = todayInTimeZone("America/New_York");

  if (!isTradingDay(today)) {
    return NextResponse.json({ skipped: "not a trading day", date: today });
  }

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("snapshots")
    .select("id")
    .eq("date", today)
    .maybeSingle();
  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }
  if (existing) {
    return NextResponse.json({ skipped: "snapshot already exists", date: today });
  }

  const { data: trades, error: tradesError } = await supabaseAdmin.from("trades").select("*");
  if (tradesError) {
    return NextResponse.json({ error: tradesError.message }, { status: 500 });
  }

  const heldTickers = computeHoldings(trades ?? [], new Map()).map((p) => p.ticker);

  const [{ data: snapshots, error: snapshotsError }, { data: snapshotPositions, error: spError }] =
    await Promise.all([
      supabaseAdmin.from("snapshots").select("id, date"),
      supabaseAdmin.from("snapshot_positions").select("snapshot_id, ticker, close_price"),
    ]);
  if (snapshotsError) return NextResponse.json({ error: snapshotsError.message }, { status: 500 });
  if (spError) return NextResponse.json({ error: spError.message }, { status: 500 });

  const snapshotDateById = new Map((snapshots ?? []).map((s) => [s.id, s.date]));
  const fallbackRows = (snapshotPositions ?? [])
    .map((row) => {
      const date = snapshotDateById.get(row.snapshot_id);
      return date ? { ticker: row.ticker, closePrice: row.close_price, date } : null;
    })
    .filter((row): row is { ticker: string; closePrice: number; date: string } => row !== null);
  const fallbackPrices = latestKnownPrices(fallbackRows);

  const liveQuotes = await getQuotes(heldTickers);
  const livePrices = new Map(
    [...liveQuotes.entries()].map(([ticker, quote]) => [
      ticker,
      { price: quote.price, date: today },
    ]),
  );
  const prices = mergePrices(livePrices, fallbackPrices);

  const positions = computeHoldings(trades ?? [], prices);
  const totalValue = positions.reduce((sum, p) => sum + p.value, 0);
  const totalCost = positions.reduce((sum, p) => sum + p.costBasis, 0);

  const { data: snapshot, error: snapshotError } = await supabaseAdmin
    .from("snapshots")
    .insert({ date: today, total_cost: totalCost, total_value: totalValue })
    .select("id")
    .single();
  if (snapshotError) {
    return NextResponse.json({ error: snapshotError.message }, { status: 500 });
  }

  const pricedPositions = positions.filter(
    (p): p is typeof p & { price: number } => p.price !== null,
  );
  const skippedTickers = positions.filter((p) => p.price === null).map((p) => p.ticker);

  if (pricedPositions.length > 0) {
    const { error: positionsError } = await supabaseAdmin.from("snapshot_positions").insert(
      pricedPositions.map((p) => ({
        snapshot_id: snapshot.id,
        ticker: p.ticker,
        shares: p.shares,
        close_price: p.price,
        value: p.value,
      })),
    );
    if (positionsError) {
      return NextResponse.json({ error: positionsError.message }, { status: 500 });
    }
  }

  const benchmarkQuotes = await getQuotes([...BENCHMARK_TICKERS]);
  const benchmarkRows = [...benchmarkQuotes.entries()].map(([ticker, quote]) => ({
    date: today,
    ticker: ticker as (typeof BENCHMARK_TICKERS)[number],
    close: quote.price,
  }));
  const skippedBenchmarks = BENCHMARK_TICKERS.filter((t) => !benchmarkQuotes.has(t));
  if (benchmarkRows.length > 0) {
    const { error: benchmarkError } = await supabaseAdmin
      .from("benchmarks")
      .upsert(benchmarkRows, { onConflict: "date,ticker" });
    if (benchmarkError) {
      return NextResponse.json({ error: benchmarkError.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    date: today,
    totalValue,
    totalCost,
    positionsSaved: pricedPositions.length,
    positionsSkipped: skippedTickers,
    benchmarksSaved: benchmarkRows.length,
    benchmarksSkipped: skippedBenchmarks,
  });
}
