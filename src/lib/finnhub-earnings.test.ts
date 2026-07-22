import { describe, expect, it } from "vitest";
import { parseEarningsCalendarResponse } from "./finnhub-earnings";

describe("parseEarningsCalendarResponse", () => {
  it("extracts ticker/date/hour/epsEstimate from a valid response", () => {
    const json = {
      earningsCalendar: [
        { symbol: "GOOGL", date: "2026-07-22", hour: "amc", epsEstimate: 2.9753, epsActual: 9.11 },
      ],
    };
    expect(parseEarningsCalendarResponse(json)).toEqual([
      { ticker: "GOOGL", date: "2026-07-22", hour: "amc", epsEstimate: 2.9753 },
    ]);
  });

  it("normalizes an unrecognized hour code to empty string", () => {
    const json = { earningsCalendar: [{ symbol: "AAA", date: "2026-08-01", hour: "??", epsEstimate: null }] };
    expect(parseEarningsCalendarResponse(json)[0].hour).toBe("");
  });

  it("returns an empty array for malformed or missing input", () => {
    expect(parseEarningsCalendarResponse(null)).toEqual([]);
    expect(parseEarningsCalendarResponse(undefined)).toEqual([]);
    expect(parseEarningsCalendarResponse({})).toEqual([]);
    expect(parseEarningsCalendarResponse({ earningsCalendar: "not-an-array" })).toEqual([]);
  });

  it("skips individual malformed entries without dropping the whole list", () => {
    const json = {
      earningsCalendar: [
        { symbol: "GOOD", date: "2026-08-01", hour: "bmo", epsEstimate: 1 },
        { symbol: 123, date: "2026-08-02" }, // malformed: symbol not a string
        { date: "2026-08-03" }, // malformed: no symbol at all
      ],
    };
    expect(parseEarningsCalendarResponse(json)).toEqual([
      { ticker: "GOOD", date: "2026-08-01", hour: "bmo", epsEstimate: 1 },
    ]);
  });
});
