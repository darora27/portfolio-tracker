// PHASE9.md §4's deterministic counting rule. COST and MEI are both
// common English words, so bare (non-$) mentions of them are ambiguous
// and don't count — only the explicit $-prefixed form does.
const AMBIGUOUS_TICKERS = new Set(["COST", "MEI"]);

export type RedditPost = { title: string; selftext?: string };

/**
 * Counts how many of `posts` mention `ticker` — one post contributes at
 * most 1, regardless of how many times it mentions the ticker. A post
 * counts if it contains `$TICKER` (case-insensitive) OR, for tickers not
 * in the ambiguous set, a bare uppercase-only word-boundary match of
 * TICKER.
 */
export function countTickerMentions(posts: RedditPost[], ticker: string): number {
  const upperTicker = ticker.toUpperCase();
  const dollarPattern = new RegExp(`\\$${upperTicker}\\b`, "i");
  const barePattern = new RegExp(`\\b${upperTicker}\\b`); // case-sensitive: uppercase-only
  const isAmbiguous = AMBIGUOUS_TICKERS.has(upperTicker);

  let count = 0;
  for (const post of posts) {
    const text = `${post.title} ${post.selftext ?? ""}`;
    if (dollarPattern.test(text)) {
      count++;
      continue;
    }
    if (!isAmbiguous && barePattern.test(text)) {
      count++;
    }
  }
  return count;
}

/** Posts with `created_utc` (unix seconds) within the last 24h of `nowSeconds`. */
export function filterToLast24h<T extends { created_utc: number }>(posts: T[], nowSeconds: number): T[] {
  const cutoff = nowSeconds - 24 * 60 * 60;
  return posts.filter((p) => p.created_utc >= cutoff);
}
