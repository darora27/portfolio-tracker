import { describe, expect, it } from "vitest";
import { fromAllTimeHigh } from "./all-time-high";

describe("fromAllTimeHigh", () => {
  it("computes the drop from the running peak and identifies its date", () => {
    const series = [
      { date: "2026-07-01", index: 100 },
      { date: "2026-07-02", index: 110 },
      { date: "2026-07-03", index: 105 },
      { date: "2026-07-04", index: 90 },
    ];
    const result = fromAllTimeHigh(series);
    expect(result?.peakDate).toBe("2026-07-02");
    expect(result?.pct).toBeCloseTo(90 / 110 - 1, 10);
  });

  it("is exactly 0 when the last point is itself the peak", () => {
    const series = [
      { date: "2026-07-01", index: 100 },
      { date: "2026-07-02", index: 90 },
      { date: "2026-07-03", index: 120 },
    ];
    const result = fromAllTimeHigh(series);
    expect(result?.pct).toBe(0);
    expect(result?.peakDate).toBe("2026-07-03");
  });

  it("is null for an empty series", () => {
    expect(fromAllTimeHigh([])).toBeNull();
  });
});
