import { describe, expect, it } from "vitest";
import { xirr } from "./xirr";

describe("xirr", () => {
  it("is exactly 10% for -1000 today, +1100 in exactly 365 days", () => {
    // NPV(r) = -1000 + 1100/(1+r)^(365/365) = 0  =>  1+r = 1.1  =>  r = 0.10
    const rate = xirr([
      { date: "2026-01-01", amount: -1000 },
      { date: "2027-01-01", amount: 1100 },
    ]);
    expect(rate).toBeCloseTo(0.1, 6);
  });

  it("is exactly 0% when the final flow exactly returns the investment", () => {
    // NPV(0) = -1000 + 1000 = 0 for any day-count convention, so r = 0 is
    // the exact root regardless of the dates chosen.
    const rate = xirr([
      { date: "2026-01-01", amount: -1000 },
      { date: "2026-07-20", amount: 1000 },
    ]);
    expect(rate).toBeCloseTo(0, 6);
  });

  it("matches a hand-solved quadratic for two equal contributions a year apart", () => {
    // -1000 at t=0, -1000 at t=1yr, +4000 at t=2yr.
    // NPV(r) = -1000 - 1000x + 4000x^2 = 0 where x = 1/(1+r)
    // => 4x^2 - x - 1 = 0 => x = (1 + sqrt(17)) / 8 => r = 1/x - 1
    const x = (1 + Math.sqrt(17)) / 8;
    const expectedRate = 1 / x - 1; // ≈ 0.5615528128088303

    const rate = xirr([
      { date: "2026-01-01", amount: -1000 },
      { date: "2027-01-01", amount: -1000 },
      { date: "2028-01-01", amount: 4000 },
    ]);
    expect(rate).toBeCloseTo(expectedRate, 4);
  });

  it("does not depend on the input order of cash flows", () => {
    const flows = [
      { date: "2027-01-01", amount: 1100 },
      { date: "2026-01-01", amount: -1000 },
    ];
    expect(xirr(flows)).toBeCloseTo(0.1, 6);
  });
});
