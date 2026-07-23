import { describe, expect, it } from "vitest";
import { parseRecommendationResponse } from "./finnhub-recommendation";

describe("parseRecommendationResponse", () => {
  it("extracts trend rows and sorts newest period first", () => {
    const json = [
      { symbol: "ASML", period: "2026-05-01", strongBuy: 10, buy: 5, hold: 2, sell: 1, strongSell: 0 },
      { symbol: "ASML", period: "2026-06-01", strongBuy: 14, buy: 5, hold: 1, sell: 0, strongSell: 0 },
    ];
    expect(parseRecommendationResponse(json)).toEqual([
      { period: "2026-06-01", strongBuy: 14, buy: 5, hold: 1, sell: 0, strongSell: 0 },
      { period: "2026-05-01", strongBuy: 10, buy: 5, hold: 2, sell: 1, strongSell: 0 },
    ]);
  });

  it("returns an empty array for malformed or missing input", () => {
    expect(parseRecommendationResponse(null)).toEqual([]);
    expect(parseRecommendationResponse(undefined)).toEqual([]);
    expect(parseRecommendationResponse({})).toEqual([]);
    expect(parseRecommendationResponse("not-an-array")).toEqual([]);
  });

  it("skips entries missing a period, defaulting missing counts to 0", () => {
    const json = [{ period: "2026-06-01", strongBuy: 3 }, { strongBuy: 99 }];
    expect(parseRecommendationResponse(json)).toEqual([
      { period: "2026-06-01", strongBuy: 3, buy: 0, hold: 0, sell: 0, strongSell: 0 },
    ]);
  });
});
