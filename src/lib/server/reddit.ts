import "server-only";
import { parseRedditListing, type RedditPost } from "@/lib/reddit-listing";
import { getOrFetch, RESEARCH_TTL } from "./api-cache";

export type { RedditPost };

const SUBREDDITS = ["stocks", "investing", "wallstreetbets"] as const;

/**
 * Reddit asks that unauthenticated clients identify themselves. A generic
 * agent gets 429s regardless of rate; a descriptive one does not.
 */
const USER_AGENT =
  process.env.REDDIT_USER_AGENT ??
  "portfolio-tracker/1.0 (personal portfolio dashboard; read-only)";

/**
 * R7, Aug: "we are never going to get reddit's API approval".
 *
 * The old path used OAuth against oauth.reddit.com, which requires exactly
 * the approval that is never coming, so `isRedditConfigured()` returned
 * false forever and /research showed "awaiting Reddit's API approval"
 * permanently.
 *
 * REDDIT'S PUBLIC JSON ENDPOINTS NEED NO APPROVAL AND NO CREDENTIALS.
 * Appending `.json` to any listing URL returns the same payload the OAuth
 * API returns, in the same shape — which is why parseRedditListing needed no
 * change at all. That is the strongest evidence this is right: the parser
 * that was written against the authenticated response already handles this
 * one.
 *
 * What is given up: nothing this app used. OAuth would allow higher rate
 * limits and private data; the existing 60-minute cache means at most three
 * requests an hour, far inside the unauthenticated allowance, and every
 * subreddit read here is public anyway.
 */
export function isRedditConfigured(): boolean {
  // No credentials needed any more. The integration is always available; a
  // failed request degrades to [] exactly as it did before.
  return true;
}

/**
 * New posts from r/stocks, r/investing, r/wallstreetbets — one request per
 * subreddit, each cached 60 minutes, so at most three Reddit requests per
 * hour regardless of page loads. Never throws; returns [] on any failure.
 */
export async function getRecentRedditPosts(): Promise<RedditPost[]> {
  const results = await Promise.all(
    SUBREDDITS.map((sub) =>
      getOrFetch(`reddit:posts:${sub}`, RESEARCH_TTL.redditPosts, async () => {
        try {
          const res = await fetch(
            `https://www.reddit.com/r/${sub}/new.json?limit=100&raw_json=1`,
            { headers: { "User-Agent": USER_AGENT }, cache: "no-store" },
          );
          if (!res.ok) return null;
          return parseRedditListing(await res.json());
        } catch {
          return null;
        }
      }),
    ),
  );

  return results.flatMap((r) => r ?? []);
}
