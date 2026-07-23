import "server-only";
import { parseRedditListing, type RedditPost } from "@/lib/reddit-listing";
import { getOrFetch, RESEARCH_TTL } from "./api-cache";

export type { RedditPost };

const SUBREDDITS = ["stocks", "investing", "wallstreetbets"] as const;

/**
 * Whether the Reddit integration is configured. Approval for Reddit's API
 * is pending as of Phase 9 — expected to be false. The /research page
 * must build and render correctly in either state.
 */
export function isRedditConfigured(): boolean {
  return Boolean(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET && process.env.REDDIT_USER_AGENT);
}

async function getRedditToken(): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const userAgent = process.env.REDDIT_USER_AGENT;
  if (!clientId || !clientSecret || !userAgent) return null;

  return getOrFetch("reddit:token", RESEARCH_TTL.redditToken, async () => {
    try {
      const res = await fetch("https://www.reddit.com/api/v1/access_token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": userAgent,
        },
        body: "grant_type=client_credentials",
        cache: "no-store",
      });
      if (!res.ok) return null;
      const json = await res.json();
      const token = (json as Record<string, unknown>)?.access_token;
      return typeof token === "string" ? token : null;
    } catch {
      return null;
    }
  });
}

/**
 * New posts from r/stocks, r/investing, r/wallstreetbets — one request
 * per subreddit, each cached 60min, so this is at most 3 Reddit requests
 * per hour total regardless of how many page loads call it. Never
 * throws; returns [] if unconfigured or on any failure.
 */
export async function getRecentRedditPosts(): Promise<RedditPost[]> {
  const userAgent = process.env.REDDIT_USER_AGENT;
  if (!isRedditConfigured() || !userAgent) return [];

  const token = await getRedditToken();
  if (!token) return [];

  const results = await Promise.all(
    SUBREDDITS.map((sub) =>
      getOrFetch(`reddit:posts:${sub}`, RESEARCH_TTL.redditPosts, async () => {
        try {
          const res = await fetch(`https://oauth.reddit.com/r/${sub}/new?limit=100`, {
            headers: { Authorization: `Bearer ${token}`, "User-Agent": userAgent },
            cache: "no-store",
          });
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
