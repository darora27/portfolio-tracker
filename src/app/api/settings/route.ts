import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { isValidSession, SESSION_COOKIE_NAME } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

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
  if (typeof body?.hideDollars !== "boolean") {
    return NextResponse.json({ error: "hideDollars must be a boolean." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("settings")
    .update({ value: body.hideDollars })
    .eq("key", "share_hide_dollars");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/share");
  revalidatePath("/trades");

  return NextResponse.json({ ok: true });
}
