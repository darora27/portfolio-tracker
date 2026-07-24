import { describe, expect, it } from "vitest";
import { mean, sampleVariance, sampleStdDev } from "./stats";

describe("mean", () => {
  it("averages a plain array", () => {
    expect(mean([1, 2, 3])).toBe(2);
  });
});

describe("sampleVariance", () => {
  it("computes n-1 sample variance for a normal series", () => {
    // [2, 4]; mean 3; sum sq dev = 1+1 = 2; / (2-1) = 2
    expect(sampleVariance([2, 4])).toBe(2);
  });

  it("is null (not NaN) for a single value — nothing to compute a sample spread from", () => {
    expect(sampleVariance([5])).toBeNull();
  });

  it("is null (not NaN or a divide-by-zero artifact) for an empty array", () => {
    expect(sampleVariance([])).toBeNull();
  });
});

describe("sampleStdDev", () => {
  it("is the square root of sample variance", () => {
    expect(sampleStdDev([2, 4])).toBeCloseTo(Math.sqrt(2), 10);
  });

  it("is null when sampleVariance is null (fewer than 2 values)", () => {
    expect(sampleStdDev([5])).toBeNull();
    expect(sampleStdDev([])).toBeNull();
  });
});
