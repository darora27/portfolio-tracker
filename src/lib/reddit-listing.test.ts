import { describe, expect, it } from "vitest";
import { parseRedditListing } from "./reddit-listing";

describe("parseRedditListing", () => {
  it("extracts title, selftext, and created_utc from a listing", () => {
    const json = {
      data: {
        children: [
          { kind: "t3", data: { title: "$GOOG earnings", selftext: "thoughts?", created_utc: 100 } },
          { kind: "t3", data: { title: "no selftext post", created_utc: 200 } },
        ],
      },
    };
    expect(parseRedditListing(json)).toEqual([
      { title: "$GOOG earnings", selftext: "thoughts?", created_utc: 100 },
      { title: "no selftext post", selftext: undefined, created_utc: 200 },
    ]);
  });

  it("skips malformed children without throwing", () => {
    const json = {
      data: {
        children: [{ data: { title: 5, created_utc: 100 } }, { data: { title: "ok" } }, {}, null],
      },
    };
    expect(parseRedditListing(json)).toEqual([]);
  });

  it("returns an empty array for malformed or missing input", () => {
    expect(parseRedditListing(null)).toEqual([]);
    expect(parseRedditListing({})).toEqual([]);
    expect(parseRedditListing({ data: {} })).toEqual([]);
  });
});
