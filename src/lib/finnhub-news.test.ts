import { describe, expect, it } from "vitest";
import { parseNewsResponse } from "./finnhub-news";

describe("parseNewsResponse", () => {
  it("extracts articles and sorts newest first", () => {
    const json = [
      { headline: "Old", source: "Reuters", url: "https://a", datetime: 100 },
      { headline: "New", source: "Bloomberg", url: "https://b", datetime: 200 },
    ];
    expect(parseNewsResponse(json)).toEqual([
      { headline: "New", source: "Bloomberg", url: "https://b", datetime: 200 },
      { headline: "Old", source: "Reuters", url: "https://a", datetime: 100 },
    ]);
  });

  it("caps results at maxItems", () => {
    const json = Array.from({ length: 10 }, (_, i) => ({
      headline: `H${i}`,
      source: "S",
      url: `https://x/${i}`,
      datetime: i,
    }));
    expect(parseNewsResponse(json, 3)).toHaveLength(3);
  });

  it("skips malformed entries and defaults a missing source to an empty string", () => {
    const json = [
      { headline: "Good", url: "https://a", datetime: 1 },
      { headline: 5, url: "https://b", datetime: 2 },
      { url: "https://c", datetime: 3 },
    ];
    expect(parseNewsResponse(json)).toEqual([{ headline: "Good", source: "", url: "https://a", datetime: 1 }]);
  });

  it("returns an empty array for malformed or missing input", () => {
    expect(parseNewsResponse(null)).toEqual([]);
    expect(parseNewsResponse(undefined)).toEqual([]);
    expect(parseNewsResponse({})).toEqual([]);
  });
});
