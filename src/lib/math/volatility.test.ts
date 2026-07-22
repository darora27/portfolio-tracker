import { describe, expect, it } from "vitest";
import { annualizedVolatility } from "./volatility";

describe("annualizedVolatility", () => {
  it("annualizes sample stddev by sqrt(252)", () => {
    // returns = [0.02, -0.02]; mean = 0
    // sample variance = (0.02^2 + 0.02^2) / (2-1) = 0.0008
    // stddev = sqrt(0.0008) = 0.028284271247...
    // annualized = stddev * sqrt(252) = 0.448998886...
    expect(annualizedVolatility([0.02, -0.02])).toBeCloseTo(0.448998886412873, 10);
  });

  it("is 0 for a constant return series", () => {
    expect(annualizedVolatility([0.01, 0.01, 0.01])).toBe(0);
  });
});
