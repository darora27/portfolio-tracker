// No "server-only" tag here (unlike finnhub.ts): this module holds no
// secrets of its own — it's a generic cache/budget utility — and needs to
// be importable from a plain Vitest environment for direct unit testing.
// The actual API key stays behind finnhub.ts's server-only guard.
type CacheEntry<T> = { value: T; expiresAt: number };

// Per-serverless-instance only (a plain in-memory Map) — no shared cache
// across instances or deploys. Acceptable best-effort: it still collapses
// the common case (several page views hitting the same warm instance)
// without needing external infra for a single-owner app.
const cache = new Map<string, CacheEntry<unknown>>();

const BUDGET_LIMIT = 50;
const BUDGET_WINDOW_MS = 60_000;
let budgetWindowStart = Date.now();
let budgetCount = 0;

function withinBudget(): boolean {
  const now = Date.now();
  if (now - budgetWindowStart >= BUDGET_WINDOW_MS) {
    budgetWindowStart = now;
    budgetCount = 0;
  }
  if (budgetCount >= BUDGET_LIMIT) return false;
  budgetCount++;
  return true;
}

/** Test-only: resets the module-level cache and budget counter between test cases. */
export function _resetFinnhubCacheForTests(): void {
  cache.clear();
  budgetWindowStart = Date.now();
  budgetCount = 0;
}

/**
 * The one Finnhub choke point. Serves a cached value within its TTL;
 * otherwise calls `fn` — unless the 50-calls/min budget is exhausted, in
 * which case it falls back to a stale cached value (or null) without
 * calling `fn` at all. Never throws and never retries: a thrown error or a
 * null result from `fn` (Finnhub down, rate-limited, bad symbol) falls
 * back the same way as an exhausted budget.
 */
export async function getOrFetch<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T | null>,
): Promise<T | null> {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  const now = Date.now();
  if (entry && entry.expiresAt > now) {
    return entry.value;
  }

  if (!withinBudget()) {
    return entry?.value ?? null;
  }

  let result: T | null;
  try {
    result = await fn();
  } catch {
    return entry?.value ?? null;
  }

  if (result === null) {
    return entry?.value ?? null;
  }

  cache.set(key, { value: result, expiresAt: now + ttlMs });
  return result;
}

/** TTLs per Phase 8 §8: quotes refresh often, company data barely changes in a day. */
export const FINNHUB_TTL = {
  quote: 30_000,
  metric: 24 * 60 * 60 * 1000,
  news: 24 * 60 * 60 * 1000,
  recommendation: 24 * 60 * 60 * 1000,
  earnings: 0,
} as const;
