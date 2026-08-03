import "server-only";
import type { RedditPost } from "@/lib/reddit-listing";
import { parseRedditFeed } from "@/lib/reddit-feed";
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
 * I first moved this to `www.reddit.com/r/x/new.json`, on the belief that
 * the documented public endpoint needed no credentials. IT DOES NOT WORK —
 * Reddit now serves the HTML web page to unauthenticated clients there, and
 * on old.reddit.com too. He ran both and pasted back
 * `<body class=theme-beta>`. I had asserted it from stale knowledge.
 *
 * THE ATOM FEED IS STILL OPEN. `/r/x/new.rss` returns real XML with no
 * credentials — verified the same way, by running it. RSS is meant to be
 * read by machines without auth, which is why it survived the lockdown that
 * closed the JSON routes.
 *
 * What is given up: score, comment count and flair, which the feed omits.
 * Nothing here uses them — reddit-mentions matches ticker symbols in title
 * and body text, sentiment reads the same text. The 60-minute cache means at
 * most three requests an hour either way.
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
            `https://www.reddit.com/r/${sub}/new.rss?limit=100`,
            { headers: { "User-Agent": USER_AGENT }, cache: "no-store" },
          );
          if (!res.ok) return null;
          return parseRedditFeed(await res.text());
        } catch {
          return null;
        }
      }),
    ),
  );

  return results.flatMap((r) => r ?? []);
}
