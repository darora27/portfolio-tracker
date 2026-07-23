import { describe, expect, it } from "vitest";
import { trailingReturn } from "./trailing-return";

describe("trailingReturn", () => {
  it("compares the last point to the closest point on or before N days back", () => {
    const series = [
      { date: "2026-07-10", index: 95 },
      { date: "2026-07-15", index: 100 },
      { date: "2026-07-20", index: 102 },
      { date: "2026-07-22", index: 105 },
    ];
    expect(trailingReturn(series, 7)).toBeCloseTo(105 / 100 - 1, 12);
  });

  it("returns null when no point is old enough yet", () => {
    const series = [
      { date: "2026-07-20", index: 100 },
      { date: "2026-07-22", index: 105 },
    ];
    expect(trailingReturn(series, 7)).toBeNull();
  });

  it("returns null for an empty series", () => {
    expect(trailingReturn([], 7)).toBeNull();
  });

  it("returns null rather than dividing by zero when the reference point's index is 0", () => {
    const series = [
      { date: "2026-07-10", index: 0 },
      { date: "2026-07-22", index: 105 },
    ];
    expect(trailingReturn(series, 7)).toBeNull();
  });

  it("uses the exact target date when a point falls on it", () => {
    const series = [
      { date: "2026-07-15", index: 100 },
      { date: "2026-07-22", index: 110 },
    ];
    expect(trailingReturn(series, 7)).toBeCloseTo(0.1, 12);
  });
});
