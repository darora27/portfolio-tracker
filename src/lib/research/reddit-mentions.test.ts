import { describe, expect, it } from "vitest";
import { countTickerMentions, filterToLast24h } from "./reddit-mentions";

describe("countTickerMentions", () => {
  const posts = [
    { title: "$GOOG earnings tonight" },
    { title: "GOOG will beat" },
    { title: "the cost of eggs" },
    { title: "$COST membership hike" },
    { title: "MEI update" },
    { title: "buying $MEI" },
  ];

  it("matches the exact PHASE9.md fixture", () => {
    expect(countTickerMentions(posts, "GOOG")).toBe(2);
    expect(countTickerMentions(posts, "COST")).toBe(1);
    expect(countTickerMentions(posts, "MEI")).toBe(1);
  });

  it("does not double-count a single post matching both the $ and bare pattern", () => {
    expect(countTickerMentions([{ title: "$GOOG will beat GOOG estimates" }], "GOOG")).toBe(1);
  });

  it("a bare lowercase mention never counts, ambiguous or not", () => {
    expect(countTickerMentions([{ title: "goog is a great company" }], "GOOG")).toBe(0);
  });

  it("scans selftext as well as title", () => {
    expect(countTickerMentions([{ title: "thoughts?", selftext: "$GOOG is undervalued" }], "GOOG")).toBe(1);
  });

  it("a bare uppercase substring of a longer ticker does not false-match (word boundary)", () => {
    expect(countTickerMentions([{ title: "$GOOGL announces buyback" }], "GOOG")).toBe(0);
  });
});

describe("filterToLast24h", () => {
  it("keeps posts within the last 24 hours and drops older ones", () => {
    const now = 1_700_000_000;
    const posts = [
      { id: "recent", created_utc: now - 60 },
      { id: "boundary", created_utc: now - 24 * 60 * 60 },
      { id: "old", created_utc: now - 24 * 60 * 60 - 1 },
    ];
    expect(filterToLast24h(posts, now).map((p) => p.id)).toEqual(["recent", "boundary"]);
  });
});
