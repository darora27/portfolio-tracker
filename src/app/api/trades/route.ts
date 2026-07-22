import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { TradeValidationError, validateNewTrade } from "@/lib/portfolio/trade-entry";

export async function POST(request: Request) {
  const ownerPassword = process.env.OWNER_PASSWORD;
  if (!ownerPassword) {
    return NextResponse.json({ error: "Owner password is not configured." }, { status: 500 });
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!isValidSession(session, ownerPassword)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { data: existingTrades, error: existingError } = await supabaseAdmin
    .from("trades")
    .select("*");
  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  let validated;
  try {
    validated = validateNewTrade(existingTrades ?? [], {
      date: body.date,
      ticker: body.ticker,
      action: body.action,
      shares: Number(body.shares),
      price: Number(body.price),
      reason: body.reason || null,
    });
  } catch (error) {
    if (error instanceof TradeValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }

  const { error: insertError } = await supabaseAdmin.from("trades").insert({
    date: validated.date,
    ticker: validated.ticker,
    action: validated.action,
    shares: validated.shares,
    price: validated.price,
    total: validated.total,
    reason: validated.reason,
    realized_gain: validated.realizedGain,
  });
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  revalidatePath("/");
  revalidatePath("/trades");

  return NextResponse.json({ ok: true });
}
