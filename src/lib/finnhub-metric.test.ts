import { describe, expect, it } from "vitest";
import { parseMetricResponse } from "./finnhub-metric";

describe("parseMetricResponse", () => {
  it("extracts the fundamentals fields from a valid response", () => {
    const json = {
      metric: {
        peTTM: 34.2,
        marketCapitalization: 412345.6,
        currentDividendYieldTTM: 0.8,
        "52WeekLow": 550.1,
        "52WeekHigh": 950.4,
        unrelatedField: "ignored",
      },
    };
    expect(parseMetricResponse(json)).toEqual({
      peTTM: 34.2,
      marketCapMillions: 412345.6,
      dividendYieldPct: 0.8,
      week52Low: 550.1,
      week52High: 950.4,
    });
  });

  it("nulls out individual fields that are missing or the wrong type, without failing the whole object", () => {
    const json = { metric: { peTTM: null, marketCapitalization: "big" } };
    expect(parseMetricResponse(json)).toEqual({
      peTTM: null,
      marketCapMillions: null,
      dividendYieldPct: null,
      week52Low: null,
      week52High: null,
    });
  });

  it("returns null when the metric object itself is missing or malformed", () => {
    expect(parseMetricResponse(null)).toBeNull();
    expect(parseMetricResponse(undefined)).toBeNull();
    expect(parseMetricResponse({})).toBeNull();
    expect(parseMetricResponse({ metric: "not-an-object" })).toBeNull();
  });
});
