import crypto from "node:crypto";

export const SESSION_COOKIE_NAME = "owner_session";

/**
 * Deterministic session token derived from the owner password itself —
 * there's exactly one owner and no session store, so "knows a value only
 * derivable from the password" is the whole session model.
 */
export function sessionToken(password: string): string {
  return crypto.createHmac("sha256", password).update("portfolio-tracker-owner-session").digest("hex");
}

export function isValidSession(cookieValue: string | undefined, password: string): boolean {
  if (!cookieValue) return false;
  const expected = sessionToken(password);
  const a = Buffer.from(cookieValue);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
