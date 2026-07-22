import { describe, expect, it } from "vitest";
import { beta } from "./beta";

describe("beta", () => {
  it("is exactly 2 when portfolio returns are always double the benchmark's", () => {
    // cov(2X, X) = 2 * var(X), so beta = cov / var(X) = 2 regardless of X's
    // actual values — a clean algebraic identity, not dependent on rounding.
    const benchmark = [0.01, -0.01, 0.02, -0.02];
    const portfolio = benchmark.map((r) => r * 2);
    expect(beta(portfolio, benchmark)).toBeCloseTo(2, 10);
  });

  it("is exactly 1 when portfolio returns equal the benchmark's", () => {
    const benchmark = [0.01, -0.015, 0.03, -0.005];
    expect(beta(benchmark, benchmark)).toBeCloseTo(1, 10);
  });

  it("is 0 when portfolio returns are uncorrelated with (orthogonal to) the benchmark", () => {
    // Symmetric portfolio returns around a benchmark that moves independently
    // and whose deviations sum to zero against portfolio deviations by
    // construction: cov = 0.
    const benchmark = [0.01, 0.02, 0.03, 0.04];
    const portfolio = [0.05, 0.05, 0.05, 0.05]; // constant -> variance 0 -> cov 0
    expect(beta(portfolio, benchmark)).toBe(0);
  });

  it("throws if the arrays are different lengths", () => {
    expect(() => beta([0.01], [0.01, 0.02])).toThrow();
  });
});
