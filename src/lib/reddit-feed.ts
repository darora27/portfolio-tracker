import type { RedditPost } from "@/lib/reddit-listing";

/**
 * R7, Aug. Reddit's Atom feed, because both JSON routes are closed.
 *
 * The history matters for whoever reads this next:
 *
 * - `oauth.reddit.com` needs API approval, which he is not getting.
 * - `www.reddit.com/r/x/new.json` — the documented public endpoint — now
 *   returns the HTML web page to unauthenticated clients. Verified, not
 *   assumed: I claimed it would work from stale knowledge, he ran it, and it
 *   returned `<body class=theme-beta>`.
 * - `old.reddit.com/r/x/new.json` does the same thing.
 * - `www.reddit.com/r/x/new.rss` returns a real Atom feed. Also verified.
 *
 * So the feed is the remaining public door, and it is a normal one — RSS is
 * meant to be read by machines without credentials.
 *
 * WHAT THE FEED DOES NOT CARRY: post score, comment count, flair. Nothing
 * here uses them — reddit-mentions.ts matches ticker symbols in title and
 * body text, and sentiment.ts reads the same text — so the loss is real but
 * not felt. If a future feature needs a score, this is the constraint that
 * will bite, and OAuth would be the only way back.
 *
 * Parsed with regex rather than an XML library on purpose: one hand-written
 * dependency-free reader for four fields is smaller than the parser it would
 * replace, and the failure mode is an empty array rather than a thrown error
 * on a malformed feed.
 */

const ENTRY = /<entry\b[^>]*>([\s\S]*?)<\/entry>/g;
const TITLE = /<title[^>]*>([\s\S]*?)<\/title>/;
const CONTENT = /<content[^>]*>([\s\S]*?)<\/content>/;
const UPDATED = /<updated[^>]*>([\s\S]*?)<\/updated>/;

/** Atom escapes markup twice: entities inside a CDATA-free `content` block. */
function decodeEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Ampersand last, or "&amp;lt;" would decode to "<" in one pass.
    .replace(/&amp;/g, "&");
}

/** Reddit's `content` is escaped HTML; the tickers live in its text. */
function stripTags(value: string): string {
  return decodeEntities(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Parses a Reddit Atom feed into the same RedditPost shape the JSON parser
 * produced, so reddit-mentions.ts and sentiment.ts are untouched by the
 * source change.
 *
 * Never throws. A feed that is HTML, empty, or malformed yields [] — the
 * same degradation the OAuth path had.
 */
export function parseRedditFeed(xml: unknown): RedditPost[] {
  if (typeof xml !== "string" || !xml.includes("<entry")) return [];

  const posts: RedditPost[] = [];
  for (const match of xml.matchAll(ENTRY)) {
    const entry = match[1];
    const title = TITLE.exec(entry)?.[1];
    if (!title) continue;

    const updated = UPDATED.exec(entry)?.[1];
    const seconds = updated ? Math.floor(Date.parse(updated) / 1000) : Number.NaN;
    if (!Number.isFinite(seconds)) continue;

    const content = CONTENT.exec(entry)?.[1];
    const selftext = content ? stripTags(content) : undefined;

    posts.push({
      title: decodeEntities(title).trim(),
      ...(selftext ? { selftext } : {}),
      created_utc: seconds,
    });
  }
  return posts;
}
