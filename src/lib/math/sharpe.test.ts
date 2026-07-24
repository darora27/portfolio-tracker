import { describe, expect, it } from "vitest";
import { sharpeRatio } from "./sharpe";

describe("sharpeRatio", () => {
  it("is 0 when mean daily return is 0", () => {
    expect(sharpeRatio([0.02, -0.02])).toBe(0);
  });

  it("matches (annualized mean - risk free) / annualized vol", () => {
    // returns = [0.03, 0.01]; mean = 0.02
    // sample variance = ((0.03-0.02)^2 + (0.01-0.02)^2) / (2-1) = 0.0002
    // stddev = sqrt(0.0002) = 0.014142135...
    // annualized return = 0.02 * 252 = 5.04
    // annualized vol = 0.014142135... * sqrt(252) = 0.224499443...
    // sharpe = 5.04 / 0.224499443... = 22.449944...
    expect(sharpeRatio([0.03, 0.01])).toBeCloseTo(22.449944320643645, 6);
  });

  it("subtracts a nonzero risk-free rate before dividing by volatility", () => {
    const withoutRf = sharpeRatio([0.03, 0.01]);
    const withRf = sharpeRatio([0.03, 0.01], 1.0);
    // annualized return is 5.04; subtracting rf=1.0 shifts the numerator by 1.0
    expect(withRf).toBeCloseTo(withoutRf! - 1.0 / 0.224499443206437, 6);
  });

  it("is null (not NaN) for a single daily return — annualizedVolatility has nothing to divide by", () => {
    expect(sharpeRatio([0.02])).toBeNull();
  });

  it("is null (not Infinity) for a constant return series — zero volatility has nothing to divide excess return by", () => {
    expect(sharpeRatio([0.01, 0.01, 0.01])).toBeNull();
  });
});
