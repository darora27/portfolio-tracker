import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, sessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  const ownerPassword = process.env.OWNER_PASSWORD;
  if (!ownerPassword) {
    return NextResponse.json({ error: "Owner password is not configured." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const password = body?.password;
  if (typeof password !== "string" || password !== ownerPassword) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, sessionToken(ownerPassword), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
