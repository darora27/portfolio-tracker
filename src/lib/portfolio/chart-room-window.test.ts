import { describe, expect, it } from "vitest";
import { sliceToRange, alignToDates } from "./chart-room-window";

const priceHistory = [
  { date: "2026-06-01", price: 100 },
  { date: "2026-06-15", price: 105 },
  { date: "2026-07-01", price: 110 },
  { date: "2026-07-15", price: 108 },
  { date: "2026-07-22", price: 112 },
  { date: "2026-07-29", price: 115 },
  { date: "2026-07-30", price: 116 },
];

describe("sliceToRange", () => {
  it("returns the full series for max", () => {
    expect(sliceToRange(priceHistory, "max", null)).toEqual(priceHistory);
  });

  it("returns only points within the trailing 7 calendar days of the last point for 7d", () => {
    const result = sliceToRange(priceHistory, "7d", null);
    expect(result).toEqual([
      { date: "2026-07-29", price: 115 },
      { date: "2026-07-30", price: 116 },
    ]);
  });

  it("returns only points within the trailing 30 calendar days of the last point for 30d", () => {
    const result = sliceToRange(priceHistory, "30d", null);
    expect(result).toEqual([
      { date: "2026-07-01", price: 110 },
      { date: "2026-07-15", price: 108 },
      { date: "2026-07-22", price: 112 },
      { date: "2026-07-29", price: 115 },
      { date: "2026-07-30", price: 116 },
    ]);
  });

  it("slices from firstTradeDate forward for sinceBuy", () => {
    const result = sliceToRange(priceHistory, "sinceBuy", "2026-07-01");
    expect(result).toEqual([
      { date: "2026-07-01", price: 110 },
      { date: "2026-07-15", price: 108 },
      { date: "2026-07-22", price: 112 },
      { date: "2026-07-29", price: 115 },
      { date: "2026-07-30", price: 116 },
    ]);
  });

  it("returns an empty slice, not a crash, when sinceBuy has no firstTradeDate", () => {
    expect(sliceToRange(priceHistory, "sinceBuy", null)).toEqual([]);
  });

  it("returns an empty slice, not a crash, for an empty priceHistory", () => {
    expect(sliceToRange([], "30d", null)).toEqual([]);
    expect(sliceToRange([], "max", null)).toEqual([]);
    expect(sliceToRange([], "sinceBuy", "2026-07-01")).toEqual([]);
  });

  it("returns whatever it has when the window requested is longer than available history", () => {
    const thin = [{ date: "2026-07-29", price: 115 }, { date: "2026-07-30", price: 116 }];
    expect(sliceToRange(thin, "30d", null)).toEqual(thin);
  });
});

describe("alignToDates", () => {
  it("returns available:true with values in the requested date order when every date is present", () => {
    const series = [
      { date: "2026-07-01", value: 400 },
      { date: "2026-07-02", value: 402 },
      { date: "2026-07-03", value: 405 },
    ];
    expect(alignToDates(series, ["2026-07-01", "2026-07-03"])).toEqual({
      available: true,
      values: [400, 405],
    });
  });

  it("returns available:false when the target series is missing any requested date", () => {
    const series = [
      { date: "2026-07-01", value: 400 },
      { date: "2026-07-03", value: 405 },
    ];
    expect(alignToDates(series, ["2026-07-01", "2026-07-02", "2026-07-03"])).toEqual({
      available: false,
    });
  });

  it("returns available:true with an empty values array when no dates are requested", () => {
    const series = [{ date: "2026-07-01", value: 400 }];
    expect(alignToDates(series, [])).toEqual({ available: true, values: [] });
  });

  it("returns available:false when the series itself is empty but dates are requested", () => {
    expect(alignToDates([], ["2026-07-01"])).toEqual({ available: false });
  });
});
