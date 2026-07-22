import { describe, expect, it } from "vitest";
import { parseQuoteResponse } from "./finnhub-quote";

describe("parseQuoteResponse", () => {
  it("extracts price and timestamp from a valid Finnhub quote", () => {
    expect(parseQuoteResponse({ c: 123.45, h: 125, l: 120, o: 121, pc: 122, t: 1700000000 })).toEqual({
      price: 123.45,
      timestamp: 1700000000,
    });
  });

  it("returns null for a price of 0 (Finnhub's signal for an unrecognized symbol)", () => {
    expect(parseQuoteResponse({ c: 0, h: 0, l: 0, o: 0, pc: 0, t: 0 })).toBeNull();
  });

  it("returns null for malformed or missing fields", () => {
    expect(parseQuoteResponse(null)).toBeNull();
    expect(parseQuoteResponse(undefined)).toBeNull();
    expect(parseQuoteResponse({})).toBeNull();
    expect(parseQuoteResponse({ c: "123.45", t: 1700000000 })).toBeNull();
    expect(parseQuoteResponse({ c: 123.45 })).toBeNull();
  });

  it("returns null for a negative price", () => {
    expect(parseQuoteResponse({ c: -5, t: 1700000000 })).toBeNull();
  });
});
