import { describe, expect, it } from "vitest";
import { parseRedditFeed } from "./reddit-feed";

/**
 * R7, Aug. The Atom feed replaced two JSON endpoints that Reddit closed to
 * unauthenticated clients. The fixture below mirrors the real response shape
 * — namespaced Atom, escaped HTML inside `content`, RFC-3339 `updated`.
 */

const FEED = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <title>newest submissions : stocks</title>
  <entry>
    <title>ASML &amp; INTC both moved on the same headline</title>
    <content type="html">&lt;!-- SC_OFF --&gt;&lt;div&gt;&lt;p&gt;Bought more &lt;b&gt;INTC&lt;/b&gt; today.&lt;/p&gt;&lt;/div&gt;&lt;!-- SC_ON --&gt;</content>
    <updated>2026-08-03T14:21:07+00:00</updated>
  </entry>
  <entry>
    <title>No body on this one</title>
    <updated>2026-08-03T09:00:00+00:00</updated>
  </entry>
</feed>`;

describe("parseRedditFeed", () => {
  it("reads title, body text and timestamp from a real feed shape", () => {
    const posts = parseRedditFeed(FEED);
    expect(posts).toHaveLength(2);

    // Entities decode: "&amp;" must become "&", not stay escaped.
    expect(posts[0].title).toBe("ASML & INTC both moved on the same headline");
    // `content` is escaped HTML; the tickers live in its text, so the tags go
    // and the words stay — reddit-mentions matches against this string.
    expect(posts[0].selftext).toContain("Bought more INTC today.");
    expect(posts[0].selftext).not.toContain("<");
    expect(posts[0].created_utc).toBe(
      Math.floor(Date.parse("2026-08-03T14:21:07+00:00") / 1000),
    );
  });

  it("keeps a post that has no body", () => {
    // Link posts have no <content>. Dropping them would silently lose most
    // of r/stocks, where the ticker is usually in the title anyway.
    const posts = parseRedditFeed(FEED);
    expect(posts[1].title).toBe("No body on this one");
    expect(posts[1].selftext).toBeUndefined();
  });

  it("decodes ampersands last, so &amp;lt; does not become a tag", () => {
    const feed = `<feed><entry><title>a &amp;lt;b&amp;gt; c</title><updated>2026-08-03T00:00:00+00:00</updated></entry></feed>`;
    // Decoding "&amp;" first would yield "&lt;b&gt;" and then "<b>", turning
    // escaped text into markup. Order matters and this pins it.
    expect(parseRedditFeed(feed)[0].title).toBe("a &lt;b&gt; c");
  });

  it("returns [] for the HTML page Reddit serves on the closed JSON routes", () => {
    // The exact failure that sent us here: www and old.reddit.com both
    // return this to unauthenticated clients.
    expect(parseRedditFeed("<body class=theme-beta><div><style>...")).toEqual([]);
  });

  it("returns [] rather than throwing on junk", () => {
    for (const input of ["", "not xml", null, undefined, 42, {}, "<feed></feed>"]) {
      expect(parseRedditFeed(input)).toEqual([]);
    }
  });

  it("skips an entry with an unparseable date rather than emitting NaN", () => {
    const feed = `<feed><entry><title>t</title><updated>not-a-date</updated></entry></feed>`;
    // A NaN timestamp would sort unpredictably and break the 24-hour window
    // reddit-mentions applies downstream.
    expect(parseRedditFeed(feed)).toEqual([]);
  });
});
