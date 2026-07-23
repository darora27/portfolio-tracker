import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { supabase } from "@/lib/supabase/client";
import { toCsv } from "@/lib/csv";

const HEADER = ["Date", "Ticker", "Action", "Shares", "Price", "Total", "Realized Gain", "Reason"];

export async function GET() {
  const ownerPassword = process.env.OWNER_PASSWORD;
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = ownerPassword ? isValidSession(session, ownerPassword) : false;
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: trades, error } = await supabase.from("trades").select("*").order("date", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (trades ?? []).map((t) => [
    t.date,
    t.ticker,
    t.action,
    t.shares,
    t.price,
    t.total,
    t.realized_gain,
    t.reason,
  ]);
  const csv = toCsv(HEADER, rows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="trades.csv"',
    },
  });
}
