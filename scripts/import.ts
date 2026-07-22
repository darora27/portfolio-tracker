// One-time (re-runnable) import of the old Google Sheet CSVs into Supabase.
// Usage: npm run import
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { Database } from "../src/lib/supabase/types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
}
const supabase = createClient<Database>(url, serviceRoleKey, {
  auth: { persistSession: false },
});

const dataDir = path.join(__dirname, "..", "data");

function readCsv(filename: string): Record<string, string>[] {
  const raw = readFileSync(path.join(dataDir, filename), "utf-8");
  return parse(raw, { columns: true, skip_empty_lines: true, trim: true });
}

// "$1,789.41" / "-$1,083.13" / "" -> 1789.41 / -1083.13 / 0
function parseMoney(value: string): number {
  if (!value) return 0;
  const negative = value.trim().startsWith("-");
  const num = Number(value.replace(/[^0-9.]/g, ""));
  return negative ? -num : num;
}

// "6/24/2026" -> "2026-06-24"
function parseDate(value: string): string {
  const [month, day, year] = value.split("/").map(Number);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// "4 x ASML\n5 x CBRS" / "8 X IBM" / "None" -> [{ticker, shares}]
function parseStocks(value: string): { ticker: string; shares: number }[] {
  if (!value || value.trim() === "None") return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\d+(?:\.\d+)?)\s*[xX]\s*(\S+)$/);
      if (!match) throw new Error(`Could not parse stocks line: "${line}"`);
      return { shares: Number(match[1]), ticker: match[2] };
    });
}

async function importTrades() {
  const rows = readCsv("trades.csv");
  const trades: Database["public"]["Tables"]["trades"]["Insert"][] =
    rows.map((row) => ({
      date: parseDate(row.Date),
      ticker: row.Ticker,
      action: row.Action.toLowerCase() as "buy" | "sell",
      shares: Number(row.Shares),
      price: parseMoney(row.Price),
      total: parseMoney(row.Total),
      reason: row.Reason || null,
      realized_gain: row["Realized G/L"] ? parseMoney(row["Realized G/L"]) : null,
    }));

  await supabase.from("trades").delete().gte("id", 0);
  const { error } = await supabase.from("trades").insert(trades);
  if (error) throw error;
  console.log(`Imported ${trades.length} trades.`);
}

async function importSnapshots() {
  const historyRows = readCsv("history.csv");
  const priceRows = readCsv("closing_prices.csv");

  // date -> { ticker -> close price }
  const priceByDate = new Map<string, Map<string, number>>();
  for (const row of priceRows) {
    const date = parseDate(row.Date);
    const tickerPrices = new Map<string, number>();
    for (const [key, value] of Object.entries(row)) {
      if (key === "Date" || !value) continue;
      tickerPrices.set(key, parseMoney(value));
    }
    priceByDate.set(date, tickerPrices);
  }

  await supabase.from("snapshot_positions").delete().gte("id", 0);
  await supabase.from("snapshots").delete().gte("id", 0);

  let snapshotCount = 0;
  let positionCount = 0;
  for (const row of historyRows) {
    const date = parseDate(row.Date);
    const totalCost = parseMoney(row.Cost);
    const totalValue = parseMoney(row["Value at close"]);

    const { data: snapshot, error: snapshotError } = await supabase
      .from("snapshots")
      .insert({ date, total_cost: totalCost, total_value: totalValue })
      .select("id")
      .single();
    if (snapshotError) throw snapshotError;
    snapshotCount++;

    const positions = parseStocks(row.Stocks);
    const tickerPrices = priceByDate.get(date);
    const positionRows: Database["public"]["Tables"]["snapshot_positions"]["Insert"][] =
      [];
    for (const { ticker, shares } of positions) {
      const closePrice = tickerPrices?.get(ticker);
      if (closePrice === undefined) {
        console.warn(
          `No closing price for ${ticker} on ${date} — skipping position.`,
        );
        continue;
      }
      positionRows.push({
        snapshot_id: snapshot.id,
        ticker,
        shares,
        close_price: closePrice,
        value: shares * closePrice,
      });
    }
    if (positionRows.length > 0) {
      const { error: positionError } = await supabase
        .from("snapshot_positions")
        .insert(positionRows);
      if (positionError) throw positionError;
      positionCount += positionRows.length;
    }
  }
  console.log(`Imported ${snapshotCount} snapshots, ${positionCount} positions.`);
}

async function main() {
  await importTrades();
  await importSnapshots();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
