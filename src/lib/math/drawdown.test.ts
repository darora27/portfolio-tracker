import { describe, expect, it } from "vitest";
import { drawdown } from "./drawdown";

describe("drawdown", () => {
  it("tracks decline from the running peak of the cumulative growth index", () => {
    // Index: 1 -> 1.10 -> 0.88 -> 0.924
    //   r1=0.10: index=1.10, new peak, dd=0
    //   r2=-0.20: index=1.10*0.80=0.88, peak stays 1.10, dd=0.88/1.10-1=-0.2
    //   r3=0.05: index=0.88*1.05=0.924, peak stays 1.10, dd=0.924/1.10-1=-0.16
    const result = drawdown([0.1, -0.2, 0.05]);

    expect(result.series).toHaveLength(4);
    expect(result.series[0]).toBe(0);
    expect(result.series[1]).toBeCloseTo(0, 10);
    expect(result.series[2]).toBeCloseTo(-0.2, 10);
    expect(result.series[3]).toBeCloseTo(-0.16, 10);
    expect(result.maxDrawdown).toBeCloseTo(-0.2, 10);
  });

  it("is 0 when returns never decline from the peak", () => {
    const result = drawdown([0.01, 0.02, 0.03]);
    expect(result.maxDrawdown).toBe(0);
  });

  it("recognizes a new low even after a partial recovery", () => {
    // Index: 1 -> 0.5 -> 0.6 -> 0.2
    //   r1=-0.5: index=0.5, dd=-0.5
    //   r2=0.2: index=0.6, dd=0.6/1-1=-0.4 (still below the peak of 1)
    //   r3=-2/3: index=0.6*(1/3)=0.2, dd=0.2/1-1=-0.8 (new max drawdown)
    const result = drawdown([-0.5, 0.2, -2 / 3]);
    expect(result.maxDrawdown).toBeCloseTo(-0.8, 10);
  });
});
