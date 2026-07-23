export type RedditPost = { title: string; selftext?: string; created_utc: number };

/**
 * Parses a Reddit `/r/{sub}/new` listing response into plain post
 * objects. Pure and network-free so it's unit testable; the OAuth2 +
 * fetch logic that touches the client secret lives in
 * src/lib/server/reddit.ts (server-only).
 */
export function parseRedditListing(json: unknown): RedditPost[] {
  if (typeof json !== "object" || json === null) return [];
  const data = (json as Record<string, unknown>).data;
  if (typeof data !== "object" || data === null) return [];
  const children = (data as Record<string, unknown>).children;
  if (!Array.isArray(children)) return [];

  const posts: RedditPost[] = [];
  for (const child of children) {
    if (typeof child !== "object" || child === null) continue;
    const post = (child as Record<string, unknown>).data;
    if (typeof post !== "object" || post === null) continue;
    const row = post as Record<string, unknown>;
    if (typeof row.title !== "string" || typeof row.created_utc !== "number") continue;
    posts.push({
      title: row.title,
      selftext: typeof row.selftext === "string" ? row.selftext : undefined,
      created_utc: row.created_utc,
    });
  }
  return posts;
}
