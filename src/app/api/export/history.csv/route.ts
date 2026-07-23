import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getHistoryData } from "@/lib/history-data";
import { toCsv } from "@/lib/csv";

const HEADER = ["Date", "Invested", "Value", "Day $", "Day %", "Cumulative TWR"];

export async function GET() {
  const ownerPassword = process.env.OWNER_PASSWORD;
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const authenticated = ownerPassword ? isValidSession(session, ownerPassword) : false;
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rows } = await getHistoryData();

  // Percentages as plain numbers in percentage points (e.g. -1.17 for
  // -1.17%), not raw decimals — matches what the History table itself
  // displays, so the CSV reads the same way without spreadsheet-side
  // percentage formatting.
  const csvRows = rows.map((r) => [
    r.date,
    r.invested.toFixed(2),
    r.value.toFixed(2),
    r.day !== null ? r.day.toFixed(2) : null,
    r.dayPct !== null ? (r.dayPct * 100).toFixed(2) : null,
    (r.cumulativeTwr * 100).toFixed(2),
  ]);
  const csv = toCsv(HEADER, csvRows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="history.csv"',
    },
  });
}
