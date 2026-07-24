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

/**
 * Constant-time string equality for secret checks (owner password, cron
 * bearer token). Hashing both sides first makes the two buffers a fixed,
 * equal length regardless of input length, so there's no early
 * length-mismatch branch to time — unlike a plain `===`, this doesn't leak
 * how many leading characters matched via response timing.
 */
export function timingSafeStringEqual(candidate: string, expected: string): boolean {
  const a = crypto.createHash("sha256").update(candidate).digest();
  const b = crypto.createHash("sha256").update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}
